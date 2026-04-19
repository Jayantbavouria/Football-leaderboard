import { useState, useEffect } from 'react'
import { ShieldCheck, Plus, Calendar, LogOut, Key } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Forms
  const [teamName, setTeamName] = useState('')
  const [teamGroup, setTeamGroup] = useState('A')
  
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [matchStage, setMatchStage] = useState('group')
  const [matchGroup, setMatchGroup] = useState('A')

  const [playerName, setPlayerName] = useState('')
  const [playerTeam, setPlayerTeam] = useState('')

  const [scores, setScores] = useState({})
  
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchTeams()
      fetchPlayers()
      fetchMatches()
    }
  }, [session])

  async function handleLogin(e) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  async function fetchTeams() {
    const { data } = await supabase.from('teams').select('*')
    if(data) setTeams(data)
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*, teams(name)').order('goals', { ascending: false })
    if(data) setPlayers(data)
  }

  async function fetchMatches() {
    const { data } = await supabase.from('matches').select('*').order('match_date', { ascending: false })
    if(data) setMatches(data)
  }

  async function addTeam(e) {
    e.preventDefault()
    if(!teamName) return;
    setLoading(true)
    const { error } = await supabase.from('teams').insert([{ name: teamName, group_name: teamGroup }])
    if(error) setMessage('Error adding team. Check required fields or policies.')
    else {
      setMessage('Team added successfully!')
      setTeamName('')
      fetchTeams()
    }
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addPlayer(e) {
    e.preventDefault()
    if(!playerName || !playerTeam) return;
    setLoading(true)
    const { error } = await supabase.from('players').insert([{ name: playerName, team_id: playerTeam }])
    if(error) setMessage('Error adding player.')
    else {
      setMessage('Player added successfully!')
      setPlayerName('')
      fetchPlayers()
    }
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addGoal(player) {
    setLoading(true)
    const { error } = await supabase.from('players').update({ goals: player.goals + 1 }).eq('id', player.id)
    if(error) setMessage('Error adding goal.')
    else {
      setMessage(`Added goal for ${player.name}!`)
      fetchPlayers()
    }
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function addMatch(e) {
    e.preventDefault()
    if(!homeTeam || !awayTeam || homeTeam === awayTeam) {
      setMessage("Invalid teams selected.");
      return;
    }
    setLoading(true)
    const { error } = await supabase.from('matches').insert([{ 
      home_team_id: homeTeam, 
      away_team_id: awayTeam,
      match_date: matchDate || null,
      stage: matchStage,
      group_name: matchStage === 'group' ? matchGroup : null
    }])
    if(error) setMessage('Error adding schedule.')
    else setMessage('Match Scheduled!')
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function updateScore(match) {
    const matchScores = scores[match.id] || { home: 0, away: 0 }
    
    // Prevent updating with undefined or null
    if (matchScores.home === undefined || matchScores.home === null || 
        matchScores.away === undefined || matchScores.away === null) {
      setMessage('Please enter a valid score');
      return;
    }
    
    setLoading(true)
    const { error } = await supabase.from('matches').update({
      home_score: matchScores.home,
      away_score: matchScores.away,
      is_played: true
    }).eq('id', match.id)
    
    if(error) setMessage('Error saving result.')
    else {
      setMessage('Result Saved!')
      fetchMatches()
    }
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (authLoading) return <div style={{textAlign: 'center', marginTop: '4rem'}}><div className="loader"></div></div>

  if (!session) {
    return (
      <div style={{maxWidth: '400px', margin: '4rem auto'}}>
        <div className="glass-card">
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)'}}>
            <Key size={24} color="var(--accent-secondary)" /> Admin Login
          </h2>
          {authError && <div style={{padding: '1rem', background: 'rgba(255, 60, 60, 0.1)', color: '#ff4444', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #ff4444'}}>{authError}</div>}
          <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={authLoading} style={{justifyContent: 'center', marginTop: '1rem'}}>
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)'}}>
          <ShieldCheck size={32} color="var(--accent-secondary)"/> Admin Panel
        </h1>
        <button onClick={() => supabase.auth.signOut()} className="btn" style={{background: 'transparent', border: '1px solid var(--border-light)'}}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      
      {message && <div style={{padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent-primary)', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent-primary)'}}>{message}</div>}

      <div className="grid-2">
        {/* Teams Management */}
        <div className="glass-card">
          <h3 style={{marginBottom: '1rem'}}>Add Team</h3>
          <form onSubmit={addTeam} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Team Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={teamName} 
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Manchester Blues" 
              />
            </div>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Group</label>
              <select className="input-field" value={teamGroup} onChange={e => setTeamGroup(e.target.value)} style={{appearance: 'none'}}>
                <option value="A">Group A</option>
                <option value="B">Group B</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{justifyContent: 'center'}}>
              <Plus size={18} /> {loading ? 'Adding...' : 'Create Team'}
            </button>
          </form>
        </div>

        {/* Players Management */}
        <div className="glass-card">
          <h3 style={{marginBottom: '1rem'}}>Add Player</h3>
          <form onSubmit={addPlayer} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Player Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Lionel Messi"
              />
            </div>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Team</label>
              <select className="input-field" value={playerTeam} onChange={e => setPlayerTeam(e.target.value)} style={{appearance: 'none'}}>
                <option value="">Select...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{justifyContent: 'center'}}>
               Add Player
            </button>
          </form>

          <h3 style={{marginBottom: '1rem', marginTop: '1rem'}}>Players & Goals</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px'}}>
             {players.map(p => (
               <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px'}}>
                 <div>
                   <div style={{fontWeight: '600'}}>{p.name} <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>({p.teams?.name})</span></div>
                   <div style={{fontSize: '0.85rem', color: 'var(--accent-secondary)'}}>{p.goals} Goals</div>
                 </div>
                 <button type="button" onClick={() => addGoal(p)} className="btn badge-blue" style={{background: 'var(--accent-secondary)', color: '#000', fontSize: '0.8rem', padding: '0.4rem 0.8rem'}} disabled={loading}>+1 Goal</button>
               </div>
             ))}
             {players.length === 0 && <p style={{color: 'var(--text-muted)'}}>No players added yet.</p>}
          </div>
        </div>

        {/* Matches Management */}
        <div className="glass-card">
          <h3 style={{marginBottom: '1rem'}}>Schedule Match</h3>
          <form onSubmit={addMatch} style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Home Team</label>
                <select className="input-field" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} style={{appearance: 'none'}}>
                  <option value="">Select...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Away Team</label>
                <select className="input-field" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} style={{appearance: 'none'}}>
                  <option value="">Select...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Stage</label>
                <select className="input-field" value={matchStage} onChange={e => setMatchStage(e.target.value)} style={{appearance: 'none'}}>
                  <option value="group">Group Stage</option>
                  <option value="semi">Semi-Final</option>
                  <option value="final">Final</option>
                </select>
              </div>
              {matchStage === 'group' && (
                <div style={{flex: 1}}>
                  <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Group</label>
                  <select className="input-field" value={matchGroup} onChange={e => setMatchGroup(e.target.value)} style={{appearance: 'none'}}>
                    <option value="A">Group A</option>
                    <option value="B">Group B</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Date</label>
              <input type="date" className="input-field" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{justifyContent: 'center'}}>
              <Calendar size={18} /> {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </form>
          
          <h3 style={{marginBottom: '1rem', marginTop: '1rem'}}>Update Match Results</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'}}>
            {matches.filter(m => !m.is_played).map(match => {
              const homeT = teams.find(t => t.id === match.home_team_id)
              const awayT = teams.find(t => t.id === match.away_team_id)
              if (!homeT || !awayT) return null;
              return (
                <div key={match.id} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)'}}>
                   <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>{match.stage === 'group' ? `Group ${match.group_name || 'Stage'}` : match.stage}</div>
                   <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
                     <div style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>{homeT.name}</div>
                     <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                       <input type="number" min="0"
                         style={{width: '50px', textAlign: 'center', padding: '0.4rem'}} className="input-field" 
                         placeholder="0"
                         value={scores[match.id]?.home ?? ''} 
                         onChange={e => setScores({...scores, [match.id]: {...scores[match.id], home: parseInt(e.target.value)}})} />
                       <span>-</span>
                       <input type="number" min="0"
                         style={{width: '50px', textAlign: 'center', padding: '0.4rem'}} className="input-field" 
                         placeholder="0"
                         value={scores[match.id]?.away ?? ''} 
                         onChange={e => setScores({...scores, [match.id]: {...scores[match.id], away: parseInt(e.target.value)}})} />
                     </div>
                     <div style={{flex: 1, fontWeight: 'bold'}}>{awayT.name}</div>
                   </div>
                   <button onClick={() => updateScore(match)} className="btn btn-primary" style={{marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.9rem', padding: '0.5rem'}} disabled={loading}>Save Result</button>
                </div>
              )
            })}
            {matches.filter(m => !m.is_played).length === 0 && <p style={{color: 'var(--text-muted)'}}>No pending matches.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
