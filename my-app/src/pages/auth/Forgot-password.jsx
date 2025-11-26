import { useState } from 'react'
import apiService from '../../lib/apiService'
import DOMPurify from 'dompurify'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Call API to send OTP
      const response = await apiService.forgotPassword(email)
      
      console.log('Forgot password response:', response)
      
      // Store email in sessionStorage for the verify-otp page
      sessionStorage.setItem('resetEmail', DOMPurify.sanitize(email))
      
      // Redirect to OTP verification page
      setTimeout(() => {
        window.location.href = '/auth/verify-reset-otp'
      }, 100)
    } catch (err) {
      // Handle error - check both error response and status
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.'
      console.error('Forgot password error:', err)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      setError(errorMessage)
    } finally {
      setLoading(false)
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
          Forgot Password
        </h1>
        <p className="text-[#bbb] mb-6 text-sm relative z-10">Enter your email address and we'll send you an OTP to reset your password.</p>

        <div className="relative z-10 space-y-5 mt-8">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(DOMPurify.sanitize(e.target.value))
                setError('')
              }}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
            />
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#ffd700] hover:bg-[#ffe44c] disabled:opacity-50 text-black font-bold py-3 rounded-lg transition disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full bg-transparent hover:bg-[#333] text-white font-bold py-3 rounded-lg transition border border-[#3d3d3d]"
          >
            Back to Login
          </button>

          <p className="text-center text-[#bbb] mt-6 text-sm">
            Remember your password?{' '}
            <a 
              href="/auth/login" 
              className="text-[#ffd700] hover:underline font-semibold transition"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}