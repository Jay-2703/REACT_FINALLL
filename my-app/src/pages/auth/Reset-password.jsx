import { useState, useEffect } from 'react'
import apiService from '../../lib/apiService'
import DOMPurify from 'dompurify'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Get email and reset token from sessionStorage
    const storedEmail = sessionStorage.getItem('resetEmail')
    const token = sessionStorage.getItem('resetToken')
    
    if (storedEmail && token) {
      setEmail(storedEmail)
      setResetToken(token)
    } else {
      // Redirect back to forgot password if no token
      window.location.href = '/auth/forgot-password'
    }
  }, [])

  const validatePassword = (password) => {
    const errors = []
    
    if (password.length < 8) {
      errors.push('At least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('At least one special character')
    }
    
    return errors
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: DOMPurify.sanitize(value) }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.newPassword.trim()) {
      setError('New password is required')
      return
    }

    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await apiService.resetPassword({
        email: email,
        newPassword: formData.newPassword,
        resetToken: resetToken
      })

      setSuccess(true)
      
      // Clear sessionStorage
      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetToken')
      
      // Redirect to login after 2 seconds
      setTimeout(() => window.location.href = '/auth/login', 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ slashed }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
      {slashed ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  )

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-poppins bg-[#1b1b1b]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.07), transparent 60%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.07), transparent 60%)'
      }}>
        <div className="bg-[#2a2a2a] rounded-2xl w-full max-w-md p-10 relative border border-white/5 text-center" style={{
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
        }}>
          <h2 className="text-3xl font-bold text-[#ffd700] mb-4">Password Reset Successfully!</h2>
          <p className="text-[#bbb] mb-6">Redirecting to login...</p>
          <div className="w-8 h-8 border-4 border-[#ffd700] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
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
          Set New Password
        </h1>
        <p className="text-[#bbb] mb-6 text-sm relative z-10">Enter your new password below</p>

        <div className="relative z-10 space-y-5 mt-8">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-white mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                className="w-full px-4 py-3 pr-12 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 hover:opacity-70 transition"
                aria-label="Toggle password visibility"
              >
                <EyeIcon slashed={!showPassword} />
              </button>
            </div>
            <small className="text-[#666] text-xs mt-1 block">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </small>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 pr-12 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 hover:opacity-70 transition"
                aria-label="Toggle password visibility"
              >
                <EyeIcon slashed={!showConfirmPassword} />
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#ffd700] hover:bg-[#ffe44c] disabled:opacity-50 text-black font-bold py-3 rounded-lg transition disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full bg-transparent hover:bg-[#333] text-white font-bold py-3 rounded-lg transition border border-[#3d3d3d]"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}