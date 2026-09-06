import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Theaters from './pages/Theaters'
import Releases from './pages/Releases'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import DashBoard from './pages/admin/DashBoard'
import AddShows from './pages/admin/AddShows'
import ListShow from './pages/admin/ListShow'
import ListBookings from './pages/admin/ListBookings'
import AddTheater from './pages/admin/AddTheater'
import AdminLayout from './pages/admin/Layout'
import { SignIn } from '@clerk/react'
import { useAppContext } from './context/AppContext'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const { user } = useAppContext()

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/theaters" element={<Theaters />} />
        <Route path="/releases" element={<Releases />} />
        <Route
          path="/admin/*"
          element={
            user ? (
              <AdminLayout />
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            )
          }
        >
          <Route index element={<DashBoard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShow />} />
          <Route path="list-bookings" element={<ListBookings />} />
          <Route path="add-theater" element={<AddTheater />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
