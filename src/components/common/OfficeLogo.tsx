export function OfficeLogo({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Microsoft 365 Enterprise"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
      >
        {/* Top-Left: Word Blue */}
        <rect x="3" y="3" width="12" height="12" rx="3" fill="url(#grad-blue)" />
        {/* Top-Right: Excel Green */}
        <rect x="17" y="3" width="12" height="12" rx="3" fill="url(#grad-green)" />
        {/* Bottom-Left: PowerPoint Orange/Coral */}
        <rect x="3" y="17" width="12" height="12" rx="3" fill="url(#grad-orange)" />
        {/* Bottom-Right: Yella AI / Teams Purple */}
        <rect x="17" y="17" width="12" height="12" rx="3" fill="url(#grad-purple)" />
        
        {/* Center Sparkle Badge */}
        <circle cx="16" cy="16" r="3.5" fill="#ffffff" />
        <circle cx="16" cy="16" r="2.2" fill="#8a44f8" />

        <defs>
          <linearGradient id="grad-blue" x1="3" y1="3" x2="15" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0078d4" />
            <stop offset="1" stopColor="#185abd" />
          </linearGradient>
          <linearGradient id="grad-green" x1="17" y1="3" x2="29" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#107c41" />
            <stop offset="1" stopColor="#0b6a37" />
          </linearGradient>
          <linearGradient id="grad-orange" x1="3" y1="17" x2="15" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f25022" />
            <stop offset="1" stopColor="#c43e1c" />
          </linearGradient>
          <linearGradient id="grad-purple" x1="17" y1="17" x2="29" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8a44f8" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
