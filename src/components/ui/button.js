import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
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
