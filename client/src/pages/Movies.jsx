import React, { useState } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'

const Movies = () => {
  const { shows, loadingShows } = useAppContext()
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  if (loadingShows) return <Loading />

  const allGenres = ['All', ...new Set(shows.flatMap(m => (m.genres || []).map(g => g.name)))]

  const filtered = shows.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = activeGenre === 'All' || (movie.genres || []).some(g => g.name === activeGenre)
    return matchSearch && matchGenre
  })

  return shows.length > 0 ? (
    <div className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 pt-28 pb-20 overflow-hidden">
      <div className="relative">
        <BlurCircle top="0" left="-100px" />
        <BlurCircle bottom="0" right="-80px" />

        <h1 className="text-3xl font-semibold mb-2">All Movies</h1>
        <p className="text-gray-400 mb-8">Browse and book the latest blockbusters</p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-800/60 border border-gray-700 rounded-full px-5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition mb-8"
        />

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {allGenres.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeGenre === genre
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filtered.map(movie => (
              <MovieCard key={movie._id} {...movie} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            No movies found matching <span className="text-white">"{search}"</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 pt-20">
      <h1 className="text-3xl font-semibold mb-2 text-white">No movies available</h1>
      <p>Check back soon — new shows are added regularly.</p>
    </div>
  )
}

export default Movies
