import { useState, useEffect } from 'react'

export default function VerifyOTP() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [mode, setMode] = useState('forgotPassword')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const resetEmail = sessionStorage.getItem('resetEmail')
    const registerEmail = sessionStorage.getItem('registerEmail')
    
    if (resetEmail) {
      setEmail(resetEmail)
      setMode('forgotPassword')
    } else if (registerEmail) {
      setEmail(registerEmail)
      setMode('register')
    }
  }, [])

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      if (response.ok) {
        setSuccess('OTP verified successfully!')
        setTimeout(() => {
          if (mode === 'forgotPassword') {
            window.location.href = '/auth/reset-password'
          } else {
            window.location.href = '/auth/login'
          }
        }, 1500)
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'forgotPassword' ? '/api/auth/forgot-password' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSuccess('OTP resent to your email!')
        setResendTimer(60)
      } else {
        setError('Failed to resend OTP.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-poppins bg-[#1b1b1b]" style={{
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.07), transparent 60%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.07), transparent 60%)'
    }}>
      <div className="bg-[#2a2a2a] rounded-2xl w-full max-w-md p-10 relative border border-white/5" style={{
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
      }}>
        {/* Glow border effect */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 255, 255, 0.05))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 6px rgba(255, 215, 0, 0.3)' }}>
            Verify Your Email
          </h1>
          <p className="text-[#bbb] mb-6 text-sm">
            Enter the OTP sent to your email address
          </p>

          {email && (
            <div className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-4 py-3 mb-6 text-center">
              <p className="text-[#999] text-xs mb-1">Email</p>
              <p className="text-white font-semibold text-sm break-all">{email}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2">
                6-Digit OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                inputMode="numeric"
                required
                className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition text-center text-2xl tracking-widest"
              />
              <small className="block text-[#999] text-xs mt-2">Check your email for the 6-digit code</small>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</div>}
            {success && <div className="text-green-500 text-sm bg-green-500/10 border border-green-500/20 rounded px-3 py-2">{success}</div>}

            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#ffd700] hover:bg-[#ffe44c] disabled:opacity-50 text-black font-bold py-3 rounded-lg transition"
              style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <p className="text-[#999] text-sm mb-3">Didn't receive the code?</p>
              {resendTimer > 0 ? (
                <div className="text-[#ffd700] text-sm font-semibold">
                  Resend in {resendTimer}s
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[#ffd700] hover:text-[#ffe44c] font-semibold text-sm transition"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => window.location.href = '/auth/forgot-password'}
              className="w-full text-center text-[#aaa] hover:text-white text-sm transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}