import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  slider1, 
  slider2, 
  slider3, 
  slider4, 
  slider5,
  recording_studio,
  music_production
} from "../assets/images"

export default function About() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const sliderImages = [slider1, slider2, slider3, slider4, slider5]

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
          <h1 className="text-2xl font-bold">About MixLab</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="flex justify-center p-8 md:p-16 bg-[#1b1b1b]">
        <div className="flex flex-col md:flex-row items-center max-w-[1200px] gap-10 bg-[#2a2a2a] p-12 shadow-lg rounded-lg border border-[#ffd700]/30" style={{boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'}}>
          <div className="w-full md:w-1/2">
            <div className="overflow-hidden rounded-lg h-80 relative">
              <div className="flex h-full transition-transform duration-500 ease-in-out" style={{transform: `translateX(-${currentSlide * 100}%)`}}>
                {sliderImages.map((img, i) => (
                  <div key={i} className="min-w-full h-full">
                    <img src={img} alt={`Studio Slide ${i+1}`} className="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>
              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {sliderImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide ? 'bg-[#ffd700] w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-5 text-[#ffd700]">MixLab Music Studio</h1>
            <p className="mb-4 text-[#bbb]">We handle professional-level production for streaming-ready, radio-worthy, and strong tracks! This is <span className="text-[#ffd700] font-semibold">NOT AI-generated</span>.</p>
            <p className="mb-6 text-[#bbb]">Your song will be produced by real musicians, producers, and arrangers who know how to create the perfect sound.</p>
          </div>
        </div>
      </section>

      {/* About MixLab Section */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Who We Are</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30" style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'}}>
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Our Mission</h3>
            <p className="text-[#bbb] leading-relaxed">
              MixLab Music Studio is dedicated to providing world-class music production, recording, and learning services. We believe in empowering musicians, artists, and creators by giving them access to professional-grade equipment and experienced mentors in a creative, welcoming environment.
            </p>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30" style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'}}>
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Our Vision</h3>
            <p className="text-[#bbb] leading-relaxed">
              To become the premier music production hub in the Philippines where aspiring and professional musicians can turn their creative dreams into reality. We aim to foster a community of musical excellence and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Why Choose MixLab?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl text-[#ffd700] mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-3">Professional Equipment</h3>
              <p className="text-[#bbb] text-sm">Industry-standard gear including analog consoles, high-end microphones, professional monitors, and state-of-the-art recording technology.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-[#ffd700] mb-4">👥</div>
              <h3 className="text-xl font-bold mb-3">Expert Team</h3>
              <p className="text-[#bbb] text-sm">Our team consists of experienced producers, engineers, and musicians with years of industry experience and passion for music.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-[#ffd700] mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Personalized Service</h3>
              <p className="text-[#bbb] text-sm">We work closely with each client to understand their vision and deliver customized solutions that exceed expectations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-xl font-bold text-[#ffd700] mb-3">🎤 Music Lessons</h3>
            <p className="text-[#bbb] text-sm mb-3">Learn from industry professionals. We offer lessons in instruments, vocals, songwriting, music theory, and production for all skill levels.</p>
            <a href="/services" className="text-[#ffd700] hover:underline text-sm font-semibold">Learn More →</a>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-xl font-bold text-[#ffd700] mb-3">🎙️ Recording Studio</h3>
            <p className="text-[#bbb] text-sm mb-3">Professional multi-track recording for artists, bands, and podcasters with options for mixing, mastering, and production.</p>
            <a href="/services" className="text-[#ffd700] hover:underline text-sm font-semibold">Learn More →</a>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-xl font-bold text-[#ffd700] mb-3">🎸 Band Rehearsal</h3>
            <p className="text-[#bbb] text-sm mb-3">Fully equipped rehearsal rooms with excellent acoustics, professional sound systems, and a creative atmosphere for your band.</p>
            <a href="/services" className="text-[#ffd700] hover:underline text-sm font-semibold">Learn More →</a>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-xl font-bold text-[#ffd700] mb-3">💿 Production & Mixing</h3>
            <p className="text-[#bbb] text-sm mb-3">From pre-production planning to final mastering, we provide complete production services to bring your vision to life.</p>
            <a href="/services" className="text-[#ffd700] hover:underline text-sm font-semibold">Learn More →</a>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Visit Us</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30">
                <h3 className="text-2xl font-bold text-[#ffd700] mb-4">📍 Location</h3>
                <p className="text-[#bbb] mb-4">4th Floor Unit 401<br/>RCJ Building Ortigas Extension<br/>Countryside Ave.<br/>Pasig City, Philippines</p>
                
                <h3 className="text-2xl font-bold text-[#ffd700] mb-4 mt-6">📞 Contact</h3>
                <p className="text-[#bbb] mb-2"><a href="mailto:mixlabmusicstudios@gmail.com" className="text-[#ffd700] hover:underline">mixlabmusicstudios@gmail.com</a></p>
                <p className="text-[#bbb]"><a href="tel:+639665469046" className="text-[#ffd700] hover:underline">0966 546 9046</a></p>

                <h3 className="text-2xl font-bold text-[#ffd700] mb-4 mt-6">⏰ Hours</h3>
                <p className="text-[#bbb]">Monday – Saturday: 10am – 7pm<br/>Sunday: Closed</p>
              </div>
            </div>
            <div>
              <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30">
                <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Why Visit MixLab?</h3>
                <ul className="text-[#bbb] space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>State-of-the-art recording and mixing facilities</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>Experienced producers and engineers on staff</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>Comfortable and inspiring creative environment</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>Professional-grade equipment and instruments</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>Personalized attention to your musical goals</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>Competitive rates and flexible scheduling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Join hundreds of musicians who have already transformed their sound at MixLab. Whether you're a beginner or a professional, we're here to help you reach your musical potential.</p>
        <button 
          onClick={() => navigate('/bookings')} 
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Book a Session Now
        </button>
      </section>
    </div>
  )
}
