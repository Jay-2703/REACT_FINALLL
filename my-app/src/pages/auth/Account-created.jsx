import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccountRegistered() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth/login')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleContinue = () => {
    navigate('/auth/login')
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

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 6px rgba(255, 215, 0, 0.3)' }}>
            Account Registered
          </h1>
          <p className="text-[#bbb] mb-8 text-sm">
            Your MixLab Studio account has been created.
          </p>

          <button
            onClick={handleContinue}
            className="w-full bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-3 rounded-lg transition"
            style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
          >
            Continue to login
          </button>

          <p className="text-[#999] text-xs mt-6">
            Redirecting in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}