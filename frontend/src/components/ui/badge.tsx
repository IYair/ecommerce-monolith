import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent shadow hover:opacity-90',
        secondary: 'border-transparent hover:opacity-90',
        destructive: 'border-transparent shadow hover:opacity-90',
        outline: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'rgb(var(--color-primary))',
          color: 'rgb(var(--color-primary-foreground))',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgb(var(--color-secondary))',
          color: 'rgb(var(--color-secondary-foreground))',
        };
      case 'destructive':
        return {
          backgroundColor: 'rgb(var(--color-destructive))',
          color: 'rgb(var(--color-destructive-foreground))',
        };
      case 'outline':
        return {
          borderColor: 'rgb(var(--color-border))',
          color: 'rgb(var(--color-foreground))',
        };
      default:
        return {
          backgroundColor: 'rgb(var(--color-primary))',
          color: 'rgb(var(--color-primary-foreground))',
        };
    }
  };

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...getVariantStyles(), ...style }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
