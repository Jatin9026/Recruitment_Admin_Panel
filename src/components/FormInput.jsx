import React from "react";
export default function FormInput({
  name,
  label,
  type = "text",
  value = "",
  options = [], 
  required = false,
  readOnly = false,
  placeholder = "",
  helpText = "",
  roleLevel = 1,
  minRole = 1,
}) {
  if (roleLevel < minRole) return null;
  const commonProps = {
    id: name,
    name,
    defaultValue: value,
    required,
    readOnly,
    placeholder,
    className:
      "w-full border rounded-xl p-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500",
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
      )}
      {type === "select" ? (
        <select {...commonProps} defaultValue={value || ""}>
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea {...commonProps} rows={4}></textarea>
      ) : type === "checkbox" ? (
        <input {...commonProps} type="checkbox" defaultChecked={!!value} />
      ) : (
        <input {...commonProps} type={type} />
      )}
      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}
