/* eslint-disable @next/next/no-img-element */
import type { LiveIntegration } from './liveIntegrations'

type Props = {
  integration: Pick<LiveIntegration, 'name' | 'logo'>
  /** 'tile' = square badge with logo or initials; 'mark' = logo or plain wordmark for the marquee */
  variant?: 'tile' | 'mark'
  className?: string
  decorative?: boolean
}

/**
 * Shows a tool's logo from /public. Tools without a logo file (Stripe, Chargebee, Paddle)
 * get a plain text wordmark, never copied brand artwork.
 */
export default function IntegrationLogo({ integration, variant = 'tile', className = '', decorative = false }: Props) {
  const alt = decorative ? '' : integration.name

  if (variant === 'mark') {
    return integration.logo ? (
      <img src={integration.logo} alt={alt} className={`h-7 w-auto max-w-[120px] object-contain ${className}`} />
    ) : (
      <span aria-hidden={decorative || undefined} className={`font-outfit text-xl font-semibold tracking-tight text-white ${className}`}>
        {integration.name}
      </span>
    )
  }

  return (
    // Text-only tiles (no logo file) grow sideways so the name never gets clipped on small screens
    <div className={`flex items-center justify-center rounded-xl bg-white p-2 shadow-lg shadow-black/40 ${className} ${integration.logo ? '' : '!w-auto min-w-10 px-2.5'}`}>
      {integration.logo ? (
        <img src={integration.logo} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <span aria-hidden={decorative || undefined} className="whitespace-nowrap font-outfit text-[10px] sm:text-[11px] font-semibold leading-none tracking-tight text-[#2B2350]">
          {integration.name}
        </span>
      )}
    </div>
  )
}
