import React from "react";

export function Button({ children, className = "", style = {}, ...props }) {
  return (
    <button
      className={`w-50 max-w-xl px-4 py-3 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] flex items-center justify-center ${className}`}
      style={{
        background: 'var(--color-button)',
        color: '#fff',
        boxShadow: '0 12px 28px rgba(57, 164, 135, 0.35)',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}
