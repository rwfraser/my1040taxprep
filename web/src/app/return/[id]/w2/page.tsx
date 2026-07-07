"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import TaxFieldGroup from "@/components/TaxFieldGroup";
import type { FieldInfo } from "@/types/tax";

const W2_FIELDS: FieldInfo[] = [
  { key: "fw2_f1_01", label: "Employer's name", type: "text", description: "Box c", required: "always", condition: "" },
  { key: "fw2_f1_02", label: "Employer's EIN", type: "text", description: "Box b", required: "always", condition: "" },
  { key: "fw2_f1_03", label: "Wages, tips, other compensation", type: "dollar", description: "Box 1", required: "always", condition: "" },
  { key: "fw2_f1_04", label: "Federal income tax withheld", type: "dollar", description: "Box 2", required: "always", condition: "" },
  { key: "fw2_f1_05", label: "Social security wages", type: "dollar", description: "Box 3", required: "optional", condition: "" },
  { key: "fw2_f1_06", label: "Social security tax withheld", type: "dollar", description: "Box 4", required: "optional", condition: "" },
  { key: "fw2_f1_07", label: "Medicare wages and tips", type: "dollar", description: "Box 5", required: "optional", condition: "" },
  { key: "fw2_f1_08", label: "Medicare tax withheld", type: "dollar", description: "Box 6", required: "optional", condition: "" },
  { key: "fw2_f1_09", label: "Social security tips", type: "dollar", description: "Box 7", required: "optional", condition: "" },
  { key: "fw2_f1_10", label: "Allocated tips", type: "dollar", description: "Box 8", required: "optional", condition: "" },
  { key: "fw2_f1_13", label: "Dependent care benefits", type: "dollar", description: "Box 10", required: "optional", condition: "" },
  { key: "fw2_f1_14", label: "Nonqualified plans", type: "dollar", description: "Box 11", required: "optional", condition: "" },
  { key: "fw2_f1_21", label: "State", type: "text", description: "Box 15", required: "optional", condition: "" },
  { key: "fw2_f1_22", label: "State wages, tips, etc.", type: "dollar", description: "Box 16", required: "optional", condition: "" },
  { key: "fw2_f1_23", label: "State income tax", type: "dollar", description: "Box 17", required: "optional", condition: "" },
];

export default function W2Page() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <FormWizard returnId={id} currentStep="w2" />
      <h1 className="text-2xl font-bold mb-6">W-2 Wage and Tax Statement</h1>
      <p className="text-gray-600 mb-6">
        Enter the information from your W-2 form(s). If you have multiple W-2s,
        enter the totals or return to add additional forms.
      </p>
      <TaxFieldGroup
        returnId={id}
        formName="Form W2"
        fields={W2_FIELDS}
        title="W-2 Details"
      />
      <div className="mt-6 flex justify-between">
        <Link
          href={`/return/${id}`}
          className="text-gray-600 hover:text-gray-900 px-4 py-2"
        >
          ← Back
        </Link>
        <Link
          href={`/return/${id}/income`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Next: Other Income →
        </Link>
      </div>
    </div>
  );
}
