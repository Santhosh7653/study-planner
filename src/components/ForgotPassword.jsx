/**
 * ForgotPassword — orchestrates the 4-step password reset flow:
 *
 *  EmailStep  →  OtpStep  →  NewPasswordStep  →  SuccessStep
 *
 * State (email, otp) is lifted here and passed down as props.
 * Each step component is self-contained and only calls onSuccess/onBack.
 */
import { useState } from 'react'
import EmailStep      from './forgot/EmailStep'
import OtpStep        from './forgot/OtpStep'
import NewPasswordStep from './forgot/NewPasswordStep'
import SuccessStep    from './forgot/SuccessStep'

const STEP = { EMAIL: 0, OTP: 1, PASSWORD: 2, DONE: 3 }

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')

  // Resend OTP — calls the API again for the same email
  const handleResend = async () => {
    await fetch('/api/sendOtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  }

  if (step === STEP.EMAIL) {
    return (
      <EmailStep
        onSuccess={(confirmedEmail) => { setEmail(confirmedEmail); setStep(STEP.OTP) }}
        onBack={onBack}
      />
    )
  }

  if (step === STEP.OTP) {
    return (
      <OtpStep
        email={email}
        onSuccess={(verifiedOtp) => { setOtp(verifiedOtp); setStep(STEP.PASSWORD) }}
        onBack={() => setStep(STEP.EMAIL)}
        onResend={handleResend}
      />
    )
  }

  if (step === STEP.PASSWORD) {
    return (
      <NewPasswordStep
        email={email}
        otp={otp}
        onSuccess={() => setStep(STEP.DONE)}
      />
    )
  }

  return <SuccessStep onBack={onBack} />
}
