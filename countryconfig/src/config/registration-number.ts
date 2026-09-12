export type RegistrationNumberInput = {
  provinceCode: string
  communeCode: string
  year: number
  eventType: 'birth' | 'death' | 'marriage'
  sequence: number
}

const EVENT_CODES = {
  birth: 'N',
  death: 'D',
  marriage: 'M'
} as const

export function buildRegistrationNumber(input: RegistrationNumberInput): string {
  if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 9999) {
    throw new Error('Invalid registration year')
  }
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error('Invalid registration sequence')
  }

  const sequence = String(input.sequence).padStart(9, '0')
  const eventCode = EVENT_CODES[input.eventType]

  return `RDC-${input.provinceCode}-${input.communeCode}-${input.year}-${eventCode}-${sequence}`
}
