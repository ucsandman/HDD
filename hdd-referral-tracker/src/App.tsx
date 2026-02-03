import { useState, useEffect } from 'react'
import './App.css'

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  referralCode?: string
  referredBy?: string
  status: 'new' | 'contacted' | 'quoted' | 'sold' | 'lost'
  value?: number
  createdAt: string
  notes: string
}

interface Referrer {
  id: string
  name: string
  code: string
  phone?: string
  email?: string
  projectDate?: string
  referralCount: number
  totalValue: number
}

const LEAD_SOURCES = [
  'Google Search', 'Google Business Profile', 'Facebook', 'Instagram', 
  'Nextdoor', 'Yard Sign', 'Customer Referral', 'Home Show', 
  'Angi/HomeAdvisor', 'Thumbtack', 'Direct Mail', 'Other'
]

function App() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('hdd-leads')
    return saved ? JSON.parse(saved) : []
  })
  const [referrers, setReferrers] = useState<Referrer[]>(() => {
    const saved = localStorage.getItem('hdd-referrers')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTab, setActiveTab] = useState<'leads' | 'referrers' | 'analytics'>('analytics')
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showReferrerForm, setShowReferrerForm] = useState(false)
  const [newLead, setNewLead] = useState<Partial<Lead>>({ source: LEAD_SOURCES[0], status: 'new' })
  const [newReferrer, setNewReferrer] = useState<Partial<Referrer>>({})

  useEffect(() => {
    localStorage.setItem('hdd-leads', JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem('hdd-referrers', JSON.stringify(referrers))
  }, [referrers])

  const generateCode = (name: string) => {
    const base = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)
    const num = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${base}${num}`
  }

  const addLead = () => {
    if (!newLead.name) return
    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name || '',
      phone: newLead.phone || '',
      email: newLead.email || '',
      source: newLead.source || LEAD_SOURCES[0],
      referralCode: newLead.referralCode,
      referredBy: newLead.referredBy,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
      notes: newLead.notes || ''
    }
    
    // Update referrer count if applicable
    if (lead.referralCode) {
      setReferrers(prev => prev.map(r => 
        r.code === lead.referralCode 
          ? { ...r, referralCount: r.referralCount + 1 }
          : r
      ))
    }
    
    setLeads([lead, ...leads])
    setNewLead({ source: LEAD_SOURCES[0], status: 'new' })
    setShowLeadForm(false)
  }

  const addReferrer = () => {
    if (!newReferrer.name) return
    const referrer: Referrer = {
      id: Date.now().toString(),
      name: newReferrer.name || '',
      code: generateCode(newReferrer.name || ''),
      phone: newReferrer.phone,
      email: newReferrer.email,
      projectDate: newReferrer.projectDate,
      referralCount: 0,
      totalValue: 0
    }
    setReferrers([referrer, ...referrers])
    setNewReferrer({})
    setShowReferrerForm(false)
  }

  const updateLeadStatus = (id: string, status: Lead['status'], value?: number) => {
    setLeads(leads.map(l => {
      if (l.id === id) {
        const updated = { ...l, status, value: value ?? l.value }
        // Update referrer total value if sold
        if (status === 'sold' && l.referralCode && value) {
          setReferrers(prev => prev.map(r =>
            r.code === l.referralCode
              ? { ...r, totalValue: r.totalValue + value }
              : r
          ))
        }
        return updated
      }
      return l
    }))
  }

  // Analytics
  const sourceStats = LEAD_SOURCES.map(source => {
    const sourceLeads = leads.filter(l => l.source === source)
    const sold = sourceLeads.filter(l => l.status === 'sold')
    return {
      source,
      count: sourceLeads.length,
      sold: sold.length,
      value: sold.reduce((sum, l) => sum + (l.value || 0), 0),
      conversionRate: sourceLeads.length ? Math.round((sold.length / sourceLeads.length) * 100) : 0
    }
  }).filter(s => s.count > 0).sort((a, b) => b.value - a.value)

  const totalLeads = leads.length
  const totalSold = leads.filter(l => l.status === 'sold').length
  const totalValue = leads.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.value || 0), 0)
  const referralLeads = leads.filter(l => l.referralCode).length

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Referral & Lead Tracker</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
        <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>👥 Leads</button>
        <button className={activeTab === 'referrers' ? 'active' : ''} onClick={() => setActiveTab('referrers')}>🌟 Referrers</button>
      </div>

      {activeTab === 'analytics' && (
        <div className="analytics">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{totalLeads}</span>
              <span className="stat-label">Total Leads</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalSold}</span>
              <span className="stat-label">Projects Sold</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">${totalValue.toLocaleString()}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{referralLeads}</span>
              <span className="stat-label">From Referrals</span>
            </div>
          </div>

          <div className="section">
            <h2>Lead Source Performance</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Leads</th>
                  <th>Sold</th>
                  <th>Conv. Rate</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sourceStats.map(s => (
                  <tr key={s.source}>
                    <td>{s.source}</td>
                    <td>{s.count}</td>
                    <td>{s.sold}</td>
                    <td>{s.conversionRate}%</td>
                    <td>${s.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sourceStats.length === 0 && <p className="empty">Add leads to see analytics</p>}
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="leads">
          <div className="toolbar">
            <button className="btn-primary" onClick={() => setShowLeadForm(true)}>+ Add Lead</button>
          </div>
          
          <div className="leads-list">
            {leads.map(lead => (
              <div key={lead.id} className={`lead-card status-${lead.status}`}>
                <div className="lead-header">
                  <h3>{lead.name}</h3>
                  <select 
                    value={lead.status} 
                    onChange={e => {
                      const newStatus = e.target.value as Lead['status']
                      if (newStatus === 'sold') {
                        const value = prompt('Project value ($)?')
                        if (value) updateLeadStatus(lead.id, newStatus, parseInt(value))
                      } else {
                        updateLeadStatus(lead.id, newStatus)
                      }
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="sold">Sold</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="lead-details">
                  <span>📅 {lead.createdAt}</span>
                  <span>📍 {lead.source}</span>
                  {lead.referralCode && <span>🎁 Ref: {lead.referralCode}</span>}
                  {lead.value && <span>💰 ${lead.value.toLocaleString()}</span>}
                </div>
                <div className="lead-contact">
                  {lead.phone && <span>📱 {lead.phone}</span>}
                  {lead.email && <span>✉️ {lead.email}</span>}
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="empty">No leads yet. Add your first lead!</p>}
          </div>
        </div>
      )}

      {activeTab === 'referrers' && (
        <div className="referrers">
          <div className="toolbar">
            <button className="btn-primary" onClick={() => setShowReferrerForm(true)}>+ Add Referrer</button>
          </div>
          
          <div className="referrers-grid">
            {referrers.map(ref => (
              <div key={ref.id} className="referrer-card">
                <h3>{ref.name}</h3>
                <div className="referrer-code">
                  <span className="code">{ref.code}</span>
                  <button onClick={() => navigator.clipboard.writeText(ref.code)}>📋</button>
                </div>
                <div className="referrer-stats">
                  <div><span className="num">{ref.referralCount}</span> referrals</div>
                  <div><span className="num">${ref.totalValue.toLocaleString()}</span> value</div>
                </div>
                {ref.phone && <p className="contact">📱 {ref.phone}</p>}
              </div>
            ))}
            {referrers.length === 0 && <p className="empty">Add past customers as referrers to generate codes</p>}
          </div>
        </div>
      )}

      {showLeadForm && (
        <div className="modal-overlay" onClick={() => setShowLeadForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Lead</h2>
            <div className="form-grid">
              <input placeholder="Name *" value={newLead.name || ''} onChange={e => setNewLead({...newLead, name: e.target.value})} />
              <input placeholder="Phone" value={newLead.phone || ''} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
              <input placeholder="Email" value={newLead.email || ''} onChange={e => setNewLead({...newLead, email: e.target.value})} />
              <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="Referral Code (optional)" value={newLead.referralCode || ''} onChange={e => setNewLead({...newLead, referralCode: e.target.value.toUpperCase()})} />
              <textarea placeholder="Notes" value={newLead.notes || ''} onChange={e => setNewLead({...newLead, notes: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLeadForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={addLead}>Add Lead</button>
            </div>
          </div>
        </div>
      )}

      {showReferrerForm && (
        <div className="modal-overlay" onClick={() => setShowReferrerForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Referrer</h2>
            <div className="form-grid">
              <input placeholder="Customer Name *" value={newReferrer.name || ''} onChange={e => setNewReferrer({...newReferrer, name: e.target.value})} />
              <input placeholder="Phone" value={newReferrer.phone || ''} onChange={e => setNewReferrer({...newReferrer, phone: e.target.value})} />
              <input placeholder="Email" value={newReferrer.email || ''} onChange={e => setNewReferrer({...newReferrer, email: e.target.value})} />
              <input type="date" placeholder="Project Date" value={newReferrer.projectDate || ''} onChange={e => setNewReferrer({...newReferrer, projectDate: e.target.value})} />
            </div>
            <p className="form-note">A unique referral code will be generated automatically.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReferrerForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={addReferrer}>Create Referrer</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>{leads.length} leads • {referrers.length} referrers • ${totalValue.toLocaleString()} tracked</p>
      </footer>
    </div>
  )
}

export default App
