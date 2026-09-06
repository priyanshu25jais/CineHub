import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'

const ListBookings = () => {
  const { axios, getToken, currency } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get('/api/admin/all-bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllBookings()
  }, [])

  if (loading) return <Loading />

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left text-gray-400">
              <th className="py-3 pr-4">User Name</th>
              <th className="py-3 pr-4">Movie Name</th>
              <th className="py-3 pr-4">Show Time</th>
              <th className="py-3 pr-4">Seats</th>
              <th className="py-3 pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">No bookings found.</td>
              </tr>
            ) : (
              bookings.map((item) => (
                <tr key={item._id} className="border-b border-gray-800">
                  <td className="py-3 pr-4">{item.user?.name}</td>
                  <td className="py-3 pr-4">{item.show?.movie?.title}</td>
                  <td className="py-3 pr-4">{dateFormat(item.show?.showDateTime)}</td>
                  <td className="py-3 pr-4">{item.bookedSeats.join(', ')}</td>
                  <td className="py-3 pr-4">{currency}{item.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ListBookings
