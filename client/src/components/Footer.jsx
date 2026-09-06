import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="site-footer px-6 md:px-16 lg:px-24 xl:px-44 py-12 border-t border-gray-800 mt-20">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10">

        {/* Logo + tagline */}
        <div className="flex flex-col gap-4 max-w-xs">
          <img src={assets.logo} alt="Logo" className="h-9 w-auto" />
          <p className="text-gray-400 text-sm leading-relaxed">
            Your ultimate destination for booking movie tickets, exploring theaters, and staying updated on the latest releases.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" aria-label="Google Play">
              <img src={assets.googlePlay} alt="Google Play" className="h-8" />
            </a>
            <a href="#" aria-label="App Store">
              <img src={assets.appStore} alt="App Store" className="h-8" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-semibold mb-1">Navigation</h3>
            {[['/', 'Home'], ['/movies', 'Movies'], ['/theaters', 'Theaters'], ['/releases', 'Releases'], ['/favorite', 'Favorite']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-primary transition text-sm">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-semibold mb-1">Account</h3>
            {['/my-bookings', '/favorite'].map((to, i) => (
              <Link key={to} to={to} onClick={() => window.scrollTo(0, 0)} className="text-gray-400 hover:text-primary transition text-sm">
                {['My Bookings', 'Wishlist'][i]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MovieBook. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
