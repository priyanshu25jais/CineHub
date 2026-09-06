import React, { useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { Heart } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Favorite = () => {
  const { favoriteMovies, fetchFavoriteMovies, user } = useAppContext()

  useEffect(() => {
    if (user) {
      fetchFavoriteMovies()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 pt-20">
        Please login to view your favorites.
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 pt-28 pb-20 overflow-hidden">
      <BlurCircle top="0" left="-100px" />

      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-7 h-7 fill-primary text-primary" />
        <h1 className="text-3xl font-semibold">My Favorites</h1>
      </div>
      <p className="text-gray-400 mb-10">Movies you've saved to watch</p>

      {favoriteMovies.length === 0 ? (
        <div className="text-center text-gray-500 py-24">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No favorites yet. Tap the heart icon on any movie to save it!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {favoriteMovies.map(movie => (
            <MovieCard key={movie._id} {...movie} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorite
