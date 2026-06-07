import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import DemoStore from './pages/DemoStore'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/profile" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/profile" />} />
        <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" />} />
        <Route path="/demo" element={<DemoStore />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App