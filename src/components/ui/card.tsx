import React, { CSSProperties, ReactNode } from "react";

type CardBaseProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function CardFooter({ children, className = "", style }: CardBaseProps) {
  return (
    <div className={`pt-4 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardDescription({ children, className = "", style }: CardBaseProps) {
  return (
    <p className={`text-gray-500 text-sm mt-1 ${className}`} style={style}>
      {children}
    </p>
  );
}

export function Card({ children, className = "", style }: CardBaseProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", style }: CardBaseProps) {
  return (
    <div className={`mb-2 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", style }: CardBaseProps) {
  return (
    <h2 className={`text-xl font-bold ${className}`} style={style}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "", style }: CardBaseProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
