import { ReactNode } from 'react';


export interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable Card component for enclosing sections like Scanner or History.
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`scanner-card ${className}`}>
      {children}
    </div>
  );
}
