"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import TaxFieldGroup from "@/components/TaxFieldGroup";
import type { FieldInfo } from "@/types/tax";

const TAX_AND_CREDITS_FIELDS: FieldInfo[] = [
  { key: "f1040_f2_02", label: "Tax (from Tax Table or Qualified Dividends worksheet)", type: "dollar", description: "Line 16", required: "optional", condition: "" },
  { key: "f1040_f2_05", label: "Child tax credit / credit for other dependents", type: "dollar", description: "Line 19", required: "optional", condition: "" },
  { key: "f1040_f2_11", label: "Federal income tax withheld (from W-2s)", type: "dollar", description: "Line 25a", required: "optional", condition: "" },
  { key: "f1040_f2_15", label: "Estimated tax payments", type: "dollar", description: "Line 26", required: "optional", condition: "" },
  { key: "f1040_f2_16", label: "Earned income credit (EIC)", type: "dollar", description: "Line 27", required: "optional", condition: "" },
  { key: "f1040_f2_17", label: "Additional child tax credit", type: "dollar", description: "Line 28", required: "optional", condition: "" },
  { key: "f1040_f2_18", label: "American opportunity credit", type: "dollar", description: "Line 29", required: "optional", condition: "" },
];

export default function CreditsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <FormWizard returnId={id} currentStep="credits" />
      <h1 className="text-2xl font-bold mb-6">Tax & Credits</h1>
      <p className="text-gray-600 mb-6">
        Enter any tax credits you qualify for. Many of these will be calculated
        automatically when you review your return.
      </p>
      <TaxFieldGroup
        returnId={id}
        formName="Form 1040"
        fields={TAX_AND_CREDITS_FIELDS}
        title="Form 1040 — Tax & Credits"
      />
      <div className="mt-6 flex justify-between">
        <Link href={`/return/${id}/deductions`} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          ← Back
        </Link>
        <Link
          href={`/return/${id}/review`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Next: Review & Calculate →
        </Link>
      </div>
    </div>
  );
}
