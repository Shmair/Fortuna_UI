import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`w-50 max-w-xl px-2 py-4 rounded font-bold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: "#52ad6a",
        color: "#fff",
        boxShadow: "none"
      }}
      {...props}
    >
      {children}
    </button>
  );
}
