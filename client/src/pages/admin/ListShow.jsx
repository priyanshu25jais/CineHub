import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'

const ListShow = () => {
  const { axios, getToken, currency } = useAppContext()

  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  const getAllShows = async () => {
    try {
      const { data } = await axios.get('/api/admin/all-shows', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setShows(data.shows)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load shows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllShows()
  }, [])

  if (loading) return <Loading />

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left text-gray-400">
              <th className="py-3 pr-4">Movie Name</th>
              <th className="py-3 pr-4">Show Time</th>
              <th className="py-3 pr-4">Total Bookings</th>
              <th className="py-3 pr-4">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {shows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">No shows found.</td>
              </tr>
            ) : (
              shows.map((show) => {
                const bookedCount = Object.keys(show.occupiedSeats || {}).length
                return (
                  <tr key={show._id} className="border-b border-gray-800">
                    <td className="py-3 pr-4">{show.movie?.title}</td>
                    <td className="py-3 pr-4">{dateFormat(show.showDateTime)}</td>
                    <td className="py-3 pr-4">{bookedCount}</td>
                    <td className="py-3 pr-4">{currency}{bookedCount * show.showPrice}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ListShow
