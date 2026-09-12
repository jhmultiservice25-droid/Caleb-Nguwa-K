import type { CivilEventDefinition } from './types'

export const DEATH_EVENT: CivilEventDefinition = {
  id: 'death',
  label: 'Décès',
  description: "Déclaration et enregistrement d'un décès en RDC.",
  declarationFields: [
    { id: 'deceased.firstNames', label: 'Prénom(s) du défunt', type: 'text', required: true },
    { id: 'deceased.familyName', label: 'Nom du défunt', type: 'text', required: true },
    { id: 'deceased.sex', label: 'Sexe', type: 'select', required: true, options: ['Masculin', 'Féminin'] },
    { id: 'death.date', label: 'Date du décès', type: 'date', required: true },
    { id: 'death.place', label: 'Lieu du décès', type: 'location', required: true },
    { id: 'declarant.fullName', label: 'Nom complet du déclarant', type: 'text', required: true },
    { id: 'declarant.relationship', label: 'Lien avec le défunt', type: 'text', required: true },
    { id: 'registration.office', label: "Centre d’état civil", type: 'location', required: true }
  ],
  supportingDocuments: [
    'Certificat ou constat de décès, si disponible',
    'Pièce d’identité du déclarant, si applicable',
    'Pièces justificatives exigées par la réglementation congolaise en vigueur'
  ],
  workflow: ['DRAFT', 'DECLARED', 'REVIEW', 'REGISTERED', 'CERTIFIED']
} as const
