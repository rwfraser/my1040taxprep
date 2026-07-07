"""
Schema endpoints — serve form metadata to the frontend.
"""

import json
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models import FormInfo, FieldInfo, FormSchemaResponse

router = APIRouter(prefix="/schema", tags=["schema"])


# ------------------------------------------------------------------ #
#  Cached schema loaders                                              #
# ------------------------------------------------------------------ #

@lru_cache()
def _load_master_schema() -> dict:
    path = get_settings().SCHEMAS_DET_DIR / "master_schema.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache()
def _load_mandatory_map() -> dict:
    path = get_settings().SCHEMAS_DET_DIR / "mandatory_map.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache()
def _load_calc_table() -> list:
    path = get_settings().SCHEMAS_DET_DIR / "calc_table.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _group_fields_by_form() -> dict[str, list[tuple[str, dict]]]:
    """Group master_schema entries by form name."""
    schema = _load_master_schema()
    by_form: dict[str, list[tuple[str, dict]]] = {}
    for key, entry in schema.items():
        form_name = entry.get("form", "Unknown")
        by_form.setdefault(form_name, []).append((key, entry))
    return by_form


def _forms_with_calcs() -> set[str]:
    """Return set of form names that have calculations."""
    calcs = _load_calc_table()
    forms = set()
    for c in calcs:
        output = c.get("output", "")
        if "_line_" in output:
            prefix = output.rsplit("_line_", 1)[0]
            forms.add(prefix)
    return forms


def _get_field_requirement(key: str, form_name: str) -> tuple[str, str]:
    """Return (requirement_level, condition) for a field."""
    mandatory = _load_mandatory_map()
    form_map = mandatory.get(form_name)
    if not form_map:
        return ("optional", "")

    if key in form_map.get("always_required", []):
        return ("always", "")

    for cond in form_map.get("conditionally_required", []):
        if cond.get("field") == key:
            return ("conditional", cond.get("condition", ""))

    return ("optional", "")


# ------------------------------------------------------------------ #
#  Endpoints                                                          #
# ------------------------------------------------------------------ #

@router.get("/forms", response_model=list[FormInfo])
def list_forms():
    """List all available forms with field counts."""
    by_form = _group_fields_by_form()
    calc_forms = _forms_with_calcs()

    result = []
    for form_name, fields in sorted(by_form.items()):
        # Check if any field key prefix matches a calc form prefix
        has_calcs = any(
            key.rsplit("_f", 1)[0] in calc_forms or key.split("_")[0] in calc_forms
            for key, _ in fields[:5]  # Check first few fields
        )
        result.append(FormInfo(
            form_name=form_name,
            field_count=len(fields),
            has_calculations=has_calcs,
        ))
    return result


@router.get("/forms/{form_name}", response_model=FormSchemaResponse)
def get_form_schema(form_name: str):
    """Get all fields for a specific form with types and labels."""
    by_form = _group_fields_by_form()
    fields = by_form.get(form_name)
    if not fields:
        raise HTTPException(status_code=404, detail=f"Form '{form_name}' not found")

    field_infos = []
    for key, entry in fields:
        req, cond = _get_field_requirement(key, form_name)
        field_infos.append(FieldInfo(
            key=key,
            label=entry.get("label", ""),
            type=entry.get("type", "text"),
            description=entry.get("description", ""),
            required=req,
            condition=cond,
        ))

    return FormSchemaResponse(form_name=form_name, fields=field_infos)
