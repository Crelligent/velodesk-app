import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string
}

export function Logo({ className = 'text-2xl', href = '/' }: LogoProps) {
  return (
    <Link href={href} className={`font-outfit font-thin tracking-[0.2em] uppercase flex items-center text-white/90 hover:text-white transition ${className}`}>
      <span>Velo</span>
      <span>desk</span>
    </Link>
  )
}
