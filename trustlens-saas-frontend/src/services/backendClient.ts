import { z } from 'zod'
import type { UserRole } from '../security/auth'

export const signInSchema = z.object({
  workEmail: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const simulationSchema = z.object({
  language: z.enum(['Hindi', 'Marathi', 'English']),
  monthlyIncome: z
    .number({ message: 'Monthly income is required' })
    .min(10000, 'Minimum monthly income is 10,000'),
  consentAccepted: z
    .boolean()
    .refine((value) => value, 'DPDP consent is required before decisioning'),
  statedPurpose: z.string().min(5, 'Loan purpose must be descriptive'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SimulationInput = z.infer<typeof simulationSchema>

export type FeatureFlags = {
  canRunSimulation: boolean
  canViewAudit: boolean
  canViewKpis: boolean
  canManageUsers: boolean
}

export type DecisionResponse = {
  approved: boolean
  confidence: number
  recommendation: string
  narrative: string
  reasons: Array<{
    code: string
    title: string
    impact: 'positive' | 'negative'
    detail: string
  }>
  blockers: string[]
  nextActions: string[]
}

export type SignInResult = {
  token: string
  role: UserRole
  displayName: string
}

export type KpiPoint = {
  time: string
  ttdSeconds: number
  dropOffReduction: number
  reviewReduction: number
  transparencyScore: number
}

export type ArchitectureFlow = {
  title: string
  subtitle: string
  layers: Array<{ name: string; detail: string }>
  outcomes: Array<{ metric: string; label: string }>
}

export type RoleWorkspaceWidget = {
  id: string
  title: string
  value: string
  status: string
}

type Success<T> = { ok: true; data: T }
type Failure = { ok: false; error: string }

const DEMO_USERS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  'admin@trustlens.demo': {
    password: 'Admin@123',
    role: 'Admin',
    displayName: 'Platform Admin',
  },
  'underwriter@trustlens.demo': {
    password: 'Underwriter@123',
    role: 'Underwriter',
    displayName: 'Senior Underwriter',
  },
  'auditor@trustlens.demo': {
    password: 'Auditor@123',
    role: 'Auditor',
    displayName: 'Compliance Auditor',
  },
}

const FEATURE_FLAGS: Record<UserRole, FeatureFlags> = {
  Admin: {
    canRunSimulation: true,
    canViewAudit: true,
    canViewKpis: true,
    canManageUsers: true,
  },
  Underwriter: {
    canRunSimulation: true,
    canViewAudit: true,
    canViewKpis: true,
    canManageUsers: false,
  },
  Auditor: {
    canRunSimulation: false,
    canViewAudit: true,
    canViewKpis: true,
    canManageUsers: false,
  },
}

const ROLE_WIDGETS: Record<UserRole, RoleWorkspaceWidget[]> = {
  Admin: [
    { id: 'a1', title: 'Policy Pack Version', value: 'v2.8', status: 'Active' },
    { id: 'a2', title: 'Connector Health', value: '99.2%', status: 'Stable' },
    { id: 'a3', title: 'Pending Access Requests', value: '04', status: 'Needs review' },
  ],
  Underwriter: [
    { id: 'u1', title: 'Cases In Queue', value: '17', status: 'In progress' },
    { id: 'u2', title: 'Low-Confidence Cases', value: '05', status: 'Action required' },
    { id: 'u3', title: 'Avg Review Time', value: '7m', status: 'Improving' },
  ],
  Auditor: [
    { id: 'au1', title: 'Consent Trace Coverage', value: '100%', status: 'Compliant' },
    { id: 'au2', title: 'Redaction Success', value: '99.8%', status: 'Compliant' },
    { id: 'au3', title: 'Open Audit Exceptions', value: '01', status: 'Review needed' },
  ],
}

function enrichDecision(
  approved: boolean,
  language: SimulationInput['language'],
): Omit<DecisionResponse, 'approved' | 'confidence' | 'recommendation' | 'narrative'> {
  if (approved) {
    return {
      reasons: [
        {
          code: 'INC_STABLE',
          title: 'Stable income band detected',
          impact: 'positive',
          detail: 'Income and stated purpose align with retail working-capital policy.',
        },
        {
          code: 'KYC_VERIFIED',
          title: 'vKYC signal quality high',
          impact: 'positive',
          detail: 'Identity checks and consent boundaries passed without mismatch.',
        },
        {
          code: 'BRE_PASS',
          title: 'Hard policy rules passed',
          impact: 'positive',
          detail: `BRE decision path accepted for ${language} applicant context.`,
        },
      ],
      blockers: [],
      nextActions: [
        'Push offer summary to applicant in preferred language.',
        'Auto-create disbursal checklist in 1LMS workflow.',
      ],
    }
  }

  return {
    reasons: [
      {
        code: 'INC_LOW',
        title: 'Income threshold not met',
        impact: 'negative',
        detail: 'Current income is below the configured policy floor for this loan size.',
      },
      {
        code: 'DOC_GAP',
        title: 'Additional evidence required',
        impact: 'negative',
        detail: 'Recent proof-of-income documents are required to complete risk profiling.',
      },
      {
        code: 'RISK_BUFFER',
        title: 'Risk confidence below target',
        impact: 'negative',
        detail: 'Model confidence is below the instant-approval threshold.',
      },
    ],
    blockers: [
      'Income signal below policy threshold',
      'Insufficient supporting documents',
    ],
    nextActions: [
      'Collect last two months bank statements.',
      'Re-run assessment after document verification.',
      'Offer lower ticket-size path-to-approval option.',
    ],
  }
}

const ARCHITECTURE_FLOW: ArchitectureFlow = {
  title: 'End-to-End Architecture Flow',
  subtitle:
    'TrustLens AI wraps Lentra systems with agentic orchestration, compliance controls, and explainable decisions.',
  layers: [
    {
      name: 'Input Layer',
      detail: 'Customer video call over WebRTC with multilingual voice capture.',
    },
    {
      name: 'AI Wrapper',
      detail: 'Whisper STT, language detection, context parsing, and XAI narration.',
    },
    {
      name: 'Lentra Core',
      detail: '1LMS lead sync, vKYC verification, BRE rule execution, Cadenz settlement.',
    },
    {
      name: 'Security and Compliance',
      detail: 'DPDP consent vault, PII redaction, cryptographic audit log hashing.',
    },
    {
      name: 'Decision Output',
      detail: 'Approved or Path-to-Approval narrative in applicant language.',
    },
  ],
  outcomes: [
    { metric: '60%', label: 'Faster Loan Approvals' },
    { metric: '35%', label: 'Lower Drop-Offs' },
    { metric: '50%', label: 'Less Manual Review' },
    { metric: '90%', label: 'Better Transparency' },
  ],
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toKpiPoint(seed: number): KpiPoint {
  return {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ttdSeconds: 98 + (seed % 8),
    dropOffReduction: 32 + (seed % 5),
    reviewReduction: 45 + (seed % 6),
    transparencyScore: 88 + (seed % 4),
  }
}

type BackendClient = {
  signIn: (values: SignInInput) => Promise<Success<SignInResult> | Failure>
  runDecisionSimulation: (
    values: SimulationInput,
  ) => Promise<Success<DecisionResponse> | Failure>
  getFeatureFlags: (role: UserRole) => FeatureFlags
  getRoleWidgets: (role: UserRole) => Promise<RoleWorkspaceWidget[]>
  getArchitectureFlow: () => Promise<ArchitectureFlow>
  getKpiSnapshot: () => Promise<KpiPoint[]>
  subscribeToKpiStream: (onPoint: (point: KpiPoint) => void) => () => void
}

const mockBackend: BackendClient = {
  async signIn(values) {
    const parsed = signInSchema.safeParse(values)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    await wait(300)

    const user = DEMO_USERS[values.workEmail.toLowerCase()]
    if (!user || user.password !== values.password) {
      return { ok: false, error: 'Invalid demo credentials. Use the listed role accounts.' }
    }

    return {
      ok: true,
      data: {
        token: `jwt-${crypto.randomUUID()}`,
        role: user.role,
        displayName: user.displayName,
      },
    }
  },

  async runDecisionSimulation(values) {
    const parsed = simulationSchema.safeParse(values)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload' }
    }

    await wait(700)

    const isStrongIncome = values.monthlyIncome >= 45000
    const approved = isStrongIncome
    const confidence = isStrongIncome ? 92 : 71

    return {
      ok: true,
      data: {
        approved,
        confidence,
        recommendation: approved
          ? 'Instant approval path generated and pushed to BRE queue.'
          : 'Path-to-approval generated. Request additional banking evidence.',
        narrative: approved
          ? `<strong>${values.language} decision summary:</strong><br/>Your profile indicates stable income and compliant consent boundaries. The application is eligible for fast-track underwriting.`
          : `<strong>${values.language} decision summary:</strong><br/>Current income signals are below policy threshold. Share two additional proof-of-income documents to unlock next-stage evaluation.`,
        ...enrichDecision(approved, values.language),
      },
    }
  },

  getFeatureFlags(role) {
    return FEATURE_FLAGS[role]
  },

  async getRoleWidgets(role) {
    await wait(120)
    return ROLE_WIDGETS[role]
  },

  async getArchitectureFlow() {
    await wait(200)
    return ARCHITECTURE_FLOW
  },

  async getKpiSnapshot() {
    await wait(150)
    return Array.from({ length: 8 }, (_, index) => toKpiPoint(index + 1))
  },

  subscribeToKpiStream(onPoint) {
    let seed = 8
    const timer = window.setInterval(() => {
      seed += 1
      onPoint(toKpiPoint(seed))
    }, 5000)

    return () => window.clearInterval(timer)
  },
}

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL ?? 'http://localhost:8000'

const fastApiBackend: BackendClient = {
  async signIn(values) {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      return { ok: false, error: 'Sign-in failed from FastAPI backend' }
    }

    const data = (await response.json()) as SignInResult
    return { ok: true, data }
  },

  async runDecisionSimulation(values) {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/decision/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      return { ok: false, error: 'Decision API failed' }
    }

    const data = (await response.json()) as DecisionResponse
    return { ok: true, data }
  },

  getFeatureFlags(role) {
    return FEATURE_FLAGS[role]
  },

  async getRoleWidgets(role) {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/roles/${role}/widgets`)
    if (!response.ok) {
      return ROLE_WIDGETS[role]
    }

    return (await response.json()) as RoleWorkspaceWidget[]
  },

  async getArchitectureFlow() {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/architecture`)
    if (!response.ok) {
      return ARCHITECTURE_FLOW
    }

    return (await response.json()) as ArchitectureFlow
  },

  async getKpiSnapshot() {
    const response = await fetch(`${FASTAPI_BASE_URL}/api/kpi/snapshot`)
    if (!response.ok) {
      return mockBackend.getKpiSnapshot()
    }

    return (await response.json()) as KpiPoint[]
  },

  subscribeToKpiStream(onPoint) {
    const timer = window.setInterval(async () => {
      const snapshot = await fastApiBackend.getKpiSnapshot()
      const latest = snapshot[snapshot.length - 1]
      if (latest) {
        onPoint(latest)
      }
    }, 5000)

    return () => window.clearInterval(timer)
  },
}

const BACKEND_MODE = import.meta.env.VITE_BACKEND_MODE ?? 'mock'

export const backendClient: BackendClient =
  BACKEND_MODE === 'fastapi' ? fastApiBackend : mockBackend
