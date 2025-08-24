import { useState, useEffect } from "react";
import { Link } from "wouter";

interface KivoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  showSlogan?: boolean;
  className?: string;
}

export function KivoLogo({ 
  size = "lg", 
  animated = true, 
  showSlogan = true,
  className = "" 
}: KivoLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [sparkleIndex, setSparkleIndex] = useState(0);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setSparkleIndex(prev => (prev + 1) % 4);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const sizeClasses = {
    sm: "text-3xl md:text-4xl",
    md: "text-5xl md:text-6xl", 
    lg: "text-6xl md:text-7xl",
    xl: "text-8xl md:text-9xl"
  };

  const sloganSizes = {
    sm: "text-sm md:text-base",
    md: "text-lg md:text-xl",
    lg: "text-xl md:text-2xl", 
    xl: "text-2xl md:text-3xl"
  };

  return (
    <Link href="/">
      <div 
        className={`relative cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid="kivo-logo"
      >
        {/* Animated background glow */}
        <div 
          className={`absolute -inset-4 bg-gradient-to-r from-kivo-purple via-kivo-gold to-kivo-green rounded-2xl blur-xl opacity-30 ${
            animated ? 'animate-pulse' : ''
          } ${isHovered ? 'opacity-60 scale-110' : ''} transition-all duration-700`}
        ></div>
        
        {/* Sparkle effect */}
        {animated && (
          <div className="absolute inset-0 kivo-sparkle">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-white rounded-full animate-ping ${
                  sparkleIndex === i ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 25}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Main KIVO text */}
        <div className="relative z-10">
          <h1 
            className={`font-orbitron font-black ${sizeClasses[size]} text-transparent bg-clip-text kivo-gradient ${
              animated ? 'kivo-mega-glow' : 'kivo-glow'
            } ${isHovered ? 'kivo-wobble' : ''} transition-all duration-300`}
            data-testid="kivo-text"
          >
            KIVO
          </h1>
          
          {/* Slogan */}
          {showSlogan && (
            <div className="mt-2">
              <p 
                className={`font-inter font-bold ${sloganSizes[size]} text-kivo-dark ${
                  animated ? 'kivo-float' : ''
                } ${isHovered ? 'text-kivo-purple' : ''} transition-all duration-300`}
                data-testid="kivo-slogan"
              >
                JUSTO LO QUE NECESITAS
              </p>
            </div>
          )}
        </div>

        {/* Interactive border effect */}
        <div 
          className={`absolute -inset-2 rounded-2xl ${
            isHovered ? 'kivo-pulse-border' : ''
          } transition-all duration-500`}
        ></div>
      </div>
    </Link>
  );
}