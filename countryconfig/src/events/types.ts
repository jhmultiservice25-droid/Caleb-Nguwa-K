export type CivilEventType = 'birth' | 'death' | 'marriage'

export type FieldDefinition = {
  id: string
  label: string
  type: 'text' | 'date' | 'select' | 'boolean' | 'number' | 'location' | 'document'
  required?: boolean
  options?: readonly string[]
}

export type CivilEventDefinition = {
  id: CivilEventType
  label: string
  description: string
  declarationFields: readonly FieldDefinition[]
  supportingDocuments: readonly string[]
  workflow: readonly string[]
}
