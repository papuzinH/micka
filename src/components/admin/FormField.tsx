import type { FieldConfig } from "@/lib/admin/collections";
import { FileInput } from "./FileInput";

export type Option = { value: string; label: string };

const inputCls =
  "w-full border border-brand-light-gray bg-brand-black px-3 py-2 font-body text-sm text-brand-white placeholder:text-brand-white/30 focus:border-brand-violet focus:outline-none";
const labelCls = "block font-display text-h4 uppercase text-brand-white";

const str = (values: Record<string, unknown>, key: string): string => {
  const v = values[key];
  return v == null ? "" : String(v);
};

const toDateInput = (v: string): string => (v ? v.slice(0, 10) : "");

function Control({
  name,
  field,
  defaultValue,
  options,
}: {
  name: string;
  field: FieldConfig;
  defaultValue: string;
  options: Option[];
}) {
  switch (field.type) {
    case "textarea":
    case "editor":
      return (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={field.type === "editor" ? 6 : 3}
          className={`${inputCls} resize-y`}
        />
      );
    case "select":
      return (
        <select name={name} defaultValue={defaultValue} className={inputCls}>
          {!field.required && <option value="">—</option>}
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "relation":
      return (
        <select name={name} defaultValue={defaultValue} className={inputCls}>
          <option value="">—</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "number":
      return (
        <input
          type="number"
          name={name}
          defaultValue={defaultValue}
          className={inputCls}
        />
      );
    case "date":
      return (
        <input
          type="date"
          name={name}
          defaultValue={toDateInput(defaultValue)}
          className={inputCls}
        />
      );
    case "email":
    case "url":
      return (
        <input
          type={field.type}
          name={name}
          defaultValue={defaultValue}
          className={inputCls}
        />
      );
    default:
      return (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          className={inputCls}
        />
      );
  }
}

export function FormField({
  field,
  values = {},
  errors = {},
  options = [],
  fileUrl,
}: {
  field: FieldConfig;
  values?: Record<string, unknown>;
  errors?: Record<string, string>;
  options?: Option[];
  fileUrl?: string;
}) {
  const required = field.required ? (
    <span className="text-brand-violet"> *</span>
  ) : null;

  if (field.type === "file") {
    return (
      <div>
        <span className={labelCls}>{field.label}</span>
        <div className="mt-2">
          <FileInput name={field.name} currentUrl={fileUrl} />
        </div>
      </div>
    );
  }

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(values[field.name])}
          className="size-4 accent-[#a020f0]"
        />
        <span className={labelCls}>{field.label}</span>
      </label>
    );
  }

  if (field.localized) {
    return (
      <div>
        <span className={labelCls}>
          {field.label}
          {required}
        </span>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {(["en", "fr"] as const).map((loc) => {
            const key = `${field.name}_${loc}`;
            return (
              <div key={loc}>
                <span className="mb-1 block font-body text-xs uppercase text-brand-white/40">
                  {loc}
                </span>
                <Control
                  name={key}
                  field={field}
                  defaultValue={str(values, key)}
                  options={options}
                />
                {errors[key] && (
                  <p className="mt-1 text-xs text-brand-violet">{errors[key]}</p>
                )}
              </div>
            );
          })}
        </div>
        {field.help && (
          <p className="mt-1 text-xs text-brand-white/40">{field.help}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className={labelCls}>
        {field.label}
        {required}
        <span className="mt-2 block font-normal normal-case">
          <Control
            name={field.name}
            field={field}
            defaultValue={str(values, field.name)}
            options={options}
          />
        </span>
      </label>
      {errors[field.name] && (
        <p className="mt-1 text-xs text-brand-violet">{errors[field.name]}</p>
      )}
      {field.help && (
        <p className="mt-1 text-xs text-brand-white/40">{field.help}</p>
      )}
    </div>
  );
}
