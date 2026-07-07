"""
Supabase database client and query helpers.
"""

from datetime import datetime, timezone
from typing import Any

from supabase import create_client, Client

from app.config import get_settings


_client: Client | None = None


def get_db() -> Client:
    """Return a cached Supabase client (service-role key for server-side access)."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


# ------------------------------------------------------------------ #
#  Tax Returns                                                        #
# ------------------------------------------------------------------ #

def create_return(user_id: str, tax_year: int, filing_status: str) -> dict:
    db = get_db()
    row = {
        "user_id": user_id,
        "tax_year": tax_year,
        "filing_status": filing_status,
        "status": "draft",
    }
    result = db.table("tax_returns").insert(row).execute()
    return result.data[0]


def list_returns(user_id: str) -> list[dict]:
    db = get_db()
    result = (
        db.table("tax_returns")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def get_return(return_id: str, user_id: str) -> dict | None:
    db = get_db()
    result = (
        db.table("tax_returns")
        .select("*")
        .eq("id", return_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


def update_return_status(return_id: str, status: str) -> dict | None:
    db = get_db()
    result = (
        db.table("tax_returns")
        .update({"status": status, "updated_at": _now_iso()})
        .eq("id", return_id)
        .execute()
    )
    return result.data[0] if result.data else None


def delete_return(return_id: str, user_id: str) -> bool:
    db = get_db()
    # Also delete related form_data and generated_pdfs (cascade via FK or manual)
    db.table("form_data").delete().eq("return_id", return_id).execute()
    db.table("generated_pdfs").delete().eq("return_id", return_id).execute()
    result = (
        db.table("tax_returns")
        .delete()
        .eq("id", return_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0


# ------------------------------------------------------------------ #
#  Form Data                                                          #
# ------------------------------------------------------------------ #

def get_form_data(return_id: str, form_name: str) -> dict | None:
    db = get_db()
    result = (
        db.table("form_data")
        .select("*")
        .eq("return_id", return_id)
        .eq("form_name", form_name)
        .execute()
    )
    return result.data[0] if result.data else None


def upsert_form_data(return_id: str, form_name: str, data: dict[str, Any]) -> dict:
    db = get_db()
    existing = get_form_data(return_id, form_name)
    if existing:
        # Merge new data into existing (partial updates)
        merged = {**existing["data"], **data}
        result = (
            db.table("form_data")
            .update({"data": merged, "updated_at": _now_iso()})
            .eq("id", existing["id"])
            .execute()
        )
        return result.data[0]
    else:
        row = {
            "return_id": return_id,
            "form_name": form_name,
            "data": data,
        }
        result = db.table("form_data").insert(row).execute()
        return result.data[0]


def get_all_form_data(return_id: str) -> list[dict]:
    db = get_db()
    result = (
        db.table("form_data")
        .select("*")
        .eq("return_id", return_id)
        .execute()
    )
    return result.data


# ------------------------------------------------------------------ #
#  Generated PDFs                                                      #
# ------------------------------------------------------------------ #

def save_generated_pdf(return_id: str, filename: str, storage_path: str) -> dict:
    db = get_db()
    row = {
        "return_id": return_id,
        "filename": filename,
        "storage_path": storage_path,
    }
    result = db.table("generated_pdfs").insert(row).execute()
    return result.data[0]


def list_generated_pdfs(return_id: str) -> list[dict]:
    db = get_db()
    result = (
        db.table("generated_pdfs")
        .select("*")
        .eq("return_id", return_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


# ------------------------------------------------------------------ #
#  Helpers                                                             #
# ------------------------------------------------------------------ #

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
