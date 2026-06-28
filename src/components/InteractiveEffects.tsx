import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';

// ==========================================
// 1. MAGNETIC BUTTON WITH SHINE, LIQUID FILL, GLOW & 3D PRESS
// ==========================================
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  glowColor?: string; // e.g. "rgba(139, 92, 246, 0.5)"
  fillColor?: string; // e.g. "rgba(59, 130, 246, 0.2)"
  className?: string;
  hasShine?: boolean;
  hasLiquidFill?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  glowColor = 'rgba(59, 130, 246, 0.45)',
  fillColor = 'rgba(139, 92, 246, 0.15)',
  className = '',
  hasShine = true,
  hasLiquidFill = true,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Framer motion spring values for smooth magnetic pull
  const x = useSpring(0, { stiffness: 120, damping: 15, mass: 0.6 });
  const y = useSpring(0, { stiffness: 120, damping: 15, mass: 0.6 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate distance from center
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Proximity strength coefficient
    const strength = 0.35; 
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Build style custom variables for liquid fill
  const liquidStyle = {
    '--fill-color': fillColor,
  } as React.CSSProperties;

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        x, 
        y,
        ...liquidStyle
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 16px ${glowColor}`,
      }}
      whileTap={{ 
        scale: 0.98,
        y: 1, // 3D Press down effect
      }}
      className={`
        relative 
        inline-flex items-center justify-center 
        px-5 py-2.5 
        rounded-[14px] 
        font-sans font-bold uppercase tracking-wider text-xs 
        transition-all duration-300 ease-out
        cursor-pointer
        overflow-hidden
        border border-transparent
        bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]
        text-[#F8FAFC]
        ${hasShine ? 'shine-parent' : ''}
        ${hasLiquidFill ? 'liquid-fill-btn' : ''}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};


// ==========================================
// 2. 3D TILT CARD WITH SPOTLIGHT REFLECTION
// ==========================================
interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const rotateX = useSpring(0, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 20 });
  
  // Spotlight follow coordinates
  const spotlightX = useSpring(0, { stiffness: 300, damping: 30 });
  const spotlightY = useSpring(0, { stiffness: 300, damping: 30 });
  const spotlightOpacity = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Relative position
    const posX = clientX - left;
    const posY = clientY - top;
    
    // Convert to degree rotations (max 10deg tilt)
    const rotX = -((posY - height / 2) / (height / 2)) * 10;
    const rotY = ((posX - width / 2) / (width / 2)) * 10;
    
    rotateX.set(rotX);
    rotateY.set(rotY);

    // Set spotlight center
    spotlightX.set(posX);
    spotlightY.set(posY);
    spotlightOpacity.set(0.18); // Show spotlight glow on hover
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    spotlightOpacity.set(0); // Hide spotlight glow
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ y: -3, scale: 1.02 }} // Consistent Hover Lift and Scale 1.02
      className={`
        relative 
        bg-[#111827] 
        rounded-[20px] 
        border border-[rgba(255,255,255,0.08)] 
        shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] 
        transition-all duration-300
        overflow-hidden
        perspective-[1000px]
        text-[#F8FAFC]
        ${className}
      `}
    >
      {/* 3D Spotlight light layer using Purple and Cyan from user request */}
      <motion.div
        className="absolute -inset-px pointer-events-none z-10 rounded-[20px]"
        style={{
          background: useTransform(
            [spotlightX, spotlightY, spotlightOpacity],
            ([xVal, yVal, oVal]: [number, number, number]) => `radial-gradient(350px circle at ${xVal}px ${yVal}px, rgba(139, 92, 246, ${oVal}) 0%, rgba(6, 182, 212, ${oVal * 0.5}) 50%, transparent 100%)`
          ),
        }}
      />
      
      {/* Content wrapper with automatic Parallax separation offset */}
      <div className="relative z-0 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};


// ==========================================
// 3. CURSOR GLASS SPOTLIGHT TRACKER
// ==========================================
export const GlassCursorGlow: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const mouseX = useSpring(0, { stiffness: 400, damping: 40, mass: 0.5 });
  const mouseY = useSpring(0, { stiffness: 400, damping: 40, mass: 0.5 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 100); // offset center of 200px glow
      mouseY.set(e.clientY - 100);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible, mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          opacity: visible ? 0.12 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
        className="w-[200px] h-[200px] rounded-full bg-cosmic-cyan blur-[80px]"
      />
    </div>
  );
};


// ==========================================
// 4. ANIMATED COUNTER (0 -> Target)
// ==========================================
interface CounterAnimationProps {
  target: number;
  duration?: number; // In milliseconds
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function (easeOutQuad)
            const easedProgress = progress * (2 - progress);
            setCount(Math.floor(easedProgress * target));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};


// ==========================================
// 5. ANIMATED CIRCULAR PROGRESS RING
// ==========================================
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 54,
  strokeWidth = 5,
  color = 'stroke-cosmic-purple dark:stroke-cosmic-cyan',
  trackColor = 'stroke-slate-100 dark:stroke-slate-800/40',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          className={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Fill circle */}
        <motion.circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute font-sans font-black text-xs text-slate-800 dark:text-slate-100">
        {percentage}%
      </div>
    </div>
  );
};


// ==========================================
// 6. SCROLL REVEAL ANIMATED WRAPPER
// ==========================================
interface RevealAnimationProps {
  children: ReactNode;
  delay?: number; // In seconds
  className?: string;
}

export const RevealAnimation: React.FC<RevealAnimationProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};


// ==========================================
// 7. MORPHING BLOB BACKDROP (SLOW ANIMATING ORGANIC BLOB)
// ==========================================
export const MorphingBlob: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = 'bg-gradient-to-tr from-cosmic-blue/15 via-cosmic-purple/10 to-cosmic-cyan/10',
}) => {
  return (
    <div
      className={`
        absolute 
        animate-morph 
        blur-3xl 
        pointer-events-none 
        z-0
        ${color} 
        ${className}
      `}
    />
  );
};


// ==========================================
// 8. AURORA PREMIUM AMBIENT BACKGROUND
// ==========================================
export const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-slate-900/5 dark:bg-cosmic-bg/20" />
      {/* Dynamic drifting colorful particles using requested Blue, Purple, Cyan colors */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] rounded-full bg-cosmic-blue/10 dark:bg-cosmic-blue/5 blur-[120px] animate-float-slower" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cosmic-cyan/8 dark:bg-cosmic-cyan/4 blur-[120px] animate-float-slow" />
      <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-cosmic-purple/10 dark:bg-cosmic-purple/5 blur-[100px] animate-float-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
};
