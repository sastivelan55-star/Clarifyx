import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'text';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }, ref) => {
    let variantClass = 'cx-btn-primary';
    if (variant === 'secondary') variantClass = 'cx-btn-secondary';
    else if (variant === 'danger') variantClass = 'cx-btn-danger';
    else if (variant === 'ghost' || variant === 'text') variantClass = 'cx-btn-ghost';

    return (
      <button
        ref={ref}
        className={`cx-btn ${variantClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Processing…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
