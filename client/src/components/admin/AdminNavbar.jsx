import React from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/react'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-800 bg-[#09090B]">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="h-9 w-auto" />
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 hidden sm:block">Admin Panel</span>
        <UserButton />
      </div>
    </div>
  )
}

export default AdminNavbar
