import { useState } from 'react';
import apiService from '../../lib/apiService';
import DOMPurify from 'dompurify';

export default function Register() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    birthday: '',
    contact: '',
    home_address: '',
    password: '',
    confirm_password: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: DOMPurify.sanitize(value) }));
  };

  const validate = () => {
    if (!formData.username || !formData.email || !formData.password) return 'All required fields must be filled';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email';
    if (formData.password !== formData.confirm_password) return 'Passwords do not match!';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;
    if (!passwordRegex.test(formData.password)) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&_-)';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    try {
      await apiService.sendRegistrationOTP({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        birthday: formData.birthday,
        contact: formData.contact,
        home_address: formData.home_address,
        password: formData.password
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Send all registration data along with OTP for verification
      await apiService.verifyRegistrationOTP({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        birthday: formData.birthday,
        contact: formData.contact,
        home_address: formData.home_address,
        password: formData.password,
        otp: otp
      });
      setSuccess(true);
      setTimeout(() => window.location.href = '/auth/login', 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
    } catch (err) {
      setError('Google sign up failed.');
      setLoading(false);
    }
  };

  const handleFacebookSignUp = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

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
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-20 font-sans bg-[#1b1b1b]" style={{
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.07), transparent 60%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.07), transparent 60%)'
    }}>
      <div className="bg-[#2a2a2a] rounded-2xl w-full max-w-3xl p-4 sm:p-8 md:p-10 relative border border-white/5" style={{
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

        {success ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#ffd700] mb-4">Account Successfully Created!</h2>
            <p className="text-[#bbb] mb-6">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 6px rgba(255, 215, 0, 0.3)' }}>
              Register
            </h1>
            <p className="text-[#bbb] mb-6 text-sm">Create your MixLab Studio account</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-white mb-1.5">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-white mb-1.5">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-white mb-1.5">Last Name (Optional)</label>
                  <input
                    type="text"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-1.5">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="birthday" className="block text-sm font-semibold text-white mb-1.5">Birthday (Optional)</label>
                  <input
                    type="date"
                    id="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-white mb-1.5">Contact Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#666] text-sm">+63</span>
                    <input
                      type="tel"
                      id="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="9123456789"
                      required
                      maxLength="10"
                      pattern="[0-9]{10}"
                      className="w-full pl-12 pr-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="home_address" className="block text-sm font-semibold text-white mb-1.5">Home Address (Optional)</label>
                <input
                  type="text"
                  id="home_address"
                  value={formData.home_address}
                  onChange={handleChange}
                  placeholder="e.g., 23 Sampaguita St., Brgy. Malinis, Makati City"
                  className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                />
                <small className="text-[#666] text-xs mt-1 block">Format: Street/Block/Lot, Barangay, City/Municipality</small>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-2.5 pr-12 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 hover:opacity-70"
                    aria-label="Toggle password visibility"
                  >
                    <EyeIcon slashed={!showPassword} />
                  </button>
                </div>
                <small className="text-[#666] text-xs mt-1 block">Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&_-)</small>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-white mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-2.5 pr-12 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 hover:opacity-70"
                    aria-label="Toggle password visibility"
                  >
                    <EyeIcon slashed={!showConfirmPassword} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-3 rounded-lg transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
              >
                {loading ? 'Sending OTP...' : 'Register'}
              </button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#444]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#2a2a2a] text-[#aaa]">or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#333] hover:bg-[#db4437] border-none rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 0 10px rgba(219, 68, 55, 0.4)' }}
                >
                  <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" className="w-5 h-5" />
                  <span className="text-white">Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleFacebookSignUp}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#333] hover:bg-[#4267b2] border-none rounded-lg transition font-semibold"
                  style={{ boxShadow: '0 0 10px rgba(66, 103, 178, 0.4)' }}
                >
                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" className="w-5 h-5" />
                  <span className="text-white">Facebook</span>
                </button>
              </div>

              <p className="text-center text-[#bbb] mt-4 text-sm">
                Already have an account?{' '}
                <a href="/auth/login" className="text-[#ffd700] hover:underline font-semibold">
                  Login here
                </a>
              </p>
            </div>
          </>
        ) : (
          <form className="text-center" onSubmit={handleVerifyOtp}>
            <h2 className="text-2xl font-bold text-[#ffd700] mb-4">Check Your Email</h2>
            <p className="text-[#bbb] mb-6">We've sent an OTP to {formData.email}</p>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(DOMPurify.sanitize(e.target.value))}
              placeholder="Enter OTP"
              required
              className="w-full max-w-xs mx-auto px-4 py-2.5 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_6px_#ffd700] transition mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs mx-auto bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#ffd700] hover:underline text-sm mt-4"
            >
              ← Back to registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}