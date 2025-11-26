import { useState, useEffect } from 'react'
import apiService from '../../lib/apiService'
import DOMPurify from 'dompurify'

export default function VerifyResetOTP() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect back to forgot password if no email
      window.location.href = '/auth/forgot-password'
    }
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('OTP is required')
      return
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)

    try {
      // Verify OTP and get reset token
      const response = await apiService.verifyResetOTP({
        email: email,
        otp: DOMPurify.sanitize(otp)
      })

      // Store reset token in sessionStorage
      if (response.resetToken) {
        sessionStorage.setItem('resetToken', response.resetToken)
        sessionStorage.setItem('resetEmail', email)
        
        // Redirect to reset password page
        window.location.href = '/auth/reset-password'
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setResendTimer(60)

    try {
      await apiService.resendPasswordResetOTP(email)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
      setResendTimer(0)
    }
  }

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

        <h1 className="text-3xl font-bold text-white mb-2 relative z-10" style={{ textShadow: '0 0 6px rgba(255, 215, 0, 0.3)' }}>
          Verify OTP
        </h1>
        <p className="text-[#bbb] mb-6 text-sm relative z-10">We've sent a 6-digit OTP to {email}</p>

        <div className="relative z-10 space-y-5 mt-8">
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold text-white mb-2">
              One-Time Password
            </label>
            <input
              type="text"
              id="otp"
              maxLength="6"
              value={otp}
              onChange={(e) => {
                const sanitized = DOMPurify.sanitize(e.target.value)
                // Only allow digits
                if (/^\d*$/.test(sanitized)) {
                  setOtp(sanitized)
                }
                setError('')
              }}
              placeholder="000000"
              required
              className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] text-center text-2xl tracking-widest focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full bg-[#ffd700] hover:bg-[#ffe44c] disabled:opacity-50 text-black font-bold py-3 rounded-lg transition disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-[#bbb] text-sm">Resend OTP in <span className="text-[#ffd700] font-semibold">{resendTimer}s</span></p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-[#ffd700] hover:underline text-sm font-semibold transition"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={() => window.location.href = '/auth/forgot-password'}
            className="w-full bg-transparent hover:bg-[#333] text-white font-bold py-3 rounded-lg transition border border-[#3d3d3d]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
