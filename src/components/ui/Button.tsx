import { ReactNode, ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-gradient-brand text-white shadow-glow-brand hover:opacity-90': variant === 'primary',
          'bg-surface-3 text-white border border-white/10 hover:bg-surface-4': variant === 'secondary',
          'text-white/60 hover:text-white hover:bg-white/5': variant === 'ghost',
          'bg-accent-rose/10 text-accent-rose border border-accent-rose/20 hover:bg-accent-rose/20': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-7 py-3.5 text-base': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
