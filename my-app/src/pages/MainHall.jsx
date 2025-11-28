import { useNavigate } from 'react-router-dom'

export default function MainHall() {
  const navigate = useNavigate()

  const features = [
    {
      icon: "🎪",
      title: "Spacious Venue",
      description: "300+ square meters of flexible space perfect for larger ensembles, events, and performances."
    },
    {
      icon: "🎤",
      title: "Professional PA System",
      description: "Full-range audio system with professional-grade amplification and speaker array."
    },
    {
      icon: "💡",
      title: "Stage Lighting",
      description: "Professional lighting rig with programmable effects, color mixing, and automation."
    },
    {
      icon: "🎥",
      title: "Video Capability",
      description: "Professional-grade video recording and streaming capability for live events."
    },
    {
      icon: "🛋️",
      title: "Flexible Layout",
      description: "Modular seating and staging options for different event configurations."
    },
    {
      icon: "🔌",
      title: "Full Tech Support",
      description: "On-site technicians for sound, lighting, and video operation and support."
    }
  ]

  const specifications = [
    { metric: "Floor Area", value: "300+ sq. meters" },
    { metric: "Ceiling Height", value: "6 meters" },
    { metric: "Standing Capacity", value: "50-80 people" },
    { metric: "Seated Capacity", value: "30-40 people" },
    { metric: "Stage Size", value: "8m x 6m" },
    { metric: "Power Supply", value: "50 kW available" }
  ]

  const useCases = [
    {
      title: "🎸 Band Performances",
      description: "Full band rehearsals, recordings, and live performances with complete technical support."
    },
    {
      title: "🎼 Orchestral Recording",
      description: "Large ensemble and orchestra recording sessions with proper microphone placement."
    },
    {
      title: "🎪 Live Events",
      description: "Concerts, showcases, and live streaming events with professional production setup."
    },
    {
      title: "📚 Workshops",
      description: "Music workshops, masterclasses, and seminars with audience seating and presentation tools."
    },
    {
      title: "🎬 Video Production",
      description: "Music video filming, live recording, and performance documentation."
    },
    {
      title: "🎉 Private Events",
      description: "Corporate events, celebrations, and private performances with full technical setup."
    }
  ]

  const equipment = [
    { category: "Audio", items: ["24-channel mixing console", "Professional amplifiers (2000W RMS)", "Full-range PA system", "Multiple microphone types", "Wireless microphone systems", "Professional monitors"] },
    { category: "Lighting", items: ["LED stage lights", "Moving head fixtures", "Color mixing system", "DMX lighting control", "Programmable effects", "Professional gels & filters"] },
    { category: "Video", items: ["4K video recording", "Multiple camera angles", "Live streaming capability", "Video projection system", "Large LED screens (optional)", "Green screen setup"] },
    { category: "Stage", items: ["Professional stage (8m x 6m)", "Acoustic shell (available)", "Drum riser", "Adjustable staging", "Professional cables & connections", "Instrument storage"] }
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
          <h1 className="text-2xl font-bold">Main Hall</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Premium Multi-Purpose Hall & Event Space</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">Our spacious main hall is the perfect venue for concerts, workshops, recording sessions, and special events. Equipped with professional-grade audio, lighting, and video technology.</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Book Main Hall
          </button>
        </div>
      </section>

      {/* Specifications */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Hall Specifications</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {specifications.map((spec, idx) => (
            <div key={idx} className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 text-center">
              <p className="text-[#bbb] text-sm mb-2">{spec.metric}</p>
              <p className="text-3xl font-bold text-[#ffd700]">{spec.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Premium Features</h2>
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

      {/* Equipment Section */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Professional Equipment</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {equipment.map((cat, idx) => (
            <div key={idx} className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">{cat.category}</h3>
              <ul className="space-y-3">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-[#bbb] flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="bg-[#1b1b1b] p-6 rounded-lg border border-[#ffd700]/30 hover:bg-[#1b1b1b]/80 transition">
                <h4 className="text-lg font-bold text-[#ffd700] mb-2">{useCase.title}</h4>
                <p className="text-[#bbb] text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Setups */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Flexible Configuration Options</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎤 Concert Setup</h3>
            <ul className="space-y-2 text-[#bbb] text-sm">
              <li>✓ Full stage and PA system</li>
              <li>✓ Professional lighting rig</li>
              <li>✓ Video projection option</li>
              <li>✓ Audience seating/standing</li>
              <li>✓ Technical support included</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎓 Workshop Setup</h3>
            <ul className="space-y-2 text-[#bbb] text-sm">
              <li>✓ Presentation area</li>
              <li>✓ Audience seating</li>
              <li>✓ Microphone & audio</li>
              <li>✓ Video display available</li>
              <li>✓ Recording capabilities</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">🎵 Recording Setup</h3>
            <ul className="space-y-2 text-[#bbb] text-sm">
              <li>✓ Multi-track recording</li>
              <li>✓ Multiple instrument setup</li>
              <li>✓ Professional monitoring</li>
              <li>✓ Acoustic treatment</li>
              <li>✓ Engineer support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Technical Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">🎙️ Audio Capabilities</h3>
              <ul className="space-y-3 text-[#bbb]">
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>24-channel professional mixing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>2000W RMS amplification</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Wireless microphones (8 channels)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Professional in-ear monitoring</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Multi-track recording capability</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#1b1b1b] p-8 rounded-lg border border-[#ffd700]/30">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">🎬 Video & Lighting</h3>
              <ul className="space-y-3 text-[#bbb]">
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>4K video recording and streaming</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Professional lighting control (DMX)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Automated lighting effects</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Video projection & display options</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">•</span>
                  <span>Professional color grading available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing & Packages</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 text-center">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Base Rate</h3>
            <div>
              <p className="text-4xl font-bold text-[#ffd700] mb-2">₱4,500</p>
              <p className="text-[#bbb] mb-4">Per hour</p>
              <p className="text-[#bbb] text-sm">Basic PA & lighting</p>
            </div>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/60 text-center shadow-lg" style={{boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'}}>
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">⭐ Full Production</h3>
            <div>
              <p className="text-4xl font-bold text-[#ffd700] mb-2">₱6,500</p>
              <p className="text-[#bbb] mb-4">Per hour</p>
              <p className="text-[#bbb] text-sm">Full audio, lighting & video</p>
            </div>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 text-center">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">All-Day Rate</h3>
            <div>
              <p className="text-4xl font-bold text-[#ffd700] mb-2">₱45,000</p>
              <p className="text-[#bbb] mb-4">8-hour block</p>
              <p className="text-[#bbb] text-sm">Full production included</p>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-[#2a2a2a] p-6 rounded-lg border border-[#ffd700]/30 text-center">
          <p className="text-[#bbb]">All rates include technical support • Additional equipment rental available • Special event pricing available</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Event?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">From intimate workshops to large-scale productions, our main hall is equipped to handle all your needs. Contact us for custom packages and special pricing.</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Reserve Main Hall
        </button>
      </section>
    </div>
  )
}
