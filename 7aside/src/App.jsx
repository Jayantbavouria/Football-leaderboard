import { Routes, Route, NavLink } from 'react-router-dom'
import { Trophy, Calendar, Settings } from 'lucide-react'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Admin from './pages/Admin'
import CyberBackground from './components/CyberBackground'

function App() {

  return (
    <>
      <CyberBackground />
      <nav className="navbar">
        <NavLink to="/" className="nav-brand">
          <Trophy size={28} color="#ffffff" />
          7-A-SIDE LEAGUE
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Table
          </NavLink>
          <NavLink to="/matches" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Matches
          </NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Admin
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  )
}

export default App
