
export interface HAILogoProps {
  variant?: 'primary' | 'compact' | 'symbol'
  theme?: 'dark' | 'light' | 'monochrome-dark' | 'monochrome-light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HAILogo({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  className = '',
}: HAILogoProps) {
  // Dimensions for SVG symbol
  const symbolSizes = {
    sm: 20,
    md: 26,
    lg: 36,
  }
  const iconSize = symbolSizes[size]

  // Color mappings
  const isDarkTheme = theme === 'dark' || theme === 'monochrome-dark'
  const isMono = theme === 'monochrome-dark' || theme === 'monochrome-light'

  const primaryCharcoal = isDarkTheme ? '#FFFFFF' : '#161616'
  const accentBlue = isMono ? primaryCharcoal : '#0F62FE'
  const secondaryTeal = isMono ? primaryCharcoal : '#008075'
  const subtextColor = isDarkTheme ? '#C6C6C6' : '#525252'

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Precision Geometric HAI Symbol */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
        aria-hidden="true"
      >
        {/* Background container tile */}
        <rect width="40" height="40" fill={isDarkTheme ? '#262626' : '#F4F4F4'} rx="0" />

        {/* Outer Frame Corner Brackets (Structuring Healthcare / Data Grid) */}
        <path d="M8 14V8H14" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M32 14V8H26" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M8 26V32H14" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M32 26V32H26" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />

        {/* Central Geometric Healthcare Cross Structure with Data Connection Nodes */}
        <path d="M20 10V30" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />
        <path d="M10 20H30" stroke={primaryCharcoal} strokeWidth="2.5" strokeLinecap="square" />

        {/* Intelligence / Predictive Node & Signal Overlay */}
        <circle cx="20" cy="20" r="3.5" fill={accentBlue} />

        {/* Upward Predictive Data Vectors */}
        <path d="M20 20L29 11" stroke={accentBlue} strokeWidth="2" strokeLinecap="square" />
        <circle cx="29" cy="11" r="2" fill={secondaryTeal} />
      </svg>

      {/* Wordmark Lockups */}
      {variant === 'primary' && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight uppercase"
            style={{
              color: primaryCharcoal,
              fontSize: size === 'lg' ? '15px' : size === 'md' ? '12px' : '11px',
              letterSpacing: '0.04em',
            }}
          >
            Healthcare Appointment
          </span>
          <span
            className="font-semibold uppercase tracking-widest mt-0.5"
            style={{
              color: accentBlue,
              fontSize: size === 'lg' ? '11px' : size === 'md' ? '10px' : '9px',
              letterSpacing: '0.12em',
            }}
          >
            Intelligence
          </span>
        </div>
      )}

      {variant === 'compact' && (
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className="font-extrabold uppercase font-mono tracking-widest"
            style={{
              color: primaryCharcoal,
              fontSize: size === 'lg' ? '18px' : size === 'md' ? '15px' : '12px',
            }}
          >
            HAI
          </span>
          <span className="h-3 w-[1px] bg-carbon-gray-60 mx-0.5 opacity-50" />
          <span
            className="font-semibold uppercase tracking-wider text-[10px] hidden sm:inline-block"
            style={{ color: subtextColor }}
          >
            Healthcare Intelligence
          </span>
        </div>
      )}
    </div>
  )
}
