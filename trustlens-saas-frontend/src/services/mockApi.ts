import { z } from 'zod'

export const signInSchema = z.object({
  workEmail: z.email('Enter a valid work email'),
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

export type DecisionResponse = {
  approved: boolean
  confidence: number
  recommendation: string
  narrative: string
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function signIn(values: SignInInput) {
  const parsed = signInSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
    }
  }

  await wait(500)

  if (!values.workEmail.endsWith('@poonawallafincorp.com')) {
    return {
      ok: false as const,
      error: 'Use an organization email for secure access',
    }
  }

  return {
    ok: true as const,
    token: `jwt-${crypto.randomUUID()}`,
  }
}

export async function runDecisionSimulation(values: SimulationInput) {
  const parsed = simulationSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid payload',
    }
  }

  await wait(900)

  const isStrongIncome = values.monthlyIncome >= 45000
  const approved = isStrongIncome
  const confidence = isStrongIncome ? 92 : 71

  const recommendation = approved
    ? 'Instant approval path generated and pushed to BRE queue.'
    : 'Path-to-approval generated. Request additional banking evidence.'

  const narrative = approved
    ? `<strong>${values.language} decision summary:</strong><br/>Your profile indicates stable income and compliant consent boundaries. The application is eligible for fast-track underwriting.`
    : `<strong>${values.language} decision summary:</strong><br/>Current income signals are below policy threshold. Share two additional proof-of-income documents to unlock next-stage evaluation.`

  return {
    ok: true as const,
    data: {
      approved,
      confidence,
      recommendation,
      narrative,
    } satisfies DecisionResponse,
  }
}
