import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends ButtonProps {
  children: React.ReactNode
  magneticStrength?: number
}

export function MagneticButton({ 
  children, 
  className,
  magneticStrength = 0.3,
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(springY, [-100, 100], [15, -15])
  const rotateY = useTransform(springX, [-100, 100], [-15, 15])

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = event.clientX - centerX
    const distanceY = event.clientY - centerY
    
    x.set(distanceX * magneticStrength)
    y.set(distanceY * magneticStrength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isHovered && "shadow-2xl shadow-eco-500/25",
          className
        )}
        {...props}
      >
        <motion.div
          style={{
            x: springX,
            y: springY,
          }}
          className="relative z-10"
        >
          {children}
        </motion.div>
        
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-eco-400/20 to-eco-600/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </Button>
    </motion.div>
  )
}

