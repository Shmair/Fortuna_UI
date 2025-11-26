import React from 'react';

export default function FormSelectField({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  helperText = '',
  required = false
}) {
  return (
    <div className="space-y-2 text-right">
      <label
        htmlFor={id}
        className="text-base font-semibold text-[var(--color-primary)] block"
      >
        {label}{required && <span className="text-red-500 pr-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-2xl border-2 border-[rgba(57,164,135,0.25)] bg-white/95 px-4 py-3 text-lg text-[var(--color-primary)] shadow-[0_12px_30px_rgba(15,46,71,0.08)] focus:outline-none focus:border-[rgba(57,164,135,0.8)] focus:ring-2 focus:ring-[rgba(57,164,135,0.3)] text-right transition"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
