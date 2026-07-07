"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import { calculateReturn } from "@/lib/api";
import type { CalculationSummary } from "@/types/tax";

function formatDollars(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<CalculationSummary | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await calculateReturn(id);
      setSummary(result.summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FormWizard returnId={id} currentStep="review" />
      <h1 className="text-2xl font-bold mb-6">Review & Calculate</h1>

      {!summary ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-600 mb-6">
            Click below to run the calculation engine on your entered data.
            This will compute your total income, deductions, tax, and
            refund or amount owed.
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
              {error}
            </p>
          )}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="bg-primary-600 text-white px-8 py-3 rounded-md text-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate My Return"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Return Summary</h2>
            <dl className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Total Income</dt>
                <dd className="font-medium">{formatDollars(summary.total_income)}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Adjusted Gross Income</dt>
                <dd className="font-medium">{formatDollars(summary.adjusted_gross_income)}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Taxable Income</dt>
                <dd className="font-medium">{formatDollars(summary.taxable_income)}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Total Tax</dt>
                <dd className="font-medium">{formatDollars(summary.total_tax)}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Total Payments</dt>
                <dd className="font-medium">{formatDollars(summary.total_payments)}</dd>
              </div>
              {summary.refund > 0 && (
                <div className="flex justify-between pt-2">
                  <dt className="text-green-700 font-semibold text-lg">Refund</dt>
                  <dd className="text-green-700 font-bold text-lg">
                    {formatDollars(summary.refund)}
                  </dd>
                </div>
              )}
              {summary.amount_owed > 0 && (
                <div className="flex justify-between pt-2">
                  <dt className="text-red-700 font-semibold text-lg">Amount Owed</dt>
                  <dd className="text-red-700 font-bold text-lg">
                    {formatDollars(summary.amount_owed)}
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-gray-400 mt-4">
              {summary.fields_computed} fields computed by the calculation engine
            </p>
          </div>

          <div className="flex justify-between">
            <Link href={`/return/${id}/credits`} className="text-gray-600 hover:text-gray-900 px-4 py-2">
              ← Back
            </Link>
            <Link
              href={`/return/${id}/download`}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              Next: Download Forms →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
