import React from "react";

export function Label({ children, className = "", ...props }) {
  return (
    <label className={`block mb-1 font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
}
