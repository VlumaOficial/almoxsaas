import { Package } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  }

  const color = variant === 'dark' ? 'text-blue-800' : 'text-white'

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <div className="bg-blue-800 text-white p-1.5 rounded-lg">
        <Package size={sizes[size].icon} />
      </div>
      <span className={`font-bold tracking-tight ${sizes[size].text} ${color}`}>
        Almox
      </span>
    </div>
  )
}