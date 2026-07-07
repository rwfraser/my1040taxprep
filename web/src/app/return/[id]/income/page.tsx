"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import TaxFieldGroup from "@/components/TaxFieldGroup";
import type { FieldInfo } from "@/types/tax";

/**
 * Income fields from Form 1040 lines 1-9 (page 1).
 * These correspond to master_schema keys for the income section.
 */
const INCOME_FIELDS: FieldInfo[] = [
  { key: "f1040_f1_31", label: "Wages, salaries, tips (from W-2 box 1)", type: "dollar", description: "Line 1a", required: "always", condition: "" },
  { key: "f1040_f1_41", label: "Tax-exempt interest", type: "dollar", description: "Line 2a", required: "optional", condition: "" },
  { key: "f1040_f1_42", label: "Taxable interest", type: "dollar", description: "Line 2b", required: "optional", condition: "" },
  { key: "f1040_f1_43", label: "Qualified dividends", type: "dollar", description: "Line 3a", required: "optional", condition: "" },
  { key: "f1040_f1_44", label: "Ordinary dividends", type: "dollar", description: "Line 3b", required: "optional", condition: "" },
  { key: "f1040_f1_45", label: "IRA distributions", type: "dollar", description: "Line 4a", required: "optional", condition: "" },
  { key: "f1040_f1_46", label: "Taxable IRA amount", type: "dollar", description: "Line 4b", required: "optional", condition: "" },
  { key: "f1040_f1_47", label: "Pensions and annuities", type: "dollar", description: "Line 5a", required: "optional", condition: "" },
  { key: "f1040_f1_48", label: "Taxable pension amount", type: "dollar", description: "Line 5b", required: "optional", condition: "" },
  { key: "f1040_f1_49", label: "Social security benefits", type: "dollar", description: "Line 6a", required: "optional", condition: "" },
  { key: "f1040_f1_50", label: "Taxable social security", type: "dollar", description: "Line 6b", required: "optional", condition: "" },
  { key: "f1040_f1_51", label: "Capital gain or (loss)", type: "dollar", description: "Line 7", required: "optional", condition: "" },
  { key: "f1040_f1_52", label: "Other income (from Schedule 1)", type: "dollar", description: "Line 8", required: "optional", condition: "" },
];

export default function IncomePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <FormWizard returnId={id} currentStep="income" />
      <h1 className="text-2xl font-bold mb-6">Income</h1>
      <p className="text-gray-600 mb-6">
        Enter your income from all sources. Wages are typically carried over
        from your W-2. Other amounts come from 1099 forms or Schedule 1.
      </p>
      <TaxFieldGroup
        returnId={id}
        formName="Form 1040"
        fields={INCOME_FIELDS}
        title="Form 1040 — Income"
      />
      <div className="mt-6 flex justify-between">
        <Link href={`/return/${id}/w2`} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          ← Back
        </Link>
        <Link
          href={`/return/${id}/deductions`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Next: Deductions →
        </Link>
      </div>
    </div>
  );
}
