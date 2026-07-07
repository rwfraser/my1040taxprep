"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FormWizard from "@/components/FormWizard";
import { generatePdfs, downloadPdf } from "@/lib/api";
import type { GeneratedPdf } from "@/types/tax";

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfs, setPdfs] = useState<GeneratedPdf[]>([]);
  const [totalFilled, setTotalFilled] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await generatePdfs(id);
      setPdfs(result.pdfs);
      setTotalFilled(result.total_fields_filled);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FormWizard returnId={id} currentStep="download" />
      <h1 className="text-2xl font-bold mb-6">Download Tax Forms</h1>

      {pdfs.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-600 mb-6">
            Generate your completed IRS tax forms as filled PDFs ready for
            filing. Make sure you have calculated your return first.
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
              {error}
            </p>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary-600 text-white px-8 py-3 rounded-md text-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Generating PDFs..." : "Generate Tax Forms"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              {pdfs.length} form(s) generated with {totalFilled} fields filled
            </p>
          </div>

          <div className="bg-white rounded-lg border divide-y">
            {pdfs.map((pdf) => (
              <div
                key={pdf.filename}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{pdf.filename}</p>
                  <p className="text-sm text-gray-500">
                    {pdf.fields_filled} of {pdf.fields_available} fields filled
                  </p>
                </div>
                <button
                  onClick={() => downloadPdf(id, pdf.filename)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link href={`/return/${id}/review`} className="text-gray-600 hover:text-gray-900 px-4 py-2">
          ← Back to Review
        </Link>
      </div>
    </div>
  );
}
