import React from 'react';

const variants = {
  primary: 'bg-red-600 hover:bg-red-500',
  secondary: 'bg-slate-600 hover:bg-slate-500',
  success: 'bg-green-600 hover:bg-green-500',
  warning: 'bg-yellow-600 hover:bg-yellow-500',
  danger: 'bg-orange-600 hover:bg-orange-500',
  info: 'bg-blue-600 hover:bg-blue-500',
  purple: 'bg-purple-600 hover:bg-purple-500',
  amber: 'bg-amber-600 hover:bg-amber-500',
};

const sizes = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Reusable Button component with consistent styling and theming support
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'|'info'|'purple'|'amber'} props.variant - Button style variant
 * @param {'xs'|'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.dataAction - Semantic identifier for testing/DevTools (e.g., "attack", "defend")
 * @param {React.ReactNode} props.children - Button content
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  dataAction,
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const widthStyles = fullWidth ? 'w-full' : '';
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      disabled={disabled}
      data-button={variant}
      data-action={dataAction}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
