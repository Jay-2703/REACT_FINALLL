import { useNavigate } from 'react-router-dom'
import { recording_studio, music_production } from "../assets/images"

export default function Recording() {
  const navigate = useNavigate()

  const services = [
    {
      title: "Tracking",
      icon: "🎤",
      description: "Professional multi-track recording with high-end microphones and preamps for instruments, vocals, and drums."
    },
    {
      title: "Mixing",
      icon: "🎛️",
      description: "Industry-standard mixing in our control room with professional monitors and mixing plugins."
    },
    {
      title: "Mastering",
      icon: "🎧",
      description: "Final mastering polish to make your track radio-ready and optimized for all platforms."
    },
    {
      title: "Arrangement",
      icon: "🎵",
      description: "Professional arrangers help shape your song and add that professional studio sound."
    },
    {
      title: "Production",
      icon: "🎸",
      description: "Full production services including pre-production planning and instrumentation."
    },
    {
      title: "Podcast Recording",
      icon: "🎙️",
      description: "Professional podcast recording and editing for your show or interview series."
    }
  ]

  const process = [
    {
      step: 1,
      title: "Pre-Production",
      details: ["Discuss your vision and goals", "Review song structure and arrangement", "Create a session plan", "Technical setup and sound check"]
    },
    {
      step: 2,
      title: "Recording",
      details: ["Capture high-quality recordings", "Multiple takes for best results", "Professional editing and comping", "Quality assurance throughout"]
    },
    {
      step: 3,
      title: "Mixing",
      details: ["Balance all instruments", "Add effects and processing", "Create professional sound", "Multiple revision rounds"]
    },
    {
      step: 4,
      title: "Mastering",
      details: ["Optimize for all platforms", "Final quality control", "Deliver in all formats", "Distribution-ready files"]
    }
  ]

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
          <h1 className="text-2xl font-bold">Recording Services</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Professional Recording Studio</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">Make your music sound professional with our state-of-the-art recording facilities. From tracking to mastering, we have everything you need to create streaming-ready, radio-worthy tracks.</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Book a Session
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Recording Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 hover:bg-[#333] transition" style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'}}>
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-[#ffd700] mb-3">{service.title}</h3>
              <p className="text-[#bbb] text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recording Process */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Recording Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {process.map((p, idx) => (
              <div key={idx} className="relative">
                <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30">
                  <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                    {p.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#ffd700] mb-4">{p.title}</h3>
                  <ul className="space-y-2">
                    {p.details.map((detail, i) => (
                      <li key={i} className="text-[#bbb] text-sm flex gap-2">
                        <span className="text-[#ffd700]">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {idx < process.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 transform -translate-y-1/2 text-[#ffd700] text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Info */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Professional Studio Equipment</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎙️ Recording Equipment</h3>
            <ul className="space-y-3 text-[#bbb] text-sm">
              <li>• High-end condenser microphones (Neumann, Rode, Shure)</li>
              <li>• Professional preamps and interfaces</li>
              <li>• Multiple microphone techniques</li>
              <li>• Acoustic treatment for optimal recording</li>
              <li>• Professional DAWs (Pro Tools, Logic, Ableton)</li>
              <li>• 24-track simultaneous recording capability</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎧 Mixing & Mastering</h3>
            <ul className="space-y-3 text-[#bbb] text-sm">
              <li>• Industry-standard mixing console</li>
              <li>• Professional studio monitors</li>
              <li>• Premium plugins and effects</li>
              <li>• Mastering-grade equipment</li>
              <li>• Analog warmth options (tape emulation)</li>
              <li>• Multiple monitoring environments</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Hour Rates</h3>
              <div className="space-y-3 text-[#bbb]">
                <p className="text-3xl font-bold text-[#ffd700]">₱2,000 - ₱3,500</p>
                <p className="text-sm">Depends on session type and engineer</p>
              </div>
            </div>
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Per Song</h3>
              <div className="space-y-3 text-[#bbb]">
                <p className="text-3xl font-bold text-[#ffd700]">₱8,000 - ₱15,000</p>
                <p className="text-sm">Complete package (tracking + mixing)</p>
              </div>
            </div>
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Mastering Only</h3>
              <div className="space-y-3 text-[#bbb]">
                <p className="text-3xl font-bold text-[#ffd700]">₱2,000 - ₱3,000</p>
                <p className="text-sm">Per song mastering service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Record?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Let's turn your music into a professional-quality production. Book your recording session today and take your music to the next level!</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Book Recording Session
        </button>
      </section>
    </div>
  )
}
