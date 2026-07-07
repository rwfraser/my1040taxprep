"use client";

import Link from "next/link";
import { WIZARD_STEPS } from "@/types/tax";

interface FormWizardProps {
  returnId: string;
  currentStep: string;
}

export default function FormWizard({ returnId, currentStep }: FormWizardProps) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="mb-8">
      <ol className="flex items-center gap-1 text-sm overflow-x-auto">
        {WIZARD_STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < currentIdx;
          const href =
            step.path === ""
              ? `/return/${returnId}`
              : `/return/${returnId}/${step.path}`;

          return (
            <li key={step.id} className="flex items-center">
              {idx > 0 && (
                <span className="mx-1 text-gray-300">›</span>
              )}
              <Link
                href={href}
                className={`px-3 py-1 rounded-full whitespace-nowrap ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : isCompleted
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
