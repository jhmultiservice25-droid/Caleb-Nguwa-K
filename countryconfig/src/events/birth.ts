import type { CivilEventDefinition } from './types'

export const BIRTH_EVENT: CivilEventDefinition = {
  id: 'birth',
  label: 'Naissance',
  description: "Déclaration et enregistrement d'une naissance en RDC.",
  declarationFields: [
    { id: 'child.firstNames', label: 'Prénom(s) de l’enfant', type: 'text', required: true },
    { id: 'child.familyName', label: 'Nom de l’enfant', type: 'text', required: true },
    { id: 'child.sex', label: 'Sexe', type: 'select', required: true, options: ['Masculin', 'Féminin'] },
    { id: 'birth.date', label: 'Date de naissance', type: 'date', required: true },
    { id: 'birth.place', label: 'Lieu de naissance', type: 'location', required: true },
    { id: 'mother.fullName', label: 'Nom complet de la mère', type: 'text', required: true },
    { id: 'father.fullName', label: 'Nom complet du père', type: 'text' },
    { id: 'declarant.fullName', label: 'Nom complet du déclarant', type: 'text', required: true },
    { id: 'registration.office', label: "Centre d’état civil", type: 'location', required: true }
  ],
  supportingDocuments: [
    'Preuve de naissance ou attestation de la structure sanitaire, si disponible',
    'Pièce d’identité du déclarant, si applicable',
    'Pièces justificatives exigées par la réglementation congolaise en vigueur'
  ],
  workflow: ['DRAFT', 'DECLARED', 'REVIEW', 'REGISTERED', 'CERTIFIED']
} as const
