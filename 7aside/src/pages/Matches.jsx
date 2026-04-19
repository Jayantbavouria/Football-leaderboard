import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'

function Matches() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*')
        if (teamsError) throw teamsError

        const teamMap = {}
        teamsData.forEach(t => teamMap[t.id] = t)
        setTeams(teamMap)

        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .order('match_date', { ascending: false })
          
        if (matchesError) throw matchesError
        
        setMatches(matchesData || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}><div className="loader"></div></div>

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        <CalendarIcon size={24} /> Fixtures & Results
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {matches.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>No matches scheduled yet.</p>
        ) : matches.map(match => {
          const homeT = teams[match.home_team_id]
          const awayT = teams[match.away_team_id]
          
          if (!homeT || !awayT) return null;

          return (
            <div key={match.id} className="match-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div className="match-header">
                <span className="badge badge-blue" style={{textTransform: 'uppercase'}}>
                  {match.stage === 'group' ? `Group ${match.group_name || 'Stage'}` : match.stage === 'semi' ? 'Semi-Final' : match.stage === 'final' ? 'Final' : (match.stage || 'Group Stage')}
                </span>
                {match.match_date && <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}><Clock size={14}/> {format(parseISO(match.match_date), 'MMM d, yyyy')}</span>}
              </div>
              
              <div className="match-teams">
                <div className="match-team">
                  <div className="team-logo">{homeT.logo_url ? <img src={homeT.logo_url}/> : homeT.name.substring(0,2).toUpperCase()}</div>
                  <span style={{fontWeight: 600}}>{homeT.name}</span>
                </div>
                
                <div className="match-score">
                  {match.is_played ? (
                    <><span>{match.home_score}</span> - <span>{match.away_score}</span></>
                  ) : (
                    <span style={{fontSize: '1rem', color: 'var(--text-secondary)', padding: '0 1rem'}}>vs</span>
                  )}
                </div>
                
                <div className="match-team away">
                  <div className="team-logo">{awayT.logo_url ? <img src={awayT.logo_url}/> : awayT.name.substring(0,2).toUpperCase()}</div>
                  <span style={{fontWeight: 600}}>{awayT.name}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Matches
