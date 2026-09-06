import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import Loading from '../../components/Loading'
import { useAppContext } from '../../context/AppContext'

const AdminLayout = () => {
  const { isAdmin, fetchIsAdmin, user } = useAppContext()

  useEffect(() => {
    if (user) {
      fetchIsAdmin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return <Loading />

  return isAdmin ? (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-10 bg-[#09090B] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
      You are not authorized to access the admin panel.
    </div>
  )
}

export default AdminLayout
