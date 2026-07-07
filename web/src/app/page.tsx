"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { listReturns, deleteReturn, getFormData } from "@/lib/api";
import type { TaxReturn } from "@/types/tax";

const STATUS_LABELS: Record<string, string> = {
  draft: "In Progress",
  calculated: "Calculated",
  generated: "Forms Ready",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [returnNames, setReturnNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    listReturns()
      .then(async (data) => {
        setReturns(data.returns);
        // Fetch taxpayer names from saved Form 1040 data
        const names: Record<string, string> = {};
        await Promise.all(
          data.returns.map(async (ret) => {
            try {
              const fd = await getFormData(ret.id, "Form 1040");
              const first = String(fd.data.f1040_f1_04 || "");
              const last = String(fd.data.f1040_f1_05 || "");
              if (first || last) names[ret.id] = `${first} ${last}`.trim();
            } catch {
              // No personal info saved yet
            }
          }),
        );
        setReturnNames(names);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tax return?")) return;
    await deleteReturn(id);
    setReturns((prev) => prev.filter((r) => r.id !== id));
  };

  if (authLoading || loading) {
    return <p className="text-center text-gray-400 mt-16">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Tax Returns</h1>
        <Link
          href="/return/new"
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          + New Return
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No returns yet</h2>
          <p className="text-gray-600 mb-6">
            Start preparing your 2023 federal tax return.
          </p>
          <Link
            href="/return/new"
            className="bg-primary-600 text-white px-8 py-3 rounded-md text-lg hover:bg-primary-700"
          >
            Start My Return
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {returns.map((ret) => (
            <div key={ret.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {returnNames[ret.id]
                    ? `${returnNames[ret.id]} — ${ret.tax_year} Federal Return`
                    : `${ret.tax_year} Federal Return`}
                </p>
                <p className="text-sm text-gray-500">
                  {ret.filing_status.replace(/_/g, " ")} ·{" "}
                  <span
                    className={
                      ret.status === "generated"
                        ? "text-green-600"
                        : ret.status === "calculated"
                          ? "text-blue-600"
                          : "text-gray-500"
                    }
                  >
                    {STATUS_LABELS[ret.status] || ret.status}
                  </span>{" "}
                  · Updated{" "}
                  {new Date(ret.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/return/${ret.id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700"
                >
                  Continue
                </Link>
                <button
                  onClick={() => handleDelete(ret.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-2 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
