export const KINSHASA_COMMUNES = [
  'Bandalungwa',
  'Barumbu',
  'Bumbu',
  'Gombe',
  'Kalamu',
  'Kasa-Vubu',
  'Kimbanseke',
  'Kinshasa',
  'Kintambo',
  'Kisenso',
  'Lemba',
  'Limete',
  'Lingwala',
  'Makala',
  'Maluku',
  'Masina',
  'Matete',
  'Mont-Ngafula',
  'Ndjili',
  'Ngaba',
  'Ngaliema',
  'Ngiri-Ngiri',
  'Nsele',
  'Selembao'
] as const

export const KINSHASA_PILOT = {
  province: 'Kinshasa',
  code: 'KIN',
  communes: KINSHASA_COMMUNES.map((name, index) => ({
    code: `KIN-${String(index + 1).padStart(2, '0')}`,
    name,
    type: 'commune'
  }))
} as const
