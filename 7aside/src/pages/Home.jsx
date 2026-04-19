import { useState, useEffect } from 'react'
import { Trophy, Activity, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Home() {
  const [standingsA, setStandingsA] = useState([])
  const [standingsB, setStandingsB] = useState([])
  const [topPlayers, setTopPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 1. Fetch Teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
        
        // 2. Fetch Played Matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('is_played', true)

        // 3. Fetch Top Players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*, teams(name)')
          .order('goals', { ascending: false })
          .limit(5)

        if (teamsError) throw teamsError
        if (matchesError) throw matchesError
        if (playersError) throw playersError

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
        setTopPlayers(playersData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}><div className="loader"></div></div>

  const renderTable = (title, data) => (
    <div className="glass-card table-container" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1', marginBottom: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
        <Trophy size={24} /> {title}
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
                  {team.name}
                </div>
              </td>
              <td>{team.p}</td>
              <td>{team.w}</td>
              <td>{team.d}</td>
              <td>{team.l}</td>
              <td style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>{team.gf}</td>
              <td style={{display: window.innerWidth < 600 ? 'none' : 'table-cell'}}>{team.ga}</td>
              <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td style={{fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-primary)'}}>{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="grid-2">
      <div style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1' }}>
        {renderTable("Group A - Leaderboard", standingsA)}
        {renderTable("Group B - Leaderboard", standingsB)}
      </div>

      <div className="glass-card" style={{ gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>
          <Activity size={24} /> Top Goalscorers
        </h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {topPlayers.map((player, idx) => (
            <div key={player.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <span style={{color: 'var(--text-secondary)', fontWeight: 700}}>{idx + 1}</span>
                <div>
                  <div style={{fontWeight: 600}}>{player.name}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{player.teams?.name}</div>
                </div>
              </div>
              <div className="badge badge-green">{player.goals} Goals</div>
            </div>
          ))}
          {topPlayers.length === 0 && <p style={{color: 'var(--text-muted)'}}>No player stats yet.</p>}
        </div>
      </div>
    </div>
  )
}

export default Home
