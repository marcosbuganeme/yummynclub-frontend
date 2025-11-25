import React, { useState, useEffect, useCallback } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Currency } from 'lucide-react'

interface MoneyInputProps {
  value?: number
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  className?: string
}

/**
 * Componente de input de dinheiro formatado no padrão brasileiro
 * Aceita valores como 110.502,50 e formata automaticamente
 */
export function MoneyInput({
  value,
  onChange,
  label,
  placeholder = '0,00',
  id,
  disabled = false,
  className = '',
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Converter número para formato brasileiro
  const formatToBrazilian = useCallback((num: number): string => {
    if (isNaN(num) || num === null || num === undefined) return ''
    
    // Formatar com 2 casas decimais, ponto para milhares e vírgula para decimais
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }, [])

  // Converter formato brasileiro para número
  const parseFromBrazilian = useCallback((str: string): number => {
    if (!str || str.trim() === '') return 0
    
    // Remover pontos (separadores de milhares) e substituir vírgula por ponto
    const cleaned = str.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    
    return isNaN(parsed) ? 0 : parsed
  }, [])

  // Inicializar displayValue quando value mudar externamente
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatToBrazilian(value))
    }
  }, [value, formatToBrazilian])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Remover tudo exceto números, vírgula e ponto
    inputValue = inputValue.replace(/[^\d,.]/g, '')

    // Garantir apenas uma vírgula
    const commaIndex = inputValue.indexOf(',')
    if (commaIndex !== -1) {
      inputValue = inputValue.substring(0, commaIndex + 1) + inputValue.substring(commaIndex + 1).replace(/,/g, '')
    }

    // Garantir apenas dois dígitos após a vírgula
    if (commaIndex !== -1) {
      const parts = inputValue.split(',')
      if (parts[1] && parts[1].length > 2) {
        inputValue = parts[0] + ',' + parts[1].substring(0, 2)
      }
    }

    // Adicionar pontos como separadores de milhares
    if (inputValue && !inputValue.includes(',')) {
      // Se não tem vírgula, pode ter ponto como separador decimal (formato internacional)
      const parts = inputValue.split('.')
      if (parts.length === 2 && parts[1].length <= 2) {
        // Formato internacional (ponto como decimal)
        inputValue = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1]
      } else {
        // Apenas números inteiros, adicionar separadores de milhares
        inputValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      }
    } else if (inputValue && inputValue.includes(',')) {
      // Tem vírgula, formatar parte inteira com pontos
      const parts = inputValue.split(',')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      inputValue = parts.join(',')
    }

    setDisplayValue(inputValue)

    // Converter para número e chamar onChange
    const numericValue = parseFromBrazilian(inputValue)
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Garantir formatação correta ao perder o foco
    const numericValue = parseFromBrazilian(displayValue)
    setDisplayValue(formatToBrazilian(numericValue))
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Selecionar todo o texto ao focar para facilitar edição
    e.target.select()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2">
          <Currency className="h-4 w-4" />
          {label}
        </Label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 ${className}`}
          inputMode="decimal"
        />
      </div>
      {value !== undefined && value !== null && value > 0 && (
        <p className="text-xs text-muted-foreground">
          Valor numérico: {value.toFixed(2)}
        </p>
      )}
    </div>
  )
}

