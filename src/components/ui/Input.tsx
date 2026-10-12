import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#8E9DB2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`cx-text-input ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span style={{ color: '#EF4444', fontSize: '11px', marginTop: '2px' }}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
