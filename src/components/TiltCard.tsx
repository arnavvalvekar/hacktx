import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltStrength?: number
  scaleOnHover?: boolean
}

export function TiltCard({ 
  children, 
  className,
  tiltStrength = 0.1,
  scaleOnHover = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(springY, [-100, 100], [15 * tiltStrength, -15 * tiltStrength])
  const rotateY = useTransform(springX, [-100, 100], [-15 * tiltStrength, 15 * tiltStrength])
  const scale = useTransform(springX, [-100, 100], [scaleOnHover ? 1.02 : 1, scaleOnHover ? 1.02 : 1])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceX = event.clientX - centerX
    const distanceY = event.clientY - centerY
    
    x.set(distanceX)
    y.set(distanceY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative transition-all duration-300",
        className
      )}
    >
      <motion.div
        style={{
          transform: 'translateZ(50px)',
        }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

