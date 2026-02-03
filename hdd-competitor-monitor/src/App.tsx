import { useState, useEffect } from 'react'
import './App.css'

interface Competitor {
  id: string
  name: string
  googleUrl?: string
  website?: string
  rating: number
  reviewCount: number
  lastChecked: string
  notes: string
  history: { date: string; rating: number; reviewCount: number }[]
}

// Pre-populated Cincinnati deck builders
const DEFAULT_COMPETITORS: Competitor[] = [
  {
    id: '1',
    name: 'Archadeck of Cincinnati',
    website: 'archadeck.com',
    rating: 4.9,
    reviewCount: 127,
    lastChecked: new Date().toISOString().split('T')[0],
    notes: 'Major franchise competitor. Strong Google presence.',
    history: []
  },
  {
    id: '2', 
    name: 'Exterior Additions',
    website: 'exterioradditions.com',
    rating: 4.8,
    reviewCount: 89,
    lastChecked: new Date().toISOString().split('T')[0],
    notes: 'Local company, been around for years.',
    history: []
  },
  {
    id: '3',
    name: 'Cincinnati Custom Decks',
    website: 'cincycustomdecks.com',
    rating: 4.7,
    reviewCount: 54,
    lastChecked: new Date().toISOString().split('T')[0],
    notes: 'Growing competitor in the area.',
    history: []
  }
]

function App() {
  const [competitors, setCompetitors] = useState<Competitor[]>(() => {
    const saved = localStorage.getItem('hdd-competitors')
    return saved ? JSON.parse(saved) : DEFAULT_COMPETITORS
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({})

  useEffect(() => {
    localStorage.setItem('hdd-competitors', JSON.stringify(competitors))
  }, [competitors])

  // Our stats (Hickory Dickory Decks Cincinnati)
  const ourRating = 5.0
  const ourReviews = 12

  const addOrUpdateCompetitor = () => {
    if (!newCompetitor.name) return

    if (editingId) {
      setCompetitors(competitors.map(c => {
        if (c.id === editingId) {
          const newHistory = [...c.history]
          if (c.rating !== newCompetitor.rating || c.reviewCount !== newCompetitor.reviewCount) {
            newHistory.push({
              date: new Date().toISOString().split('T')[0],
              rating: newCompetitor.rating || c.rating,
              reviewCount: newCompetitor.reviewCount || c.reviewCount
            })
          }
          return {
            ...c,
            ...newCompetitor,
            lastChecked: new Date().toISOString().split('T')[0],
            history: newHistory
          }
        }
        return c
      }))
      setEditingId(null)
    } else {
      const competitor: Competitor = {
        id: Date.now().toString(),
        name: newCompetitor.name || '',
        googleUrl: newCompetitor.googleUrl,
        website: newCompetitor.website,
        rating: newCompetitor.rating || 0,
        reviewCount: newCompetitor.reviewCount || 0,
        lastChecked: new Date().toISOString().split('T')[0],
        notes: newCompetitor.notes || '',
        history: []
      }
      setCompetitors([...competitors, competitor])
    }

    setNewCompetitor({})
    setShowForm(false)
  }

  const editCompetitor = (comp: Competitor) => {
    setNewCompetitor(comp)
    setEditingId(comp.id)
    setShowForm(true)
  }

  const deleteCompetitor = (id: string) => {
    if (confirm('Delete this competitor?')) {
      setCompetitors(competitors.filter(c => c.id !== id))
    }
  }

  const sortedCompetitors = [...competitors].sort((a, b) => b.rating - a.rating)

  const avgCompetitorRating = competitors.length 
    ? (competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length).toFixed(1)
    : '0'
  const avgCompetitorReviews = competitors.length
    ? Math.round(competitors.reduce((sum, c) => sum + c.reviewCount, 0) / competitors.length)
    : 0
  const totalMarketReviews = competitors.reduce((sum, c) => sum + c.reviewCount, 0) + ourReviews

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 Competitor Monitor</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      <div className="comparison-section">
        <div className="our-stats">
          <h2>Our Position</h2>
          <div className="stat-row">
            <div className="big-stat">
              <span className="value">{ourRating.toFixed(1)}</span>
              <span className="label">Google Rating</span>
              <span className="stars">{'⭐'.repeat(Math.floor(ourRating))}</span>
            </div>
            <div className="big-stat">
              <span className="value">{ourReviews}</span>
              <span className="label">Reviews</span>
            </div>
          </div>
          <p className="market-insight">
            {ourRating > parseFloat(avgCompetitorRating) 
              ? `✅ Your rating is above market average (${avgCompetitorRating})`
              : `⚠️ Work needed - market average is ${avgCompetitorRating}`}
          </p>
          <p className="market-insight">
            {ourReviews < avgCompetitorReviews
              ? `📈 Opportunity: competitors average ${avgCompetitorReviews} reviews`
              : `✅ Good review count vs competition`}
          </p>
        </div>

        <div className="market-overview">
          <h2>Market Overview</h2>
          <div className="mini-stats">
            <div><span className="num">{competitors.length}</span> competitors tracked</div>
            <div><span className="num">{avgCompetitorRating}</span> avg rating</div>
            <div><span className="num">{avgCompetitorReviews}</span> avg reviews</div>
            <div><span className="num">{totalMarketReviews}</span> total market reviews</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <h2>Competitors</h2>
        <button className="btn-primary" onClick={() => { setNewCompetitor({}); setEditingId(null); setShowForm(true); }}>+ Add Competitor</button>
      </div>

      <div className="competitors-list">
        {sortedCompetitors.map((comp, index) => (
          <div key={comp.id} className="competitor-card">
            <div className="rank">#{index + 1}</div>
            <div className="competitor-main">
              <div className="competitor-header">
                <h3>{comp.name}</h3>
                {comp.website && (
                  <a href={`https://${comp.website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                    🔗 {comp.website}
                  </a>
                )}
              </div>
              
              <div className="competitor-stats">
                <div className="stat">
                  <span className="stat-value">{comp.rating.toFixed(1)}</span>
                  <span className="stat-label">Rating</span>
                  <span className="stars">{'⭐'.repeat(Math.floor(comp.rating))}</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{comp.reviewCount}</span>
                  <span className="stat-label">Reviews</span>
                </div>
                <div className="stat">
                  <span className="stat-value date">{comp.lastChecked}</span>
                  <span className="stat-label">Last Checked</span>
                </div>
              </div>

              {comp.notes && <p className="notes">{comp.notes}</p>}

              {comp.history.length > 0 && (
                <div className="history">
                  <span className="history-label">History:</span>
                  {comp.history.slice(-3).map((h, i) => (
                    <span key={i} className="history-item">
                      {h.date}: {h.rating}★ ({h.reviewCount})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="competitor-actions">
              <button onClick={() => editCompetitor(comp)}>✏️</button>
              <button onClick={() => deleteCompetitor(comp.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="insights-section">
        <h2>💡 Competitive Insights</h2>
        <ul className="insights-list">
          {ourRating >= Math.max(...competitors.map(c => c.rating)) && (
            <li className="insight positive">🏆 You have the highest rating in the market!</li>
          )}
          {ourReviews < Math.min(...competitors.map(c => c.reviewCount)) && (
            <li className="insight warning">⚠️ You have fewer reviews than all competitors. Focus on getting more reviews.</li>
          )}
          {competitors.filter(c => c.rating >= 4.8).length > 2 && (
            <li className="insight neutral">📊 The market is competitive - {competitors.filter(c => c.rating >= 4.8).length} competitors have 4.8+ ratings.</li>
          )}
          <li className="insight neutral">
            📈 To match top competitor reviews, you need {Math.max(...competitors.map(c => c.reviewCount)) - ourReviews} more reviews.
          </li>
        </ul>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Update Competitor' : 'Add Competitor'}</h2>
            <div className="form-grid">
              <input placeholder="Company Name *" value={newCompetitor.name || ''} onChange={e => setNewCompetitor({...newCompetitor, name: e.target.value})} />
              <input placeholder="Website (e.g., example.com)" value={newCompetitor.website || ''} onChange={e => setNewCompetitor({...newCompetitor, website: e.target.value})} />
              <input placeholder="Google Business URL" value={newCompetitor.googleUrl || ''} onChange={e => setNewCompetitor({...newCompetitor, googleUrl: e.target.value})} />
              <div className="input-row">
                <div>
                  <label>Google Rating</label>
                  <input type="number" step="0.1" min="0" max="5" placeholder="4.5" value={newCompetitor.rating || ''} onChange={e => setNewCompetitor({...newCompetitor, rating: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label>Review Count</label>
                  <input type="number" min="0" placeholder="100" value={newCompetitor.reviewCount || ''} onChange={e => setNewCompetitor({...newCompetitor, reviewCount: parseInt(e.target.value)})} />
                </div>
              </div>
              <textarea placeholder="Notes (strengths, weaknesses, observations)" value={newCompetitor.notes || ''} onChange={e => setNewCompetitor({...newCompetitor, notes: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={addOrUpdateCompetitor}>{editingId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>💡 Tip: Check and update competitor stats monthly to track market changes</p>
      </footer>
    </div>
  )
}

export default App
