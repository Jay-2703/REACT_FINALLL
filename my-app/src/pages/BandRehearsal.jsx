import { useNavigate } from 'react-router-dom'
import { slider5, recording_studio } from "../assets/images"

export default function BandRehearsal() {
  const navigate = useNavigate()

  const features = [
    { icon: "🔊", title: "Professional Sound System", description: "High-quality PA system and stage monitoring for full band setup" },
    { icon: "🎸", title: "Full Instrument Setup", description: "Drums, amplifiers, and keyboards available for use" },
    { icon: "🎧", title: "Live Monitoring", description: "Individual headphone monitoring for each band member" },
    { icon: "📹", title: "Recording Capability", description: "Record your rehearsals for practice and improvement" },
    { icon: "🎛️", title: "Professional Mixing Desk", description: "Mix your sound like a pro with our console" },
    { icon: "🌟", title: "Comfortable Space", description: "Air-conditioned rooms with great acoustics" }
  ]

  const roomOptions = [
    {
      name: "Small Rehearsal Room",
      capacity: "Up to 4 people",
      size: "120 sq.m",
      features: ["Basic sound system", "Drum kit", "Amplifiers", "Monitor headphones"],
      price: "₱1,500/hour",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Medium Rehearsal Room",
      capacity: "Up to 6 people",
      size: "180 sq.m",
      features: ["Advanced sound system", "Full drum kit", "Multiple amplifiers", "Full monitoring system"],
      price: "₱2,000/hour",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Main Hall",
      capacity: "Up to 15 people",
      size: "300+ sq.m",
      features: ["Professional PA system", "Stage lighting", "Recording setup", "Full production capability"],
      price: "₱3,500/hour",
      color: "from-amber-500 to-amber-600"
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
          <h1 className="text-2xl font-bold">Band Rehearsal</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Perfect Space for Your Band</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">Fully equipped rehearsal spaces designed for bands and musicians. Professional sound, comfortable acoustics, and everything you need to practice like a pro.</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Reserve a Room
          </button>
        </div>
      </section>

      {/* Room Options */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Rehearsal Spaces</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {roomOptions.map((room, idx) => (
            <div key={idx} className="bg-[#2a2a2a] rounded-lg border border-[#ffd700]/30 overflow-hidden hover:bg-[#333] transition" style={{boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)'}}>
              <div className={`h-2 bg-gradient-to-r ${room.color}`}></div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#ffd700] mb-2">{room.name}</h3>
                <p className="text-[#bbb] text-sm mb-4">{room.capacity} • {room.size}</p>
                
                <div className="mb-6 pb-6 border-b border-[#444]">
                  <ul className="space-y-2">
                    {room.features.map((feature, i) => (
                      <li key={i} className="text-[#bbb] text-sm flex gap-2">
                        <span className="text-[#ffd700]">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-3xl font-bold text-[#ffd700] mb-4">{room.price}</div>
                <button 
                  onClick={() => navigate('/bookings')}
                  className="w-full bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-3 rounded-lg transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What's Included</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#bbb] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Tips */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Booking Information</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">💡 Tips for Great Rehearsals</h3>
            <ul className="space-y-3 text-[#bbb] text-sm">
              <li>• Arrive 15 minutes early to set up</li>
              <li>• Bring your own instruments if preferred</li>
              <li>• Use our headphone monitoring for better communication</li>
              <li>• Take advantage of recording capability</li>
              <li>• Book recurring slots for band regulars</li>
              <li>• Discuss any special equipment needs beforehand</li>
            </ul>
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30">
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">📋 Requirements</h3>
            <ul className="space-y-3 text-[#bbb] text-sm">
              <li>✓ Valid ID required</li>
              <li>✓ Deposit to secure booking</li>
              <li>✓ 24-hour cancellation policy</li>
              <li>✓ Maximum noise level after 10 PM</li>
              <li>✓ Equipment handling with care</li>
              <li>✓ Respectful treatment of facilities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Rehearse?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Get your band together and book one of our professional rehearsal spaces today. Perfect for practice, writing sessions, or getting ready for your next gig!</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Book Your Rehearsal
        </button>
      </section>
    </div>
  )
}
