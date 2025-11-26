'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ConfettiParticle {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  size: number
}

const colors = ['#facc15', '#22c55e', '#3b82f6', '#f472b6', '#f97316', '#8b5cf6', '#ec4899', '#10b981']

interface ConfettiProps {
  particleCount?: number
  duration?: number
}

export function Confetti({ particleCount = 100, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = React.useState<ConfettiParticle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newParticles: ConfettiParticle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      rotate: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
    }, duration)

    return () => clearTimeout(timer)
  }, [particleCount, duration])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
          }}
          initial={{
            y: particle.y,
            rotate: particle.rotate,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: particle.rotate + 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: 0,
            scale: 0,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: duration / 1000,
            ease: 'easeOut',
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

