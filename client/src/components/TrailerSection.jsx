import React, { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import BlurCircle from './BlurCircle'
import { useAppContext } from '../context/AppContext'

const getYouTubeId = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : null
}

const TrailerSection = () => {
  const { shows, axios } = useAppContext()
  const [trailers, setTrailers] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const loadTrailers = async () => {
      if (!shows || shows.length === 0) return
      try {
        // fetch real trailers (from TMDB, via our backend) for the first few now-showing movies
        const results = await Promise.all(
          shows.slice(0, 4).map(async (movie) => {
            try {
              const { data } = await axios.get(`/api/movie/${movie._id}/trailers`)
              if (data.success && data.trailers.length > 0) {
                return data.trailers[0]
              }
            } catch (error) {
              console.error('Error fetching trailer:', error)
            }
            return null
          })
        )
        setTrailers(results.filter(Boolean))
      } catch (error) {
        console.error('Error fetching trailers:', error)
      }
    }
    loadTrailers()
  }, [shows])

  if (trailers.length === 0) return null

  const active = trailers[activeIndex]
  const videoId = getYouTubeId(active.videoUrl)

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-16 overflow-hidden relative">
      <BlurCircle top="0" left="-80px" />

      <p className="text-gray-300 font-medium text-lg mb-8">Trailers</p>

      {/* Main Player */}
      <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-700/40">
        <div className="relative aspect-video bg-black">
          {videoId ? (
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <img src={active.image} alt="Trailer" className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Thumbnail Row */}
      <div className="flex justify-center gap-4 mt-6 flex-wrap">
        {trailers.map((trailer, i) => {
          const tid = getYouTubeId(trailer.videoUrl)
          return (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-36 aspect-video rounded-lg overflow-hidden border-2 transition flex-shrink-0
                ${activeIndex === i ? 'border-primary scale-105' : 'border-transparent opacity-60 hover:opacity-90'}`}
            >
              <img
                src={tid ? `https://img.youtube.com/vi/${tid}/mqdefault.jpg` : trailer.image}
                alt={`Trailer ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TrailerSection
