import React, { useEffect, useState } from 'react'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { CalendarDays, Clock3, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Releases = () => {
  const navigate = useNavigate()
  const { axios, image_base_url } = useAppContext()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await axios.get('/api/movie/all')
        if (data.success) {
          setMovies(data.movies)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  if (loading) return <Loading />

  const sorted = [...movies].sort((a, b) => new Date(b.release_date) - new Date(a.release_date))

  if (sorted.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 pt-20">
        <h1 className="text-3xl font-semibold mb-2 text-white">No releases yet</h1>
        <p>Check back soon for the latest movies.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 pt-28 pb-20 overflow-hidden">
      <BlurCircle top="0" right="-80px" />

      <h1 className="text-3xl font-semibold mb-2">Latest Releases</h1>
      <p className="text-gray-400 mb-10">The newest movies now showing or coming soon</p>

      <div className="flex flex-col gap-6">
        {sorted.map((movie, i) => (
          <div
            key={movie._id}
            onClick={() => { navigate(`/movies/${movie._id}`); window.scrollTo(0, 0) }}
            className="flex gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600 transition cursor-pointer group"
          >
            <div className="flex items-center justify-center w-12 flex-shrink-0 text-2xl font-bold text-gray-700 group-hover:text-gray-600 transition">
              {i + 1}
            </div>

            <img
              src={image_base_url + movie.poster_path}
              alt={movie.title}
              className="w-20 h-28 object-cover flex-shrink-0"
            />

            <div className="flex flex-col justify-center gap-2 py-4 pr-4 flex-1">
              <h2 className="font-semibold text-lg group-hover:text-primary transition">{movie.title}</h2>

              <div className="flex flex-wrap gap-2">
                {(movie.genres || []).slice(0, 3).map(g => (
                  <span key={g.id} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">{g.name}</span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {movie.release_date && new Date(movie.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" />
                  {movie.runtime} min
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span className="font-medium">{movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center pr-5">
              <button
                onClick={e => { e.stopPropagation(); navigate(`/movies/${movie._id}`); window.scrollTo(0, 0) }}
                className="bg-primary hover:bg-primary-dull text-white px-5 py-2 rounded-full text-sm font-medium transition"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Releases
