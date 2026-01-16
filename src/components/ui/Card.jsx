import React, { memo } from 'react';

const variants = {
  default: 'bg-slate-700 rounded p-2 text-sm',
  hero: 'bg-slate-700 rounded p-2 text-sm ring-2 ring-offset-2 ring-offset-slate-800',
  monster: 'bg-slate-800 rounded p-2 border border-slate-600',
  highlight: 'bg-slate-700 rounded p-2 ring-2 ring-yellow-400',
  surface1: 'bg-slate-900 rounded p-3',
  surface2: 'bg-slate-800 rounded p-3',
  surface3: 'bg-slate-700 rounded p-3',
};

/**
 * Reusable Card component with consistent styling
 *
 * @param {Object} props
 * @param {'default'|'hero'|'monster'|'highlight'|'surface1'|'surface2'|'surface3'} props.variant - Card style variant
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
export function Card({
  children,
  variant = 'default',
  className = '',
  dataCard,
  ...props
}) {
  const variantStyles = variants[variant] || variants.default;

  return (
    <div
      className={`${variantStyles} ${className}`}
      data-card={variant}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Specialized HeroCard with semantic data attributes
 */
export const HeroCard = memo(function HeroCard({ hero, children, className = '', ...props }) {
  return (
    <Card
      variant="hero"
      className={className}
      data-hero-id={hero?.id}
      data-hero-name={hero?.name}
      {...props}
    >
      {children}
    </Card>
  );
});

/**
 * Specialized MonsterCard with semantic data attributes
 */
export const MonsterCard = memo(function MonsterCard({ monster, children, className = '', ...props }) {
  return (
    <Card
      variant="monster"
      className={className}
      data-monster-id={monster?.id}
      data-monster-name={monster?.name}
      {...props}
    >
      {children}
    </Card>
  );
});

export default Card;
