import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusSquare, ListVideo, ListChecks, Building2 } from 'lucide-react'
import { useUser } from '@clerk/react'
import { assets } from '../../assets/assets'

const adminNavLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquare },
  { name: 'List Shows', path: '/admin/list-shows', icon: ListVideo },
  { name: 'List Bookings', path: '/admin/list-bookings', icon: ListChecks },
  { name: 'Add Theater', path: '/admin/add-theater', icon: Building2 },
]

const AdminSidebar = () => {
  const { user } = useUser()

  return (
    <div className="w-16 md:w-64 border-r border-gray-800 flex flex-col items-center md:items-start pt-8 gap-2 bg-[#09090B]">
      <div className="flex flex-col items-center md:flex-row md:items-center gap-3 px-2 md:px-6 pb-6 w-full">
        <img
          src={user?.imageUrl || assets.profile}
          alt="Admin"
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="hidden md:block truncate">
          <p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {adminNavLinks.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          end={link.path === '/admin'}
          className={({ isActive }) =>
            `flex items-center gap-3 w-full px-2 md:px-6 py-3 justify-center md:justify-start transition
             ${isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`
          }
        >
          <link.icon className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:block text-sm font-medium">{link.name}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default AdminSidebar
