import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  slider1, 
  slider2, 
  slider4, 
  slider5,
  recording_studio,
  music_production
} from "../assets/images"

export default function Services() {
  const navigate = useNavigate()

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
          <h1 className="text-2xl font-bold">Services & Features</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Services and Features */}
      <section className="max-w-[1200px] mx-auto p-16">
        {/* Services Grid (Main Services) */}
        <h2 className="text-4xl font-bold text-center mb-10">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          
          {/* Service Card: Music Lessons */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/music-lessons')}
          >
            <img src={slider1} alt="Music School" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2">Music lessons</h3>
              <p className="text-[#bbb] text-sm">Learn to play, create, and perform. We offer lessons for all ages and skill levels in instruments, vocals, songwriting, and music theory.</p>
            </div>
          </div>
          
          {/* Service Card: Recording Studio */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/recording')}
          >
            <img src={recording_studio} alt="Recording Studio" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2">Recording Studio</h3>
              <p className="text-[#bbb] text-sm">Professional multi-track recording for bands, solo artists, and podcasters. Enjoy a creative space with high-end gear, fast turnaround, and optional analog warmth through tape emulation.</p>
            </div>
          </div>
          
          {/* Service Card: Band Rehearsal */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/band-rehearsal')}
          >
            <img src={slider5} alt="Band Rehearsal Studio" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2">Band Rehearsal</h3>
              <p className="text-[#bbb] text-sm">Fully equipped rehearsal rooms for bands and solo performers. Experience high-quality sound, comfortable acoustics, and reliable gear to make every practice session productive and inspiring.</p>
            </div>
          </div>
        </div>

        {/* Studio Features */}
        <h2 className="text-4xl font-bold text-center mt-20 mb-10">Studio Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Feature Card: Live Room */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/live-room')}
          >
            <img src={slider4} alt="Live Room" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h4 className="text-xl font-semibold mb-2">Live Room</h4>
              <p className="text-[#bbb] text-sm">Spacious acoustic-treated live room with drum riser for optimal sound capture.</p>
            </div>
          </div>
          
          {/* Feature Card: Control Room */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/control-room')}
          >
            <img src={music_production} alt="Control Room" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h4 className="text-xl font-semibold mb-2">Control Room</h4>
              <p className="text-[#bbb] text-sm">Industry monitors, high-quality preamps, and 24-track I/O for professional mixing and mastering.</p>
            </div>
          </div>
          
          {/* Feature Card: Main Hall */}
          <div 
            className="bg-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:bg-[#333] transition border border-[#ffd700]/30" 
            style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'}}
            onClick={() => navigate('/main-hall')}
          >
            <img src={slider2} alt="Main Hall" className="h-52 w-full object-cover"/>
            <div className="p-5">
              <h4 className="text-xl font-semibold mb-2">Main Hall</h4>
              <p className="text-[#bbb] text-sm">Spacious multi-purpose venue perfect for performances, workshops, events, and large ensemble recording sessions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
