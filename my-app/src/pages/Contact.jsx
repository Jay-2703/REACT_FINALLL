import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function Contact() {
  const navigate = useNavigate()
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [contactFormError, setContactFormError] = useState('')
  const [contactFormSuccess, setContactFormSuccess] = useState(false)

  const handleContactFormChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({ ...prev, [name]: value }))
  }

  const handleContactFormSubmit = async (e) => {
    e.preventDefault()
    setContactFormError('')
    setContactFormSuccess(false)

    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactFormError('All fields are required')
      return
    }

    try {
      const response = await api.post('/contact', contactForm)
      setContactFormSuccess(true)
      setContactForm({ name: '', email: '', message: '' })
    } catch (err) {
      setContactFormError(err.response?.data?.message || 'Failed to send message')
    }
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1b1b1b] border-b border-[#444] p-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-[#ffd700] hover:text-[#ffe44c] transition font-semibold"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-bold">Contact Us</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Contact */}
      <section className="bg-[#1b1b1b] p-8 md:p-16">
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#ffd700] mb-6 text-center">Get in Touch</h2>
          
          {contactFormSuccess && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg text-center">
              ✅ Thank you! Your message has been sent successfully. We'll get back to you soon!
            </div>
          )}

          {contactFormError && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
              ❌ {contactFormError}
            </div>
          )}

          <form onSubmit={handleContactFormSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              value={contactForm.name}
              onChange={handleContactFormChange}
              className="p-3 rounded bg-[#1c1c1c] border border-[#3d3d3d] text-white placeholder-[#666] focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] outline-none"
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={contactForm.email}
              onChange={handleContactFormChange}
              className="p-3 rounded bg-[#1c1c1c] border border-[#3d3d3d] text-white placeholder-[#666] focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] outline-none"
            />
            <textarea 
              rows={4} 
              name="message"
              placeholder="Message" 
              value={contactForm.message}
              onChange={handleContactFormChange}
              className="p-3 rounded bg-[#1c1c1c] border border-[#3d3d3d] text-white placeholder-[#666] focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] outline-none"
            />
            <button 
              type="submit" 
              className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-semibold py-3 rounded-full transition shadow-lg"
            >
              Send
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1200px] mx-auto text-center text-[#bbb]">
          <div>
            <h4 className="text-[#ffd700] font-semibold mb-2">Studio Address</h4>
            <p>4th Floor Unit 401 RCJ Building Ortigas Extension Countryside Ave. Pasig City, Philippines</p>
          </div>
          <div>
            <h4 className="text-[#ffd700] font-semibold mb-2">Contact Us</h4>
            <p><a href="mailto:mixlabmusicstudios@gmail.com" className="text-[#ffd700] hover:underline">mixlabmusicstudios@gmail.com</a><br/>
            <a href="tel:+639665469046" className="text-[#ffd700] hover:underline">0966 546 9046</a></p>
          </div>
          <div>
            <h4 className="text-[#ffd700] font-semibold mb-2">Music Studio Operation</h4>
            <p>Monday – Saturday: 10am – 7pm<br/>Sunday: Closed</p>
          </div>
        </div>
      </section>
    </div>
  )
}
