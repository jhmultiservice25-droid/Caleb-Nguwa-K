import type { CivilEventDefinition } from './types'

export const MARRIAGE_EVENT: CivilEventDefinition = {
  id: 'marriage',
  label: 'Mariage',
  description: "Déclaration et enregistrement d'un mariage civil en RDC.",
  declarationFields: [
    { id: 'spouse1.fullName', label: 'Nom complet du conjoint 1', type: 'text', required: true },
    { id: 'spouse2.fullName', label: 'Nom complet du conjoint 2', type: 'text', required: true },
    { id: 'marriage.date', label: 'Date du mariage', type: 'date', required: true },
    { id: 'marriage.place', label: 'Lieu du mariage', type: 'location', required: true },
    { id: 'witness1.fullName', label: 'Nom complet du témoin 1', type: 'text', required: true },
    { id: 'witness2.fullName', label: 'Nom complet du témoin 2', type: 'text', required: true },
    { id: 'registrar.fullName', label: "Officier de l’état civil", type: 'text', required: true },
    { id: 'registration.office', label: "Centre d’état civil", type: 'location', required: true }
  ],
  supportingDocuments: [
    'Pièces d’identité des futurs époux, si applicables',
    'Documents exigés par la réglementation congolaise en vigueur',
    'Pièces relatives aux témoins, si requises'
  ],
  workflow: ['DRAFT', 'DECLARED', 'REVIEW', 'REGISTERED', 'CERTIFIED']
} as const
