import { useNavigate } from 'react-router-dom'
import { 
  gallery1, 
  gallery2, 
  gallery3, 
  gallery4,
  gallery5,
  gallery6,
  gallery7,
  gallery8
} from "../assets/images"

export default function Gallery() {
  const navigate = useNavigate()
  
  const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7, gallery8]

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
          <h1 className="text-2xl font-bold">Gallery</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Gallery */}
      <section className="bg-[#1b1b1b] p-8 md:p-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1200px] mx-auto">
          {galleryImages.map((img, i) => (
            <img 
              key={i} 
              src={img} 
              alt={`Studio ${i+1}`} 
              className="rounded-lg h-48 md:h-64 w-full object-cover hover:scale-105 transition cursor-pointer"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
