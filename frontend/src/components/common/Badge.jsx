import React from 'react';

export default function Badge({
  variant = 'gold',
  className = '',
  children,
  ...props
}) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
