import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary: 'border border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[var(--admin-primary-foreground)] shadow-[var(--admin-shadow-sm)] hover:bg-[#e67900] hover:border-[#e67900]',
  secondary: 'border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-secondary-foreground)] hover:bg-[var(--admin-secondary)]',
  danger: 'border border-[var(--admin-destructive)] bg-[var(--admin-destructive)] text-[var(--admin-destructive-foreground)] hover:bg-[#d93a3a] hover:border-[#d93a3a]',
  ghost: 'text-[var(--admin-accent-foreground)] hover:bg-[var(--admin-accent)] hover:text-[var(--admin-secondary-foreground)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: ReactNode;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export default function AdminButton({
  variant = 'primary', size = 'md', href, icon, loading, children, className = '', disabled, ref, ...props
}: AdminButtonProps) {
  const styles = `inline-flex items-center justify-center gap-2 rounded-[calc(var(--admin-radius)-2px)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return <Link href={href} className={styles}>{icon}{children}</Link>;
  }

  return (
    <button ref={ref} className={styles} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
