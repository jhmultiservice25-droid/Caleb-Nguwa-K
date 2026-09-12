import { BIRTH_EVENT } from './birth'
import { DEATH_EVENT } from './death'
import { MARRIAGE_EVENT } from './marriage'

export const RDC_CIVIL_EVENTS = [
  BIRTH_EVENT,
  DEATH_EVENT,
  MARRIAGE_EVENT
] as const
