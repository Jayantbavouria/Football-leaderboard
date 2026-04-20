import { useState, useEffect } from 'react'
import { Trophy, Activity, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Home() {
  const [standingsA, setStandingsA] = useState([])
  const [standingsB, setStandingsB] = useState([])
  const [topGoalscorers, setTopGoalscorers] = useState([])
  const [topAssists, setTopAssists] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setFetchError('')
        // 1. Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
        
        // 2. Fetch Played Matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('is_played', true)

        // 3. Fetch Top Goalscorers
        const { data: goalsData, error: goalsError } = await supabase
          .from('players')
          .select('*, teams(name)')
          .order('goals', { ascending: false })
          .limit(5)

        // 4. Fetch Top Assist Providers
        const { data: assistsData, error: assistsError } = await supabase
          .from('players')
          .select('*, teams(name)')
          .order('assists', { ascending: false })
          .limit(5)

        if (teamsError) throw teamsError
        if (matchesError) throw matchesError
        if (goalsError) throw goalsError
        if (assistsError) throw assistsError

        // Calculate Standings function
        const calculateTable = (groupName) => {
          let table = teamsData
            .filter(t => t.group_name === groupName)
            .map(team => ({
              ...team,
              p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
            }))

          matchesData.forEach(match => {
            let home = table.find(t => t.id === match.home_team_id)
            let away = table.find(t => t.id === match.away_team_id)

            if(!home || !away) return; // Only process if both teams are in this group

            home.p += 1; home.gf += match.home_score; home.ga += match.away_score;
            away.p += 1; away.gf += match.away_score; away.ga += match.home_score;

            if (match.home_score > match.away_score) {
              home.w += 1; home.pts += 3;
              away.l += 1;
            } else if (match.home_score < match.away_score) {
              away.w += 1; away.pts += 3;
              home.l += 1;
            } else {
              home.d += 1; home.pts += 1;
              away.d += 1; away.pts += 1;
            }
          })

          table.forEach(t => { t.gd = t.gf - t.ga })
          
          table.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts
            if (b.gd !== a.gd) return b.gd - a.gd
            return b.gf - a.gf
          })
          
          return table;
        }

        setStandingsA(calculateTable('A'))
        setStandingsB(calculateTable('B'))
        setTopGoalscorers(goalsData || [])
        setTopAssists(assistsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setFetchError(error.message || JSON.stringify(error))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}><div className="loader"></div></div>

  if (fetchError) {
    return (
      <div style={{textAlign: 'center', marginTop: '4rem', color: '#ff4444'}}>
        <h2>Database Error!</h2>
        <p>Please check your Supabase Setup.</p>
        <code style={{padding: '1rem', background: 'rgba(255,0,0,0.1)', display: 'block', maxWidth: '600px', margin: '1rem auto'}}>{fetchError}</code>
      </div>
    )
  }

  const renderTable = (title, data, delayClass = 'delay-1') => (
    <div className={`glass-card table-container animate-in ${delayClass}`} style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1', marginBottom: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#ffffff' }}>
        <Trophy size={26} color="var(--accent-primary)" /> {title}
      </h2>
      
      <table className="premium-table">
        <thead>
          <tr>
            <th style={{width: '60px'}}>Pos</th>
            <th>Club</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>GF</th>
            <th style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>GA</th>
            <th>GD</th>
            <th style={{color: 'var(--accent-primary)', fontSize: '1rem'}}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="10" style={{textAlign: 'center', padding: '2rem'}}>No teams found.</td></tr>
          ) : data.map((team, index) => (
            <tr key={team.id}>
              <td style={{fontWeight: '800', color: index < 2 ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                {index + 1}
              </td>
              <td>
                <div className="team-cell">
                  <div className="team-logo">
                    {team.logo_url ? <img src={team.logo_url} alt={team.name} /> : team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{fontSize: '1.1rem'}}>{team.name}</span>
                </div>
              </td>
              <td>{team.p}</td>
              <td style={{color: 'var(--accent-secondary)'}}>{team.w}</td>
              <td>{team.d}</td>
              <td>{team.l}</td>
              <td style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>{team.gf}</td>
              <td style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>{team.ga}</td>
              <td style={{fontWeight: '600'}}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td style={{fontWeight: '800', fontSize: '1.2rem', color: 'var(--accent-primary)', textShadow: '0 0 15px var(--accent-primary-glow)'}}>{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="grid-2">
      <div style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1' }}>
        {renderTable("Group A - Leaderboard", standingsA, "delay-1")}
        {renderTable("Group B - Leaderboard", standingsB, "delay-2")}
      </div>

      <div className="stats-grid" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1', display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        <div className="glass-card animate-in delay-3">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#ffffff' }}>
            <Activity size={26} color="var(--accent-primary)" /> Top Goalscorers
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {topGoalscorers.map((player, idx) => (
              <div key={player.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: idx === 0 ? '3px solid var(--accent-primary)' : 'none'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span style={{color: idx === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '1.2rem', minWidth: '24px'}}>{idx + 1}</span>
                  <div>
                    <div style={{fontWeight: 700, fontSize: '1.1rem'}}>{player.name}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{player.teams?.name}</div>
                  </div>
                </div>
                <div className="badge badge-green" style={{fontSize: '0.95rem', padding: '0.5rem 1rem', background: 'rgba(213, 0, 249, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary-glow)'}}>{player.goals} <span style={{fontSize: '0.7rem', opacity: 0.8}}>GOALS</span></div>
              </div>
            ))}
            {topGoalscorers.length === 0 && <p style={{color: 'var(--text-muted)'}}>No goals recorded yet.</p>}
          </div>
        </div>

        <div className="glass-card animate-in delay-3">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#ffffff' }}>
            <Users size={26} color="var(--accent-secondary)" /> Top Assists
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {topAssists.map((player, idx) => (
              <div key={player.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: idx === 0 ? '3px solid var(--accent-secondary)' : 'none'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span style={{color: idx === 0 ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '1.2rem', minWidth: '24px'}}>{idx + 1}</span>
                  <div>
                    <div style={{fontWeight: 700, fontSize: '1.1rem'}}>{player.name}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{player.teams?.name}</div>
                  </div>
                </div>
                <div className="badge badge-blue" style={{fontSize: '0.95rem', padding: '0.5rem 1rem'}}>{player.assists || 0} <span style={{fontSize: '0.7rem', opacity: 0.8}}>ASSISTS</span></div>
              </div>
            ))}
            {topAssists.length === 0 && <p style={{color: 'var(--text-muted)'}}>No assists recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
