import { useState, useRef, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CollidingProps = 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart' | 'style' | 'children';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, CollidingProps>, Omit<HTMLMotionProps<"button">, CollidingProps> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  glow?: boolean;
}
export function Button({
  children,
  variant = 'primary',
  glow = false,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.2; // Magnetic strength
    const y = (e.clientY - (top + height / 2)) * 0.2;
    setPosition({
      x,
      y
    });
  };
  const handleMouseLeave = () => {
    setPosition({
      x: 0,
      y: 0
    });
  };
  const baseStyles =
    'relative px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden';
  const variants = {
    primary:
      'bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white hover:shadow-[0_0_20px_rgba(237,31,36,0.6)]',
    secondary: 'bg-[color:var(--deep-navy)] text-white hover:bg-opacity-80',
    outline:
      'border border-[color:var(--ice-grey)] text-white hover:border-[color:var(--bright-red)] hover:text-[color:var(--bright-red)]',
    ghost: 'text-white hover:text-[color:var(--bright-red)] bg-transparent'
  };
  return (
    <motion.button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1
      }}
      whileTap={{
        scale: 0.95
      }}
      {...props}>

      {/* Glow effect overlay */}
      {glow &&
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
      }
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>);

}