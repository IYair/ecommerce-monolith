import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'shadow hover:opacity-90',
        destructive: 'shadow-sm hover:opacity-90',
        outline: 'border shadow-sm hover:opacity-90',
        secondary: 'shadow-sm hover:opacity-90',
        ghost: 'hover:opacity-90',
        link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'rgb(var(--color-primary-foreground))',
          };
        case 'destructive':
          return {
            backgroundColor: 'rgb(var(--color-destructive))',
            color: 'rgb(var(--color-destructive-foreground))',
          };
        case 'outline':
          return {
            borderColor: 'rgb(var(--color-border))',
            backgroundColor: 'rgb(var(--color-background))',
            color: 'rgb(var(--color-foreground))',
          };
        case 'secondary':
          return {
            backgroundColor: 'rgb(var(--color-secondary))',
            color: 'rgb(var(--color-secondary-foreground))',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'rgb(var(--color-foreground))',
          };
        case 'link':
          return {
            backgroundColor: 'transparent',
            color: 'rgb(var(--color-primary))',
          };
        default:
          return {
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'rgb(var(--color-primary-foreground))',
          };
      }
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={getVariantStyles()}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
