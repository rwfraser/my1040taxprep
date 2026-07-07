"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReturn } from "@/lib/api";
import type { FilingStatus } from "@/types/tax";

const FILING_STATUSES: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married_joint", label: "Married Filing Jointly" },
  { value: "married_separate", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_widow", label: "Qualifying Surviving Spouse" },
];

export default function NewReturnPage() {
  const router = useRouter();
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const ret = await createReturn({
        tax_year: 2023,
        filing_status: filingStatus,
      });
      router.push(`/return/${ret.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Start a New Tax Return</h1>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <p className="text-sm font-medium mb-1">Tax Year</p>
          <p className="text-lg font-semibold">2023</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Filing Status
          </label>
          <div className="space-y-2">
            {FILING_STATUSES.map((fs) => (
              <label
                key={fs.value}
                className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="filing_status"
                  value={fs.value}
                  checked={filingStatus === fs.value}
                  onChange={() => setFilingStatus(fs.value)}
                  className="h-4 w-4"
                />
                <span>{fs.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-md text-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Begin My Return"}
        </button>
      </div>
    </div>
  );
}
