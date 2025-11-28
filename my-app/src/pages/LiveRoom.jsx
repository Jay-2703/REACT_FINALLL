import { useNavigate } from 'react-router-dom'

export default function LiveRoom() {
  const navigate = useNavigate()

  const features = [
    {
      icon: "📏",
      title: "Spacious Design",
      description: "200+ square meters of acoustic recording space designed for live instruments and drums."
    },
    {
      icon: "🥁",
      title: "Drum Recording",
      description: "Professional drum riser with acoustic treatment for punchy, natural drum sounds."
    },
    {
      icon: "🎸",
      title: "Amp Isolation",
      description: "Separate areas for amplifier recording with proper isolation and microphone placement."
    },
    {
      icon: "🎧",
      title: "Headphone Mix",
      description: "Independent monitoring system so performers can hear themselves perfectly while recording."
    },
    {
      icon: "🔊",
      title: "Sound Isolation",
      description: "Professional acoustic treatment minimizes reflections and unwanted room noise."
    },
    {
      icon: "⚡",
      title: "24/7 Recording",
      description: "Power distribution for all your equipment needs with professional electrical setup."
    }
  ]

  const equipment = [
    "Premium drum kit (Yamaha Recording Custom)",
    "Microphone stands and booms for complex setups",
    "Direct input boxes for bass and keyboard",
    "Professional cables and connectors",
    "Cue system for performer monitoring",
    "Real-time effects (reverb, compression)",
    "Multiple microphone placement options"
  ]

  const bestFor = [
    { title: "Drum Recording", description: "Capture natural, full drum sounds with room acoustics" },
    { title: "Band Sessions", description: "Record full band performances in a live setting" },
    { title: "Acoustic Sessions", description: "Perfect for capturing guitar, strings, and acoustic instruments" },
    { title: "Live Instrument Tracking", description: "Multi-instrument tracking with proper isolation" },
    { title: "Rehearsal Recordings", description: "Record your rehearsals for production demos" },
    { title: "Workshop Recording", description: "Capture music education content and masterclasses" }
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
          <h1 className="text-2xl font-bold">Live Room</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Professional Live Recording Studio</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">Our spacious live room is engineered for capturing the raw energy and authentic sound of live instruments. Perfect for bands, orchestras, and any acoustic recording project.</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Book Live Room
          </button>
        </div>
      </section>

      {/* Room Specifications */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Studio Specifications</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-6">📐 Dimensions</h3>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-[#bbb]">Floor Area:</span>
                <span className="text-[#ffd700] font-semibold">200+ sq. meters</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Ceiling Height:</span>
                <span className="text-[#ffd700] font-semibold">5.5 meters</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Room Acoustics:</span>
                <span className="text-[#ffd700] font-semibold">Professionally Treated</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Isolation Rating:</span>
                <span className="text-[#ffd700] font-semibold">45+ dB</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-6">👥 Capacity</h3>
            <ul className="space-y-4">
              <li className="flex justify-between">
                <span className="text-[#bbb]">Standing Room:</span>
                <span className="text-[#ffd700] font-semibold">15-20 people</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Small Ensemble:</span>
                <span className="text-[#ffd700] font-semibold">5-8 musicians</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Full Band:</span>
                <span className="text-[#ffd700] font-semibold">4-6 members</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#bbb]">Comfortable Setup:</span>
                <span className="text-[#ffd700] font-semibold">Yes, with room to spare</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key Features</h2>
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

      {/* Equipment List */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Available Equipment</h2>
        <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">🎵 Instruments & Setup</h3>
              <ul className="space-y-3">
                {equipment.map((item, idx) => (
                  <li key={idx} className="text-[#bbb] flex gap-3">
                    <span className="text-[#ffd700]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#ffd700] mb-6">⚙️ Technical Features</h3>
              <ul className="space-y-3 text-[#bbb]">
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Real-time monitoring with low-latency cue system</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Separate headphone mixes for each performer</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Professional cable management system</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Ambient mic options for room character</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Natural reverb with optional dampening</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#ffd700]">✓</span>
                  <span>Professional lighting for video recording</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Best For */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestFor.map((item, idx) => (
              <div key={idx} className="bg-[#1b1b1b] p-6 rounded-lg border border-[#ffd700]/30">
                <h4 className="text-lg font-bold text-[#ffd700] mb-2">{item.title}</h4>
                <p className="text-[#bbb] text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing</h2>
        <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 text-center">
          <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Live Room Recording</h3>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-[#ffd700]">₱2,500</p>
              <p className="text-[#bbb]">Per hour</p>
            </div>
            <div className="border-t border-[#ffd700]/30 pt-4">
              <p className="text-[#bbb] mb-3">Includes:</p>
              <ul className="text-[#bbb] text-sm space-y-2">
                <li>✓ Professional room setup</li>
                <li>✓ Engineer support and monitoring</li>
                <li>✓ All included equipment</li>
                <li>✓ Headphone monitoring system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Book Your Live Recording</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Experience the perfect blend of professional equipment and acoustic excellence. Our live room is ready for your next recording project.</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Reserve Live Room
        </button>
      </section>
    </div>
  )
}
