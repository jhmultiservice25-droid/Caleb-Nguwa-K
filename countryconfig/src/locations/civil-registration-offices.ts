import { KINSHASA_PILOT } from './kinshasa'

export type CivilRegistrationOfficeSeed = {
  id: string
  name: string
  provinceCode: string
  communeCode: string
  status: 'pilot-placeholder' | 'verified'
  address?: string
}

export const KINSHASA_PILOT_OFFICES: CivilRegistrationOfficeSeed[] =
  KINSHASA_PILOT.communes.map((commune) => ({
    id: `${commune.code}-CEC-01`,
    name: `Centre d'état civil pilote - ${commune.name}`,
    provinceCode: KINSHASA_PILOT.code,
    communeCode: commune.code,
    status: 'pilot-placeholder'
  }))

export const OFFICE_DATA_NOTICE =
  "Les centres ci-dessus sont des entrées techniques pilotes. Leurs noms officiels, adresses et rattachements doivent être validés avant tout déploiement institutionnel."
