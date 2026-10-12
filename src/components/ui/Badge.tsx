import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'cyan' | 'demo';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  let variantClass = 'cx-badge-demo';
  if (variant === 'danger') variantClass = 'cx-badge-high';
  else if (variant === 'warning') variantClass = 'cx-badge-suspicious';
  else if (variant === 'success') variantClass = 'cx-badge-low';
  else if (variant === 'cyan') variantClass = 'cx-badge-cyan';

  return (
    <span className={`cx-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
