'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const PERSPECTIVE = 1000
const ROTATION_RANGE = 5

interface TestCardMockupProps extends React.HTMLAttributes<HTMLDivElement> {
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  variant?: 'gradient' | 'dark' | 'glass'
}

export function TestCardMockup({
  cardNumber = '4242 4242 4242 4242',
  expiryDate = '12/34',
  cvv = '123',
  variant = 'gradient',
  className,
  ...props
}: TestCardMockupProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-50, 50], [ROTATION_RANGE, -ROTATION_RANGE])
  const rotateY = useTransform(x, [-50, 50], [-ROTATION_RANGE, ROTATION_RANGE])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const getMaskedNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    const lastFour = cleaned.slice(-4)
    return `•••• •••• •••• ${lastFour}`
  }

  const variantStyles = {
    gradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600',
    dark: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    glass: 'bg-white/15 dark:bg-white/10 backdrop-blur-xl border border-white/20',
  }

  return (
    <motion.div
      className={cn('relative w-full max-w-sm mx-auto', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: PERSPECTIVE }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        className="relative w-full h-56"
      >
        <motion.div
          className={cn(
            'relative h-full w-full overflow-hidden rounded-2xl p-6 shadow-2xl',
            variantStyles[variant]
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card shimmer effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'linear',
              }}
            />
          </div>

          {/* Card content */}
          <div className="relative h-full flex flex-col justify-between text-white">
            {/* Top section */}
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-600 to-yellow-700 shadow-inner" />
                <CreditCard className="w-5 h-5 opacity-80" />
              </motion.div>

              <motion.button
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.4,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsVisible(!isVisible)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isVisible ? 'Ocultar detalhes' : 'Mostrar detalhes'}
              >
                {isVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            </div>

            {/* Card number */}
            <motion.div
              className="text-xl font-mono tracking-wider font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isVisible ? cardNumber : getMaskedNumber(cardNumber)}
            </motion.div>

            {/* Bottom section */}
            <div className="flex justify-between items-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-xs opacity-70 mb-1">EXPIRES</div>
                <div className="font-medium text-sm">
                  {isVisible ? expiryDate : '••/••'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-xs opacity-70 mb-1">CVC</div>
                <div className="font-medium text-sm">
                  {isVisible ? cvv : '•••'}
                </div>
              </motion.div>

              <motion.div
                className="text-2xl font-bold italic"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.6,
                  type: 'spring',
                  stiffness: 200,
                }}
              >
                VISA
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

