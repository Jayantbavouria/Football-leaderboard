import { Routes, Route, NavLink } from 'react-router-dom'
import { Trophy, Calendar, Settings } from 'lucide-react'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Admin from './pages/Admin'

function App() {

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="nav-brand">
          <Trophy size={28} color="#00ff88" />
          7-A-SIDE LEAGUE
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Trophy size={18} /> Table
          </NavLink>
          <NavLink to="/matches" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Calendar size={18} /> Matches
          </NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Settings size={18} /> Admin
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
