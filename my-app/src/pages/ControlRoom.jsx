import { useNavigate } from 'react-router-dom'

export default function ControlRoom() {
  const navigate = useNavigate()

  const features = [
    {
      icon: "🎛️",
      title: "Professional Mixing Console",
      description: "Industry-standard mixing desk with 24+ channels for comprehensive audio control."
    },
    {
      icon: "🔊",
      title: "Reference Monitors",
      description: "High-quality studio monitors calibrated for accurate mixing and mastering decisions."
    },
    {
      icon: "💾",
      title: "Advanced DAW Setup",
      description: "Professional Digital Audio Workstations with full plugin suites and third-party integrations."
    },
    {
      icon: "🎧",
      title: "Analog Equipment",
      description: "Premium preamps, compressors, and EQs for warmth and character in your mix."
    },
    {
      icon: "⚙️",
      title: "Mastering-Grade Tools",
      description: "Professional-grade mastering equipment for final-stage audio optimization."
    },
    {
      icon: "🖥️",
      title: "Multiple Workstations",
      description: "Multiple computer setups for collaboration and simultaneous mixing/mastering projects."
    }
  ]

  const equipment = [
    {
      category: "Mixing Console",
      items: ["Yamaha CL3 Digital Mixing Console", "24+ channels of mixing", "Real-time automation", "Extensive routing options"]
    },
    {
      category: "Monitors & Acoustics",
      items: ["Genelec 8351A studio monitors", "Subwoofer for low-end accuracy", "Professionally treated room", "Acoustically isolated walls"]
    },
    {
      category: "DAW Software",
      items: ["Pro Tools with HD capability", "Logic Pro X", "Ableton Live Suite", "Full plugin library (1000+ plugins)"]
    },
    {
      category: "Outboard Equipment",
      items: ["SSL channel strips", "API 2500 Compressor", "Neve 1073 Preamp", "Thermionic Culture mastering chain"]
    }
  ]

  const services = [
    { title: "🎛️ Mixing", description: "Full mix with professional automation and effects" },
    { title: "🎵 Mastering", description: "Final master preparation for all distribution platforms" },
    { title: "✏️ Editing", description: "Detailed audio editing and time-correction" },
    { title: "🎼 Arrangement", description: "Digital arrangement and production composition" },
    { title: "📊 Restoration", description: "Audio repair and restoration services" },
    { title: "🎧 Monitoring", description: "Remote monitoring for tracking sessions" }
  ]

  const process = [
    {
      step: 1,
      title: "Session Setup",
      description: "Load your session and configure monitoring for optimal workflow"
    },
    {
      step: 2,
      title: "Balance & EQ",
      description: "Initial balance and tonal adjustments for all tracks"
    },
    {
      step: 3,
      title: "Processing",
      description: "Add compression, reverb, and effects for professional sound"
    },
    {
      step: 4,
      title: "Mastering",
      description: "Final optimization and format preparation for distribution"
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
          <h1 className="text-2xl font-bold">Control Room</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Professional Mixing & Mastering Control Room</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">State-of-the-art mixing and mastering facility with industry-standard equipment. Where your tracks become radio-ready masterpieces.</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Book Control Room
          </button>
        </div>
      </section>

      {/* Room Specifications */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Control Room Specifications</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">📐 Dimensions</h3>
            <ul className="space-y-3 text-[#bbb]">
              <li className="flex justify-between">
                <span>Floor Area:</span>
                <span className="font-semibold">120 sq.m</span>
              </li>
              <li className="flex justify-between">
                <span>Ceiling Height:</span>
                <span className="font-semibold">3.5 meters</span>
              </li>
              <li className="flex justify-between">
                <span>Console Position:</span>
                <span className="font-semibold">Centered</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎧 Acoustics</h3>
            <ul className="space-y-3 text-[#bbb]">
              <li className="flex justify-between">
                <span>Treatment:</span>
                <span className="font-semibold">Professional</span>
              </li>
              <li className="flex justify-between">
                <span>Reflection:</span>
                <span className="font-semibold">Minimal</span>
              </li>
              <li className="flex justify-between">
                <span>Response:</span>
                <span className="font-semibold">Flat 20Hz-20kHz</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">👥 Capacity</h3>
            <ul className="space-y-3 text-[#bbb]">
              <li className="flex justify-between">
                <span>Mixing Sessions:</span>
                <span className="font-semibold">2-3 people</span>
              </li>
              <li className="flex justify-between">
                <span>Mastering:</span>
                <span className="font-semibold">1-2 people</span>
              </li>
              <li className="flex justify-between">
                <span>Collaboration:</span>
                <span className="font-semibold">5 maximum</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Studio Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 hover:border-[#ffd700]/60 transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#ffd700] mb-3">{feature.title}</h3>
                <p className="text-[#bbb] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Breakdown */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Professional Equipment</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {equipment.map((cat, idx) => (
            <div key={idx} className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">{cat.category}</h3>
              <ul className="space-y-3">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-[#bbb] flex gap-3">
                    <span className="text-[#ffd700]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Services Offered */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-[#1b1b1b] p-6 rounded-lg border border-[#ffd700]/30">
                <h4 className="text-lg font-bold text-[#ffd700] mb-2">{service.title}</h4>
                <p className="text-[#bbb] text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mixing Process */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Mixing Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {process.map((p, idx) => (
            <div key={idx} className="relative">
              <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
                <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                  {p.step}
                </div>
                <h4 className="text-lg font-bold text-[#ffd700] mb-3">{p.title}</h4>
                <p className="text-[#bbb] text-sm">{p.description}</p>
              </div>
              {idx < process.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 transform -translate-y-1/2 text-[#ffd700] text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎛️ Mixing Hourly</h3>
              <div>
                <p className="text-4xl font-bold text-[#ffd700] mb-2">₱2,500</p>
                <p className="text-[#bbb]">Per hour</p>
              </div>
            </div>
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎵 Full Mix</h3>
              <div>
                <p className="text-4xl font-bold text-[#ffd700] mb-2">₱5,000 - ₱8,000</p>
                <p className="text-[#bbb]">Per song</p>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30 text-center">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎧 Mastering</h3>
            <div>
              <p className="text-4xl font-bold text-[#ffd700] mb-2">₱3,000 - ₱5,000</p>
              <p className="text-[#bbb]">Per song</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Mix & Master?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Our professional control room is ready to elevate your music to the next level. Book your mixing and mastering session today.</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Reserve Control Room
        </button>
      </section>
    </div>
  )
}
