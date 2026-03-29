import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResend() {
  if (!resendClient) {
    const config = useRuntimeConfig()
    resendClient = new Resend(config.resendApiKey as string)
  }
  return resendClient
}

export async function sendOtpEmail(
  email: string,
  code: string,
  type: string,
  siteName: string = 'Signal Universe'
) {
  if (type === 'reset_password') {
    return sendPasswordResetEmail(email, code, siteName)
  }

  const config = useRuntimeConfig()
  const resend = getResend()
  const isRegister = type === 'register'
  const subject = isRegister
    ? `[${siteName}] Verify your email`
    : `[${siteName}] Your verification code`

  await resend.emails.send({
    from: config.emailFrom as string,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">${siteName}</h1>
          <p style="color: #94a3b8; margin-top: 8px;">Smart Trading Signal Platform</p>
        </div>
        <h2 style="color: #e2e8f0; margin-bottom: 16px;">${isRegister ? 'Email verification' : 'Verification code'}</h2>
        <p style="color: #94a3b8; line-height: 1.6;">Use the code below to continue:</p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #6366f1;">${code}</span>
        </div>
        <p style="color: #94a3b8;">This code expires in <strong style="color: #e2e8f0;">15 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
        <p style="color: #475569; font-size: 12px; text-align: center;">${siteName}</p>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
  siteName: string = 'Signal Universe'
) {
  const config = useRuntimeConfig()
  const resend = getResend()

  await resend.emails.send({
    from: config.emailFrom as string,
    to: email,
    subject: `[${siteName}] Password Reset Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #6366f1; font-size: 28px; margin: 0;">${siteName}</h1>
          <p style="color: #94a3b8; margin-top: 8px;">Smart Trading Signal Platform</p>
        </div>
        <h2 style="color: #e2e8f0; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #94a3b8; line-height: 1.6;">You requested a password reset. Use the code below to reset your password:</p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #6366f1;">${code}</span>
        </div>
        <p style="color: #94a3b8;">This code expires in <strong style="color: #e2e8f0;">15 minutes</strong>.</p>
        <p style="color: #94a3b8;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
        <p style="color: #475569; font-size: 12px; text-align: center;">${siteName} - Smart Trading Signal Platform</p>
      </div>
    `
  })
}

export async function sendDepositConfirmationEmail(
  email: string,
  amount: number,
  packageAmount: number,
  siteName: string = 'Signal Universe'
) {
  const config = useRuntimeConfig()
  const resend = getResend()

  await resend.emails.send({
    from: config.emailFrom as string,
    to: email,
    subject: `[${siteName}] Deposit Confirmed - $${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1;">${siteName}</h1>
        <h2 style="color: #10b981;">Deposit Confirmed ✓</h2>
        <p>Your deposit of <strong>$${amount} USD</strong> has been confirmed.</p>
        <p>Your <strong>$${packageAmount} package</strong> is now active.</p>
        <p>You can now confirm trading signals and start earning profits!</p>
      </div>
    `
  })
}
