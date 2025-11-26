'use client'

import * as React from 'react'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiButtonProps {
  label?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

interface ConfettiParticle {
  id: number
  rotate: number
  color: string
}

const colors = ['#facc15', '#22c55e', '#3b82f6', '#f472b6', '#f97316', '#8b5cf6', '#ec4899']

export function ConfettiButton({
  label = 'Submit',
  onClick,
  className,
  variant = 'default',
  size = 'default',
}: ConfettiButtonProps) {
  const [particles, setParticles] = React.useState<ConfettiParticle[]>([])
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [buttonWidth, setButtonWidth] = React.useState(0)

  React.useEffect(() => {
    if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth)
  }, [buttonRef.current])

  const fireConfetti = () => {
    const newParticles: ConfettiParticle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      rotate: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles(newParticles)
    onClick?.()
    setTimeout(() => setParticles([]), 1000)
  }

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef}
        className={`relative overflow-hidden ${className || ''}`}
        onClick={fireConfetti}
        variant={variant}
        size={size}
      >
        {label}
      </Button>

      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-3 h-3 rounded-full bottom-0 pointer-events-none"
            style={{
              backgroundColor: p.color,
              left: buttonWidth / 2,
              transform: 'translateX(-50%)',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: p.rotate }}
            animate={{
              x: (Math.random() - 0.5) * 150,
              y: -Math.random() * 150,
              scale: 0,
              opacity: 0,
              rotate: p.rotate + Math.random() * 360,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

