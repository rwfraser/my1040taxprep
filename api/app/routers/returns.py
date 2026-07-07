"""
Tax returns CRUD endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.models import TaxReturnCreate, TaxReturnResponse, TaxReturnList
from app import database as db

router = APIRouter(prefix="/returns", tags=["returns"])


@router.post("", response_model=TaxReturnResponse, status_code=status.HTTP_201_CREATED)
def create_return(
    body: TaxReturnCreate,
    user_id: str = Depends(get_current_user),
):
    row = db.create_return(user_id, body.tax_year, body.filing_status.value)
    return row


@router.get("", response_model=TaxReturnList)
def list_returns(user_id: str = Depends(get_current_user)):
    rows = db.list_returns(user_id)
    return {"returns": rows}


@router.get("/{return_id}", response_model=TaxReturnResponse)
def get_return(return_id: str, user_id: str = Depends(get_current_user)):
    row = db.get_return(return_id, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="Return not found")
    return row


@router.delete("/{return_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_return(return_id: str, user_id: str = Depends(get_current_user)):
    deleted = db.delete_return(return_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Return not found")
