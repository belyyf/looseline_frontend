import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BetsPage from './bets/pages/BetsPage.jsx'
import { Header } from './components/Header.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Unauthorized')
      })
      .then(data => {
        if (data?.user || data?.data?.user || data?.id) {
          setIsAuthenticated(true)
        } else {
          throw new Error('No user data')
        }
      })
      .catch(() => {
        window.location.href = '/login'
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <Router basename="/betting/">
      <Header />
      <Routes>
        <Route path="/" element={<BetsPage />} />
      </Routes>
    </Router>
  )
}

export default App