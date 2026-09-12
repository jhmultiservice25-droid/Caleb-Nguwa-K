export type RdcRole =
  | 'NATIONAL_SYSTEM_ADMIN'
  | 'PROVINCIAL_SYSTEM_ADMIN'
  | 'COMMUNAL_SYSTEM_ADMIN'
  | 'LOCAL_REGISTRAR'
  | 'REGISTRATION_AGENT'
  | 'AUDITOR'

export const RDC_ROLES: Record<RdcRole, {
  label: string
  scope: 'national' | 'province' | 'commune' | 'office'
  permissions: readonly string[]
}> = {
  NATIONAL_SYSTEM_ADMIN: {
    label: 'Administrateur national',
    scope: 'national',
    permissions: ['manage:all', 'read:all', 'audit:all']
  },
  PROVINCIAL_SYSTEM_ADMIN: {
    label: 'Administrateur provincial',
    scope: 'province',
    permissions: ['manage:province', 'manage:offices', 'manage:users', 'read:province']
  },
  COMMUNAL_SYSTEM_ADMIN: {
    label: 'Administrateur communal',
    scope: 'commune',
    permissions: ['manage:commune', 'manage:office-users', 'read:commune']
  },
  LOCAL_REGISTRAR: {
    label: "Officier de l'état civil",
    scope: 'office',
    permissions: ['review:event', 'register:event', 'issue:certificate', 'correct:event']
  },
  REGISTRATION_AGENT: {
    label: "Agent de l'état civil",
    scope: 'office',
    permissions: ['declare:event', 'update:draft', 'upload:documents', 'search:records']
  },
  AUDITOR: {
    label: 'Auditeur / Inspection',
    scope: 'national',
    permissions: ['read:audit', 'read:statistics', 'read:records-metadata']
  }
} as const
