export interface RegisterValues {
  full_name: string;
  email: string;
  password: string;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateRegister(values: RegisterValues): ValidationResult {
  if (!values.full_name.trim())
    return { ok: false, error: "error.name_required" };
  if (!EMAIL_RE.test(values.email))
    return { ok: false, error: "error.email_invalid" };
  if (values.password.length < 6)
    return { ok: false, error: "error.password_short" };
  return { ok: true };
}

export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  // Base score from length tiers
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  // Diversity: lower/upper/digit/symbol groups
  let groups = 0;
  if (/[a-z]/.test(pw)) groups++;
  if (/[A-Z]/.test(pw)) groups++;
  if (/[0-9]/.test(pw)) groups++;
  if (/[^A-Za-z0-9]/.test(pw)) groups++;
  if (groups >= 3) score++;
  // Penalty for heavy repetition or sequential chars lowers score ceiling
  const repeats = /(.)\1{2,}/.test(pw);
  const sequential = /(abc|123|qwe|pass|111)/i.test(pw);
  if (repeats || sequential) score = Math.max(0, score - 1);
  // Normalize to 0..4
  return Math.min(4, Math.max(0, score));
}
