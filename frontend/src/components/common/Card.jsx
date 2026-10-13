import React from 'react';

export default function Card({
  featured = false,
  interactive = false,
  navy = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'card',
    featured ? 'card-featured' : '',
    interactive ? 'card-interactive' : '',
    navy ? 'card-navy' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
