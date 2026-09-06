import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ChartLine, CircleDollarSign, PlayCircle, StarIcon, UsersIcon } from 'lucide-react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'

const DashBoard = () => {
  const { axios, getToken, currency, image_base_url } = useAppContext()

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  const dashboardCards = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || 0, icon: ChartLine },
    { title: 'Total Revenue', value: `${currency}${dashboardData.totalRevenue || 0}`, icon: CircleDollarSign },
    { title: 'Active Shows', value: dashboardData.activeShows.length || 0, icon: PlayCircle },
    { title: 'Total Users', value: dashboardData.totalUsers || 0, icon: UsersIcon },
  ]

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) return <Loading />

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="0" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg w-full sm:w-[47%] lg:w-[23%]"
            >
              <div>
                <p className="text-xs text-gray-400">{card.title}</p>
                <p className="text-xl font-semibold mt-1">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-primary" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative flex flex-wrap gap-4 mt-4">
        <BlurCircle top="100px" left="-10%" />

        {dashboardData.activeShows.length === 0 ? (
          <p className="text-gray-500 text-sm">No active shows right now.</p>
        ) : (
          dashboardData.activeShows.map((show) => (
            <div key={show._id} className="w-48 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700/50 hover:-translate-y-1 transition">
              <img
                src={image_base_url + show.movie?.poster_path}
                alt={show.movie?.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-3">
                <p className="font-medium truncate">{show.movie?.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-semibold">{currency}{show.showPrice}</p>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {show.movie?.vote_average?.toFixed(1)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{dateFormat(show.showDateTime)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default DashBoard
