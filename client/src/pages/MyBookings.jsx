import React, { useEffect, useState } from 'react'
import { CalendarDays, Clock3, Ticket } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'

const MyBookings = () => {
  const { axios, getToken, user, image_base_url, currency } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      getMyBookings()
    } else {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) return <Loading />

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 pt-20">
        Please login to view your bookings.
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-24 xl:px-44 pt-28 pb-20 overflow-hidden">
      <BlurCircle top="0" right="-80px" />

      <h1 className="text-3xl font-semibold mb-2">My Bookings</h1>
      <p className="text-gray-400 mb-10">All your movie ticket bookings in one place</p>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-500 py-24">
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No bookings yet. Go grab some tickets!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {bookings.map((booking, i) => (
            <div key={booking._id || i} className="flex flex-col sm:flex-row gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              {/* Poster */}
              <img
                src={image_base_url + booking.show?.movie?.poster_path}
                alt={booking.show?.movie?.title}
                className="w-full sm:w-28 h-44 sm:h-auto object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex flex-col justify-between p-4 flex-1 gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{booking.show?.movie?.title}</h2>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${booking.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {booking.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(booking.show?.movie?.genres || []).slice(0, 2).map(g => (
                      <span key={g.id} className="text-xs text-gray-500">{g.name}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(booking.show?.showDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4" />
                    {new Date(booking.show?.showDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    Seats: <span className="text-white">{booking.bookedSeats.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold text-lg">{currency}{booking.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
