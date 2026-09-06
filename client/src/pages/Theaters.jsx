import React, { useEffect, useState } from 'react'
import { MapPin, Clapperboard, Building2 } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'

const Theaters = () => {
  const { axios } = useAppContext()
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const { data } = await axios.get('/api/theater/all')
        if (data.success) {
          setTheaters(data.theaters)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchTheaters()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 pt-28 pb-20 overflow-hidden">
      <BlurCircle top="0" left="-100px" />

      <h1 className="text-3xl font-semibold mb-2">Theaters</h1>
      <p className="text-gray-400 mb-10">Partner cinemas where you can watch your favorite movies</p>

      {theaters.length === 0 ? (
        <div className="text-center text-gray-500 py-24">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No theaters have been added yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theaters.map(theater => (
            <div key={theater._id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600 transition">
              {theater.image && (
                <img src={theater.image} alt={theater.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-5 flex flex-col gap-2">
                <h2 className="font-semibold text-lg">{theater.name}</h2>
                <div className="flex items-start gap-1.5 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{theater.address}, {theater.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Clapperboard className="w-4 h-4" />
                  <span>{theater.screens} Screens</span>
                </div>
                {theater.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {theater.facilities.map((f, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Theaters
