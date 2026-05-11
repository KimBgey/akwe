import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-sm font-medium text-white/40 pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full rounded-xl border bg-surface-3 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition',
              'focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30',
              error ? 'border-accent-rose/50' : 'border-white/10',
              prefix && 'pl-9',
              suffix && 'pr-9',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-sm font-medium text-white/40 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-accent-rose">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
