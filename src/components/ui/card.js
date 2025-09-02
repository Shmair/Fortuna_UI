export function CardFooter({ children, className = "" }) {
  return <div className={`pt-4 border-t ${className}`}>{children}</div>;
}
export function CardDescription({ children, className = "" }) {
  return <p className={`text-gray-500 text-sm mt-1 ${className}`}>{children}</p>;
}
import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
