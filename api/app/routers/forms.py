"""
Form data, calculation, and PDF generation endpoints.
"""

import json
import os
import sys
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.auth import get_current_user
from app.config import get_settings
from app.models import (
    FormDataUpdate,
    FormDataResponse,
    CalculationResponse,
    CalculationSummary,
    GenerateResponse,
    GeneratedPdf,
)
from app import database as db

router = APIRouter(prefix="/returns/{return_id}", tags=["forms"])


# ------------------------------------------------------------------ #
#  Pipeline imports (add pipeline dir to sys.path)                     #
# ------------------------------------------------------------------ #

def _ensure_pipeline_path():
    settings = get_settings()
    pipeline_str = str(settings.PIPELINE_DIR)
    if pipeline_str not in sys.path:
        sys.path.insert(0, pipeline_str)


def _get_pipeline_config():
    """Return a pipeline Config object with paths configured.

    The pipeline's Config has a hardcoded Windows BASE_DIR. We override it
    so SCHEMAS_DET_DIR and other paths resolve correctly on any machine.
    """
    _ensure_pipeline_path()
    from config import Config as PipelineConfig  # noqa: E402

    cfg = PipelineConfig()
    settings = get_settings()

    # Use explicit PIPELINE_BASE_DIR if set, otherwise derive from PIPELINE_DIR
    base = os.environ.get("PIPELINE_BASE_DIR", "")
    if base:
        cfg.BASE_DIR = Path(base)
    else:
        # On local dev, schemas_det/ lives inside the pipeline directory
        cfg.BASE_DIR = settings.PIPELINE_DIR
    return cfg


# ------------------------------------------------------------------ #
#  Form Data                                                          #
# ------------------------------------------------------------------ #

@router.get("/forms/{form_name}", response_model=FormDataResponse)
def get_form_data(
    return_id: str,
    form_name: str,
    user_id: str = Depends(get_current_user),
):
    _verify_return_ownership(return_id, user_id)
    row = db.get_form_data(return_id, form_name)
    if not row:
        raise HTTPException(status_code=404, detail="No data for this form")
    return row


@router.put("/forms/{form_name}", response_model=FormDataResponse)
def save_form_data(
    return_id: str,
    form_name: str,
    body: FormDataUpdate,
    user_id: str = Depends(get_current_user),
):
    _verify_return_ownership(return_id, user_id)
    row = db.upsert_form_data(return_id, form_name, body.data)
    return row


# ------------------------------------------------------------------ #
#  Calculation                                                         #
# ------------------------------------------------------------------ #

@router.post("/calculate", response_model=CalculationResponse)
def calculate_return(
    return_id: str,
    user_id: str = Depends(get_current_user),
):
    _verify_return_ownership(return_id, user_id)

    # Gather all saved form data into a single user_data dict
    all_forms = db.get_all_form_data(return_id)
    user_data: dict = {}
    for form in all_forms:
        user_data.update(form.get("data", {}))

    if not user_data:
        raise HTTPException(status_code=400, detail="No form data to calculate")

    # Map W-2 values to 1040 lines (unless user already entered them directly)
    _apply_w2_to_1040(user_data)

    # Run calc engine
    _ensure_pipeline_path()
    from calc_engine import compute_return  # noqa: E402

    pipeline_cfg = _get_pipeline_config()
    computed = compute_return(user_data, pipeline_cfg)

    # Build summary from 1040 fields (keys from line_map.json)
    # Line 9  (total income)  → f1040_f1_53
    # Line 11 (AGI)           → f1040_f1_55
    # Line 15 (taxable income) → f1040_f1_59
    # Line 24 (total tax)     → f1040_f2_10
    # Line 33 (total payments) → f1040_f2_22
    # Line 34 (overpaid/refund) → f1040_f2_23
    # Line 35a (refund)       → f1040_f2_24
    # Line 37 (amount owed)   → f1040_f2_28
    summary = CalculationSummary(
        total_income=_f(computed.get("f1040_f1_53", 0)),
        adjusted_gross_income=_f(computed.get("f1040_f1_55", 0)),
        taxable_income=_f(computed.get("f1040_f1_59", 0)),
        total_tax=_f(computed.get("f1040_f2_10", 0)),
        total_payments=_f(computed.get("f1040_f2_22", 0)),
        refund=_f(computed.get("f1040_f2_24", 0)),
        amount_owed=_f(computed.get("f1040_f2_28", 0)),
        fields_computed=len(computed) - len(user_data),
    )

    # Save computed values back as form data
    db.upsert_form_data(return_id, "__computed__", computed)
    db.update_return_status(return_id, "calculated")

    return CalculationResponse(summary=summary, computed_values=computed)


# ------------------------------------------------------------------ #
#  PDF Generation                                                      #
# ------------------------------------------------------------------ #

@router.post("/generate", response_model=GenerateResponse)
def generate_pdfs(
    return_id: str,
    user_id: str = Depends(get_current_user),
):
    _verify_return_ownership(return_id, user_id)

    # Get the computed data (run calculate first if needed)
    computed_form = db.get_form_data(return_id, "__computed__")
    if not computed_form:
        raise HTTPException(
            status_code=400,
            detail="Run /calculate first before generating PDFs",
        )

    user_data = computed_form["data"]

    # Run PDF filler
    _ensure_pipeline_path()
    from pdf_filler import fill_return  # noqa: E402

    pipeline_cfg = _get_pipeline_config()
    output_dir = Path(tempfile.mkdtemp(prefix="tax_pdfs_"))

    manifest = fill_return(user_data, output_dir, pipeline_cfg)

    # Save PDF records to DB
    pdfs = []
    for pdf_info in manifest.get("pdfs_generated", []):
        db.save_generated_pdf(
            return_id,
            pdf_info["filename"],
            str(output_dir / pdf_info["filename"]),
        )
        pdfs.append(GeneratedPdf(
            filename=pdf_info["filename"],
            source_pdf=pdf_info["source_pdf"],
            fields_filled=pdf_info["fields_filled"],
            fields_available=pdf_info["fields_available"],
        ))

    db.update_return_status(return_id, "generated")

    return GenerateResponse(
        pdfs=pdfs,
        total_fields_filled=manifest.get("total_fields_filled", 0),
    )


@router.get("/download/{filename}")
def download_pdf(
    return_id: str,
    filename: str,
    user_id: str = Depends(get_current_user),
):
    _verify_return_ownership(return_id, user_id)

    # Find the PDF record
    pdf_records = db.list_generated_pdfs(return_id)
    record = next((r for r in pdf_records if r["filename"] == filename), None)
    if not record:
        raise HTTPException(status_code=404, detail="PDF not found")

    file_path = Path(record["storage_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PDF file no longer available")

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=filename,
    )


# ------------------------------------------------------------------ #
#  Helpers                                                             #
# ------------------------------------------------------------------ #

def _verify_return_ownership(return_id: str, user_id: str):
    ret = db.get_return(return_id, user_id)
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")


def _apply_w2_to_1040(user_data: dict) -> None:
    """Carry W-2 box values into 1040 lines if not already set.

    W-2 data is stored under fw2_* keys; the calc engine needs
    the corresponding f1040_* keys to include wages in calculations.
    """
    w2_to_1040 = {
        # W-2 Box 1 (wages) → 1040 Line 1a
        "fw2_f1_03": "f1040_f1_31",
        # W-2 Box 2 (federal tax withheld) → 1040 Line 25a
        "fw2_f1_04": "f1040_f2_11",
    }
    for w2_key, f1040_key in w2_to_1040.items():
        w2_val = user_data.get(w2_key)
        if w2_val and not user_data.get(f1040_key):
            user_data[f1040_key] = w2_val


def _f(val) -> float:
    """Safely convert a value to float."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0
