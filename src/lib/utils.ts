import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validação de CPF (somente números, 11 dígitos, não sequencial e dígitos verificadores corretos)
export function validarCPF(cpf: string): boolean {
  if (!cpf) return false
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false // rejeita sequências iguais

  const calcCheck = (base: string, factor: number) => {
    let total = 0
    for (let i = 0; i < base.length; i++) {
      total += parseInt(base[i], 10) * factor--
    }
    const rest = total % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const d1 = calcCheck(digits.substring(0, 9), 10)
  if (d1 !== parseInt(digits[9], 10)) return false
  const d2 = calcCheck(digits.substring(0, 10), 11)
  if (d2 !== parseInt(digits[10], 10)) return false
  return true
}

// Formata CPF para ###.###.###-## sem alterar se incompleto
export function formatarCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  const parts: string[] = []
  if (digits.length <= 3) return digits
  parts.push(digits.slice(0, 3))
  if (digits.length <= 6) return parts[0] + '.' + digits.slice(3)
  parts.push(digits.slice(3, 6))
  if (digits.length <= 9) return parts[0] + '.' + parts[1] + '.' + digits.slice(6)
  parts.push(digits.slice(6, 9))
  const sufix = digits.slice(9)
  return `${parts[0]}.${parts[1]}.${parts[2]}-${sufix}`
}
