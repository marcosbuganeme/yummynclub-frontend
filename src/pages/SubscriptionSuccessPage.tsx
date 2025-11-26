import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Confetti } from '../components/Confetti'
import { ConfettiButton } from '../components/ConfettiButton'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Users } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate()

  return (
    <>
      <Confetti particleCount={150} duration={4000} />
      
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto min-h-[60vh] flex items-center">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600" />
            
            {/* Decorative sparkles */}
            <div className="absolute top-4 right-4 opacity-20">
              <Sparkles className="h-16 w-16 text-green-500" />
            </div>

            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-green-500/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  />
                </div>
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-green-700 mb-2">
                Assinatura Criada com Sucesso!
              </CardTitle>
              <CardDescription className="text-base">
                Sua assinatura foi criada e processada com sucesso. Você já pode aproveitar todos os benefícios do seu plano.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Benefits list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Acesso completo à plataforma</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Descontos exclusivos em parceiros</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Cancelamento a qualquer momento</span>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <ConfettiButton
                  label="Ver Minhas Assinaturas"
                  onClick={() => navigate('/subscriptions')}
                  className="flex-1"
                  size="lg"
                />
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/partners')}
                  className="flex-1"
                  size="lg"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Ver Parceiros
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}

