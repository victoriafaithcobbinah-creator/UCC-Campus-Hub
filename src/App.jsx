import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase' 
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Dashboard from './pages/Dashboard'
import VirtualCampus from './features/virtual-campus/VirtualCampus'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  if (loading) return <div style={{ background: '#020617', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading UCC Hub...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={session ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />} />
        
        <Route path="/virtual-campus" element={
          session ? (
            profile?.has_completed_character ? 
              <VirtualCampus user={session.user} profile={profile} /> : 
              <Register /> 
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App