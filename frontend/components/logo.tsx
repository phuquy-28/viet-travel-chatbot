import { useLanguage } from "@/contexts/language-context"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { language } = useLanguage()
  
  const sizes = {
    sm: { width: 32, height: 32, text: "text-sm" },
    md: { width: 40, height: 40, text: "text-base" },
    lg: { width: 56, height: 56, text: "text-xl" },
  }
  
  const { width, height, text } = sizes[size]
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon - Location Pin with Vietnam Flag */}
      <div className="relative flex-shrink-0">
        <svg
          width={width}
          height={height}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0891b2", stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#dc2626", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Background Circle */}
          <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
          
          {/* Location Pin */}
          <g transform="translate(32, 28)">
            {/* Pin body */}
            <path
              d="M 0 -16 C -8.8 -16, -16 -8.8, -16 0 C -16 8.8, 0 24, 0 24 C 0 24, 16 8.8, 16 0 C 16 -8.8, 8.8 -16, 0 -16 Z"
              fill="url(#pinGradient)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            
            {/* Vietnam Flag inside pin - Red background circle */}
            <circle cx="0" cy="0" r="8" fill="#da251d" />
            
            {/* Yellow star (5-pointed) */}
            <path
              d="M 0 -6 L 1.8 -1.2 L 7 -1.2 L 2.8 2 L 4.6 6.8 L 0 3.6 L -4.6 6.8 L -2.8 2 L -7 -1.2 L -1.8 -1.2 Z"
              fill="#ffcd00"
            />
          </g>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex items-center">
          <span className={`font-bold ${text} text-foreground whitespace-nowrap`}>
            {language === "vi" ? "Du lịch Việt Nam" : "Vietnam Travel"}
          </span>
        </div>
      )}
    </div>
  )
}

