"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldInfo } from "@/types/tax";
import { getFormData, saveFormData } from "@/lib/api";
import FormField from "./FormField";

interface TaxFieldGroupProps {
  returnId: string;
  formName: string;
  fields: FieldInfo[];
  title?: string;
}

export default function TaxFieldGroup({
  returnId,
  formName,
  fields,
  title,
}: TaxFieldGroupProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const [saveError, setSaveError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const statusTimer = useRef<ReturnType<typeof setTimeout>>();
  const pendingData = useRef<Record<string, string | boolean>>({});

  // Load saved data on mount
  useEffect(() => {
    getFormData(returnId, formName)
      .then((fd) => {
        const data: Record<string, string | boolean> = {};
        for (const [k, v] of Object.entries(fd.data)) {
          data[k] = typeof v === "boolean" ? v : String(v ?? "");
        }
        setValues(data);
        pendingData.current = data;
      })
      .catch(() => {
        // No saved data yet — start with empty
      })
      .finally(() => setLoaded(true));
  }, [returnId, formName]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      // Fire-and-forget save of any unsaved data
      const data = pendingData.current;
      const nonEmpty: Record<string, string | boolean> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== "" && v !== false) nonEmpty[k] = v;
      }
      if (Object.keys(nonEmpty).length > 0) {
        saveFormData(returnId, formName, nonEmpty).catch(() => {});
      }
    };
  }, [returnId, formName]);

  // Auto-save with debounce
  const doSave = useCallback(
    async (data: Record<string, string | boolean>) => {
      setSaving(true);
      setSaveError("");
      try {
        const nonEmpty: Record<string, string | boolean> = {};
        for (const [k, v] of Object.entries(data)) {
          if (v !== "" && v !== false) nonEmpty[k] = v;
        }
        await saveFormData(returnId, formName, nonEmpty);
        setDirty(false);
        setSaveStatus("saved");
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setSaveStatus(""), 3000);
      } catch (err) {
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [returnId, formName],
  );

  const handleChange = (key: string, value: string | boolean) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      pendingData.current = next;
      setDirty(true);
      // Debounced auto-save
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => doSave(next), 1000);
      return next;
    });
  };

  if (!loaded) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="text-xs">
            {saving && <span className="text-gray-400">Saving...</span>}
            {saveStatus === "saved" && <span className="text-green-600">✓ Saved</span>}
            {saveStatus === "error" && <span className="text-red-600">✗ {saveError}</span>}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={values[field.key] ?? (field.type === "checkbox" ? false : "")}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
}
