export const RDC_COUNTRY_CONFIG = {
  countryCode: 'COD',
  countryName: 'République démocratique du Congo',
  shortName: 'RDC',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr'],
  pilotProvince: 'Kinshasa',
  administrativeLevels: [
    'province',
    'ville_territoire',
    'commune_secteur_chefferie',
    'quartier_groupement',
    'centre_etat_civil'
  ],
  roles: [
    'NATIONAL_SYSTEM_ADMIN',
    'PROVINCIAL_SYSTEM_ADMIN',
    'COMMUNAL_SYSTEM_ADMIN',
    'LOCAL_REGISTRAR',
    'REGISTRATION_AGENT'
  ]
} as const
