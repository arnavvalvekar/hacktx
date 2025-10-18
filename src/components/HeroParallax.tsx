import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Leaf, TrendingDown, Zap, Globe } from 'lucide-react'
import { MagneticButton } from '@/components/MagneticButton'
import { cn } from '@/lib/utils'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

export function HeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    // Initialize particles
    const createParticles = () => {
      const particles: Particle[] = []
      for (let i = 0; i < 50; i++) {
        particles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
      particlesRef.current = particles
    }

    createParticles()

    // Animation loop
    const animate = () => {
      particlesRef.current = particlesRef.current.map(particle => ({
        ...particle,
        y: particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5,
        opacity: Math.sin(particle.y * 0.01) * 0.3 + 0.2,
      })).filter(particle => particle.y < window.innerHeight + 100)
      
      // Add new particles at the top
      if (particlesRef.current.length < 50) {
        particlesRef.current.push({
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: -100,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-carbon-900 via-carbon-800 to-eco-900">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particlesRef.current.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-eco-400"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Parallax content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex min-h-screen items-center justify-center px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              <span className="gradient-text">EcoFin</span>
              <br />
              <span className="text-white">Carbon</span>
            </h1>
            <p className="text-xl md:text-2xl text-carbon-200 max-w-3xl mx-auto leading-relaxed">
              See the environmental impact of your spending and learn to finance life more sustainably. 
              Track CO₂ emissions, get smart suggestions, and make greener choices.
            </p>
          </motion.div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { icon: Leaf, text: 'Hybrid Estimator' },
              { icon: Zap, text: 'Nessie-Powered' },
              { icon: Globe, text: 'AI Coach' },
              { icon: TrendingDown, text: 'Real Impact' },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
              >
                <feature.icon className="h-4 w-4 text-eco-400" />
                <span className="text-white text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <MagneticButton
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/dashboard'}
            >
              Launch Dashboard
            </MagneticButton>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-carbon-200 hover:text-white transition-colors duration-300 underline underline-offset-4"
              onClick={() => {
                const element = document.getElementById('features')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

