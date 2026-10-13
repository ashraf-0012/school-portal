import React from 'react';

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  children,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'md' ? '' : `btn-${size}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
