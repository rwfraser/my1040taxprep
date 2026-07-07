// ----------------------------------------------------------------
// Enums
// ----------------------------------------------------------------

export type FilingStatus =
  | "single"
  | "married_joint"
  | "married_separate"
  | "head_of_household"
  | "qualifying_widow";

export type ReturnStatus = "draft" | "calculated" | "generated";

export type FieldType =
  | "text"
  | "dollar"
  | "ssn"
  | "checkbox"
  | "date"
  | "integer"
  | "percentage"
  | "choice";

export type RequirementLevel = "always" | "conditional" | "optional";

// ----------------------------------------------------------------
// Tax Returns
// ----------------------------------------------------------------

export interface TaxReturn {
  id: string;
  user_id: string;
  tax_year: number;
  filing_status: FilingStatus;
  status: ReturnStatus;
  created_at: string;
  updated_at: string;
}

export interface TaxReturnCreate {
  tax_year: number;
  filing_status: FilingStatus;
}

// ----------------------------------------------------------------
// Form Data
// ----------------------------------------------------------------

export interface FormData {
  id: string;
  return_id: string;
  form_name: string;
  data: Record<string, unknown>;
  updated_at: string;
}

// ----------------------------------------------------------------
// Calculation
// ----------------------------------------------------------------

export interface CalculationSummary {
  total_income: number;
  adjusted_gross_income: number;
  taxable_income: number;
  total_tax: number;
  total_payments: number;
  refund: number;
  amount_owed: number;
  fields_computed: number;
}

export interface CalculationResponse {
  summary: CalculationSummary;
  computed_values: Record<string, unknown>;
}

// ----------------------------------------------------------------
// PDF Generation
// ----------------------------------------------------------------

export interface GeneratedPdf {
  filename: string;
  source_pdf: string;
  fields_filled: number;
  fields_available: number;
}

export interface GenerateResponse {
  pdfs: GeneratedPdf[];
  total_fields_filled: number;
}

// ----------------------------------------------------------------
// Schema
// ----------------------------------------------------------------

export interface FormInfo {
  form_name: string;
  field_count: number;
  has_calculations: boolean;
}

export interface FieldInfo {
  key: string;
  label: string;
  type: FieldType;
  description: string;
  required: RequirementLevel;
  condition: string;
}

export interface FormSchema {
  form_name: string;
  fields: FieldInfo[];
}

// ----------------------------------------------------------------
// Wizard Steps
// ----------------------------------------------------------------

export interface WizardStep {
  id: string;
  label: string;
  path: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "personal",
    label: "Personal Info",
    path: "",
    description: "Name, SSN, filing status, and address",
  },
  {
    id: "w2",
    label: "W-2 Income",
    path: "w2",
    description: "Wages and salary from employers",
  },
  {
    id: "income",
    label: "Other Income",
    path: "income",
    description: "Interest, dividends, and other income",
  },
  {
    id: "deductions",
    label: "Deductions",
    path: "deductions",
    description: "Standard or itemized deductions",
  },
  {
    id: "credits",
    label: "Credits",
    path: "credits",
    description: "Tax credits you may qualify for",
  },
  {
    id: "review",
    label: "Review",
    path: "review",
    description: "Review and calculate your return",
  },
  {
    id: "download",
    label: "Download",
    path: "download",
    description: "Download completed tax forms",
  },
];
