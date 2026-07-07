"use client";

import type { FieldInfo } from "@/types/tax";

interface FormFieldProps {
  field: FieldInfo;
  value: string | boolean;
  onChange: (key: string, value: string | boolean) => void;
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  const required = field.required === "always";
  const labelText = field.label || field.description || field.key;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(field.key, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span className="text-sm">{labelText}</span>
        {field.required === "conditional" && (
          <span className="text-xs text-amber-600" title={field.condition}>
            (conditional)
          </span>
        )}
      </label>
    );
  }

  const inputProps = {
    id: field.key,
    value: typeof value === "string" ? value : String(value ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(field.key, e.target.value),
    required,
    className:
      "w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
  };

  let inputElement: React.ReactNode;

  switch (field.type) {
    case "dollar":
      inputElement = (
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
          <input
            {...inputProps}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className={inputProps.className + " pl-7"}
          />
        </div>
      );
      break;

    case "ssn":
      inputElement = (
        <input
          {...inputProps}
          type="text"
          inputMode="numeric"
          maxLength={11}
          placeholder="XXX-XX-XXXX"
        />
      );
      break;

    case "integer":
      inputElement = (
        <input
          {...inputProps}
          type="text"
          inputMode="numeric"
          placeholder="0"
        />
      );
      break;

    case "percentage":
      inputElement = (
        <div className="relative">
          <input {...inputProps} type="text" inputMode="decimal" placeholder="0" />
          <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
        </div>
      );
      break;

    case "date":
      inputElement = <input {...inputProps} type="date" />;
      break;

    default:
      inputElement = <input {...inputProps} type="text" />;
  }

  return (
    <div className="space-y-1">
      <label htmlFor={field.key} className="block text-sm font-medium">
        {labelText}
        {required && <span className="text-red-500 ml-1">*</span>}
        {field.required === "conditional" && (
          <span
            className="text-xs text-amber-600 ml-1"
            title={field.condition}
          >
            (if applicable)
          </span>
        )}
      </label>
      {inputElement}
    </div>
  );
}
