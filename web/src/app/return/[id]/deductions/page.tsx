"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import TaxFieldGroup from "@/components/TaxFieldGroup";
import type { FieldInfo } from "@/types/tax";

const DEDUCTION_FIELDS: FieldInfo[] = [
  { key: "f1040_f1_56", label: "Standard deduction or itemized deductions", type: "dollar", description: "Line 12", required: "always", condition: "" },
  { key: "f1040_f1_57", label: "Qualified business income deduction", type: "dollar", description: "Line 13", required: "optional", condition: "" },
];

const SCHEDULE_A_FIELDS: FieldInfo[] = [
  { key: "fsa_f1_01", label: "Medical and dental expenses", type: "dollar", description: "Line 1", required: "optional", condition: "" },
  { key: "fsa_f1_04", label: "State and local taxes (SALT)", type: "dollar", description: "Line 5a", required: "optional", condition: "" },
  { key: "fsa_f1_08", label: "Home mortgage interest", type: "dollar", description: "Line 8a", required: "optional", condition: "" },
  { key: "fsa_f1_12", label: "Gifts to charity (cash)", type: "dollar", description: "Line 12", required: "optional", condition: "" },
  { key: "fsa_f1_13", label: "Gifts to charity (non-cash)", type: "dollar", description: "Line 13", required: "optional", condition: "" },
  { key: "fsa_f1_15", label: "Casualty and theft losses", type: "dollar", description: "Line 15", required: "optional", condition: "" },
  { key: "fsa_f1_16", label: "Other itemized deductions", type: "dollar", description: "Line 16", required: "optional", condition: "" },
];

export default function DeductionsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <FormWizard returnId={id} currentStep="deductions" />
      <h1 className="text-2xl font-bold mb-6">Deductions</h1>
      <p className="text-gray-600 mb-6">
        Enter your standard deduction, or fill in Schedule A to itemize.
        The 2023 standard deduction is $13,850 (single) or $27,700 (married filing jointly).
      </p>
      <TaxFieldGroup
        returnId={id}
        formName="Form 1040"
        fields={DEDUCTION_FIELDS}
        title="Form 1040 — Deductions"
      />
      <div className="mt-6">
        <TaxFieldGroup
          returnId={id}
          formName="Schedule A (Form 1040)"
          fields={SCHEDULE_A_FIELDS}
          title="Schedule A — Itemized Deductions (if applicable)"
        />
      </div>
      <div className="mt-6 flex justify-between">
        <Link href={`/return/${id}/income`} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          ← Back
        </Link>
        <Link
          href={`/return/${id}/credits`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Next: Credits →
        </Link>
      </div>
    </div>
  );
}
