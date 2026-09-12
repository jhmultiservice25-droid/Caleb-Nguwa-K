export const RDC_CERTIFICATE_CONFIG = {
  issuer: 'République démocratique du Congo',
  authorityLabel: "Service de l'état civil",
  verificationBaseUrl: 'https://etat-civil-rdc.example/verifier',
  showQrCode: true,
  showRegistrationNumber: true,
  showIssuingOffice: true,
  showIssueDate: true,
  privacy: {
    publicVerificationFields: [
      'eventType',
      'registrationNumber',
      'issuingOffice',
      'issueDate',
      'status'
    ]
  },
  notice: 'Configuration pilote : le modèle final doit être validé par les autorités compétentes avant usage officiel.'
} as const

export function buildVerificationUrl(recordId: string): string {
  const safeId = encodeURIComponent(recordId)
  return `${RDC_CERTIFICATE_CONFIG.verificationBaseUrl}/${safeId}`
}
