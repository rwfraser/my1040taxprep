"""
Pydantic models for request/response validation.
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ------------------------------------------------------------------ #
#  Enums                                                              #
# ------------------------------------------------------------------ #

class FilingStatus(str, Enum):
    single = "single"
    married_joint = "married_joint"
    married_separate = "married_separate"
    head_of_household = "head_of_household"
    qualifying_widow = "qualifying_widow"


class ReturnStatus(str, Enum):
    draft = "draft"
    calculated = "calculated"
    generated = "generated"


# ------------------------------------------------------------------ #
#  Tax Returns                                                        #
# ------------------------------------------------------------------ #

class TaxReturnCreate(BaseModel):
    tax_year: int = 2023
    filing_status: FilingStatus = FilingStatus.single


class TaxReturnResponse(BaseModel):
    id: str
    user_id: str
    tax_year: int
    filing_status: FilingStatus
    status: ReturnStatus
    created_at: datetime
    updated_at: datetime


class TaxReturnList(BaseModel):
    returns: list[TaxReturnResponse]


# ------------------------------------------------------------------ #
#  Form Data                                                          #
# ------------------------------------------------------------------ #

class FormDataUpdate(BaseModel):
    """Field values keyed by master_schema keys."""
    data: dict[str, Any]


class FormDataResponse(BaseModel):
    id: str
    return_id: str
    form_name: str
    data: dict[str, Any]
    updated_at: datetime


# ------------------------------------------------------------------ #
#  W-2 Input (convenience model — maps to master_schema fw2_* keys)   #
# ------------------------------------------------------------------ #

class W2Input(BaseModel):
    employer_name: str = ""
    employer_ein: str = ""
    wages: float = Field(0, description="Box 1: Wages, tips, other compensation")
    federal_tax_withheld: float = Field(0, description="Box 2: Federal income tax withheld")
    ss_wages: float = Field(0, description="Box 3: Social security wages")
    ss_tax_withheld: float = Field(0, description="Box 4: Social security tax withheld")
    medicare_wages: float = Field(0, description="Box 5: Medicare wages and tips")
    medicare_tax_withheld: float = Field(0, description="Box 6: Medicare tax withheld")
    ss_tips: float = Field(0, description="Box 7: Social security tips")
    allocated_tips: float = Field(0, description="Box 8: Allocated tips")
    dependent_care: float = Field(0, description="Box 10: Dependent care benefits")
    nonqualified_plans: float = Field(0, description="Box 11: Nonqualified plans")
    box_12_codes: dict[str, float] = Field(default_factory=dict, description="Box 12 codes and amounts")
    statutory_employee: bool = Field(False, description="Box 13: Statutory employee")
    retirement_plan: bool = Field(False, description="Box 13: Retirement plan")
    third_party_sick_pay: bool = Field(False, description="Box 13: Third-party sick pay")
    state: str = ""
    state_id: str = ""
    state_wages: float = Field(0, description="Box 16: State wages")
    state_tax_withheld: float = Field(0, description="Box 17: State income tax")


# ------------------------------------------------------------------ #
#  Calculation Result                                                  #
# ------------------------------------------------------------------ #

class CalculationSummary(BaseModel):
    total_income: float = 0
    adjusted_gross_income: float = 0
    taxable_income: float = 0
    total_tax: float = 0
    total_payments: float = 0
    refund: float = 0
    amount_owed: float = 0
    fields_computed: int = 0


class CalculationResponse(BaseModel):
    summary: CalculationSummary
    computed_values: dict[str, Any]


# ------------------------------------------------------------------ #
#  PDF Generation                                                      #
# ------------------------------------------------------------------ #

class GeneratedPdf(BaseModel):
    filename: str
    source_pdf: str
    fields_filled: int
    fields_available: int


class GenerateResponse(BaseModel):
    pdfs: list[GeneratedPdf]
    total_fields_filled: int


# ------------------------------------------------------------------ #
#  Schema Info                                                         #
# ------------------------------------------------------------------ #

class FormInfo(BaseModel):
    form_name: str
    field_count: int
    has_calculations: bool


class FieldInfo(BaseModel):
    key: str
    label: str
    type: str
    description: str
    required: str  # "always", "conditional", "optional"
    condition: str = ""


class FormSchemaResponse(BaseModel):
    form_name: str
    fields: list[FieldInfo]
