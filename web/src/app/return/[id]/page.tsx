"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import TaxFieldGroup from "@/components/TaxFieldGroup";
import type { FieldInfo } from "@/types/tax";

/**
 * Personal Info step — curated fields from Form 1040 header.
 * Rather than showing all 12,779 fields, we present the human-friendly
 * fields that every taxpayer must complete first.
 */
const PERSONAL_FIELDS: FieldInfo[] = [
  { key: "f1040_f1_04", label: "First name", type: "text", description: "", required: "always", condition: "" },
  { key: "f1040_f1_05", label: "Last name", type: "text", description: "", required: "always", condition: "" },
  { key: "f1040_f1_06", label: "Your Social Security number", type: "ssn", description: "", required: "always", condition: "" },
  { key: "f1040_f1_07", label: "Spouse's first name (if joint)", type: "text", description: "", required: "optional", condition: "" },
  { key: "f1040_f1_08", label: "Spouse's last name", type: "text", description: "", required: "optional", condition: "" },
  { key: "f1040_f1_09", label: "Spouse's SSN", type: "ssn", description: "", required: "optional", condition: "" },
  { key: "f1040_f1_13", label: "Home address (number and street)", type: "text", description: "", required: "always", condition: "" },
  { key: "f1040_f1_14", label: "Apt. no.", type: "text", description: "", required: "optional", condition: "" },
  { key: "f1040_f1_15", label: "City, town, or post office", type: "text", description: "", required: "always", condition: "" },
  { key: "f1040_f1_16", label: "State", type: "text", description: "", required: "always", condition: "" },
  { key: "f1040_f1_17", label: "ZIP code", type: "text", description: "", required: "always", condition: "" },
];

export default function ReturnPersonalPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <FormWizard returnId={id} currentStep="personal" />
      <h1 className="text-2xl font-bold mb-6">Personal Information</h1>
      <TaxFieldGroup
        returnId={id}
        formName="Form 1040"
        fields={PERSONAL_FIELDS}
        title="Your Information"
      />
      <div className="mt-6 flex justify-end">
        <Link
          href={`/return/${id}/w2`}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Next: W-2 Income →
        </Link>
      </div>
    </div>
  );
}
