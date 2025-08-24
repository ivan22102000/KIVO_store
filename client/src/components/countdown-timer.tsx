import { useState, useEffect } from "react";
import { Clock, Zap, Flame } from "lucide-react";

interface CountdownTimerProps {
  endDate: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  theme?: "urgent" | "premium" | "standard";
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ 
  endDate, 
  className = "", 
  size = "md", 
  showLabels = true,
  theme = "urgent",
  onExpired
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [pulseState, setPulseState] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = +new Date(endDate) - +new Date();
      
      if (difference > 0) {
        setIsExpired(false);
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      if (!isExpired) {
        setIsExpired(true);
        if (onExpired) {
          onExpired();
        }
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, isExpired, onExpired]);

  // Pulse animation for urgent countdown
  useEffect(() => {
    if (theme === "urgent" && !isExpired) {
      const pulseInterval = setInterval(() => {
        setPulseState(prev => (prev + 1) % 4);
      }, 800);
      return () => clearInterval(pulseInterval);
    }
  }, [theme, isExpired]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  if (isExpired) {
    return (
      <div 
        className={`text-center p-4 rounded-2xl bg-red-500 text-white ${className}`}
        data-testid="countdown-expired"
      >
        <div className="text-3xl font-black animate-bounce mb-2">
          ¡OFERTA EXPIRADA!
        </div>
        <p>Esta promoción ya no está disponible</p>
      </div>
    );
  }

  const sizeClasses = {
    sm: "text-3xl md:text-4xl",
    md: "text-5xl md:text-6xl", 
    lg: "text-6xl md:text-7xl"
  };

  const containerClasses = {
    urgent: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
    premium: "bg-gradient-to-r from-kivo-purple to-kivo-gold text-white",
    standard: "bg-white text-gray-800 border border-gray-200"
  };

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;
  const isCritical = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <div 
      className={`relative p-6 rounded-3xl ${containerClasses[theme]} ${className} overflow-hidden shadow-2xl`}
      data-testid="countdown-timer"
    >
      {/* Animated background for urgent state */}
      {theme === "urgent" && (
        <div className="absolute inset-0">
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 transition-opacity duration-700 ${
              pulseState === 1 ? 'opacity-100' : 'opacity-80'
            }`}
          ></div>
          {/* Effects */}
          <div className="absolute top-4 right-4">
            <Flame className={`w-8 h-8 ${isCritical ? 'animate-bounce text-yellow-300' : 'animate-pulse'}`} />
          </div>
          <div className="absolute bottom-4 left-4">
            <Zap className={`w-6 h-6 ${isUrgent ? 'animate-spin text-yellow-300' : 'animate-pulse'}`} />
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Clock className="w-6 h-6" />
          <span className="font-bold text-xl">
            {theme === "urgent" ? "¡TERMINA EN!" : "Tiempo restante:"}
          </span>
        </div>

        {/* Countdown Display */}
        <div className="flex justify-center space-x-4 md:space-x-8">
          <div className="text-center" data-testid="countdown-days">
            <div className={`font-orbitron font-black ${sizeClasses[size]} bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3`}>
              {formatNumber(timeLeft.days)}
            </div>
            {showLabels && <p className="text-sm md:text-lg font-semibold mt-2 opacity-90">DÍAS</p>}
          </div>
          <div className={`${sizeClasses[size]} self-center animate-pulse`}>:</div>
          <div className="text-center" data-testid="countdown-hours">
            <div className={`font-orbitron font-black ${sizeClasses[size]} bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3`}>
              {formatNumber(timeLeft.hours)}
            </div>
            {showLabels && <p className="text-sm md:text-lg font-semibold mt-2 opacity-90">HORAS</p>}
          </div>
          <div className={`${sizeClasses[size]} self-center animate-pulse`}>:</div>
          <div className="text-center" data-testid="countdown-minutes">
            <div className={`font-orbitron font-black ${sizeClasses[size]} bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3`}>
              {formatNumber(timeLeft.minutes)}
            </div>
            {showLabels && <p className="text-sm md:text-lg font-semibold mt-2 opacity-90">MIN</p>}
          </div>
          <div className={`${sizeClasses[size]} self-center animate-pulse`}>:</div>
          <div className="text-center" data-testid="countdown-seconds">
            <div className={`font-orbitron font-black ${sizeClasses[size]} bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-3 animate-pulse`}>
              {formatNumber(timeLeft.seconds)}
            </div>
            {showLabels && <p className="text-sm md:text-lg font-semibold mt-2 opacity-90">SEG</p>}
          </div>
        </div>

        {/* Urgency Message */}
        {isUrgent && (
          <div className="mt-6 text-center">
            <p className="font-bold text-lg animate-pulse">
              {isCritical ? "¡ÚLTIMOS MINUTOS! ⚡" : "¡OFERTA POR TERMINAR! 🔥"}
            </p>
          </div>
        )}
      </div>

      {/* Animated border for premium theme */}
      {theme === "premium" && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-kivo-purple via-kivo-gold to-kivo-green opacity-50 animate-pulse"></div>
      )}
    </div>
  );
}
