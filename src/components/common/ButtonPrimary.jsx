import React from 'react';

/**
 * Primary CTA button that matches the Fortuna palette.
 */
export default function ButtonPrimary({
  children,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  ...props
}) {
  const iconElement = Icon ? (
    <Icon className="w-5 h-5" color="var(--color-primary-dark)" />
  ) : null;

  return (
    <button
      className={`main-btn flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : 'min-w-[200px] sm:min-w-[260px]'} ${className}`}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {iconPosition === 'right' && iconElement}
    </button>
  );
}
