import { useNavigate } from 'react-router-dom'
import { slider1, music_production, recording_studio } from "../assets/images"

export default function MusicLessons() {
  const navigate = useNavigate()

  const lessonTypes = [
    {
      title: "Vocal Training",
      icon: "🎤",
      description: "Learn proper breathing techniques, pitch control, performance skills, and develop your unique voice."
    },
    {
      title: "Guitar Lessons",
      icon: "🎸",
      description: "From acoustic basics to electric shred, learn fingerpicking, chords, and songwriting techniques."
    },
    {
      title: "Drums & Percussion",
      icon: "🥁",
      description: "Master rhythm, timing, and coordination. Learn various drumming styles and techniques."
    },
    {
      title: "Keyboard & Piano",
      icon: "🎹",
      description: "Explore music theory, classical techniques, and modern keyboard skills for all genres."
    },
    {
      title: "Bass Guitar",
      icon: "🎼",
      description: "Learn groove, timing, and music theory essentials for becoming a solid bass player."
    },
    {
      title: "Music Production",
      icon: "🎧",
      description: "Learn beat-making, mixing, mastering, and production techniques using industry-standard software."
    }
  ]

  const whyChoose = [
    "One-on-one personalized instruction tailored to your skill level",
    "Experienced instructors with professional music industry background",
    "Flexible scheduling to fit your busy lifestyle",
    "Professional studio environment with high-quality instruments",
    "Progress tracking and personalized learning plans",
    "Access to our facility and recording equipment"
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
          <h1 className="text-2xl font-bold">Music Lessons</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Learn Music from the Pros</h2>
          <p className="text-[#bbb] text-lg mb-8 max-w-2xl">Whether you're a complete beginner or looking to refine your skills, our experienced instructors are here to guide you on your musical journey. Start your lesson today!</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
          >
            Book a Lesson
          </button>
        </div>
      </section>

      {/* Lesson Types Grid */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Lesson Offerings</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessonTypes.map((lesson, idx) => (
            <div key={idx} className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30 hover:bg-[#333] transition" style={{boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)'}}>
              <div className="text-5xl mb-4">{lesson.icon}</div>
              <h3 className="text-2xl font-bold text-[#ffd700] mb-3">{lesson.title}</h3>
              <p className="text-[#bbb] text-sm">{lesson.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#2a2a2a] p-8 md:p-16">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How Our Lessons Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Book</h3>
              <p className="text-[#bbb] text-sm">Choose your instrument and instructor, then select a time that works for you.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Meet</h3>
              <p className="text-[#bbb] text-sm">Arrive at our studio and meet your instructor in our professional environment.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Learn</h3>
              <p className="text-[#bbb] text-sm">Get personalized instruction tailored to your skill level and musical goals.</p>
            </div>
            <div className="text-center">
              <div className="bg-[#ffd700] text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-xl font-bold mb-3">Progress</h3>
              <p className="text-[#bbb] text-sm">Track your progress and build your skills with guidance from our experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-[1200px] mx-auto p-8 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Choose MixLab for Lessons?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {whyChoose.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-[#ffd700] text-2xl flex-shrink-0">✓</span>
                <p className="text-[#bbb]">{item}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#2a2a2a] p-8 rounded-lg border border-[#ffd700]/30" style={{boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)'}}>
            <h3 className="text-2xl font-bold text-[#ffd700] mb-4">Flexible Pricing</h3>
            <p className="text-[#bbb] mb-6">We offer flexible lesson packages to suit all budgets:</p>
            <ul className="space-y-3 text-[#bbb]">
              <li className="flex justify-between"><span>Single Lesson (1 hour)</span><span className="text-[#ffd700] font-bold">₱500 - ₱800</span></li>
              <li className="flex justify-between"><span>4-Lesson Package</span><span className="text-[#ffd700] font-bold">₱1,800 - ₱2,800</span></li>
              <li className="flex justify-between"><span>8-Lesson Package</span><span className="text-[#ffd700] font-bold">₱3,200 - ₱5,000</span></li>
              <li className="flex justify-between"><span>Monthly Unlimited</span><span className="text-[#ffd700] font-bold">₱5,000 - ₱8,000</span></li>
            </ul>
            <p className="text-[#bbb] text-sm mt-6 italic">*Prices vary by instrument and instructor level. Contact us for details.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#ffd700]/10 to-[#2a2a2a] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Musical Journey?</h2>
        <p className="text-[#bbb] mb-8 max-w-2xl mx-auto">Join hundreds of students who have discovered their musical potential at MixLab. Whether you want to play for fun or pursue a career, we're here to help!</p>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#ffd700] hover:bg-[#ffe44c] text-black font-bold py-4 px-8 rounded-lg transition shadow-lg text-lg"
        >
          Book Your First Lesson
        </button>
      </section>
    </div>
  )
}
