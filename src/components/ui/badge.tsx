import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const base = "inline-block px-3 py-1 rounded-full text-xs font-semibold";
  const variants = {
    default: "bg-gray-200 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800"
  };
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
