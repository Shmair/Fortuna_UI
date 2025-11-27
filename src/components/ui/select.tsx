import React, { ReactNode } from "react";

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  id?: string;
  name?: string;
};

export function Select({ value, onValueChange, children, id, name }: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={e => onValueChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SelectContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return null; // Not needed for native select
}
