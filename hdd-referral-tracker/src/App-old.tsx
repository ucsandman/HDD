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
  status: 'new' | 'contacted' | 'quoted' | 'qualified' | 'sold' | 'lost'
  value?: number
  createdAt: string
  notes: string
}

interface RewardEvent {
  id: string
  date: string
  type: 'lead' | 'sold' | 'bonus' | 'payout'
  amount: number
  leadId?: string
  note?: string
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
  rewards: {
    earned: number
    paid: number
    pending: number
    history: RewardEvent[]
  }
}

interface RewardConfig {
  leadReward: number
  soldReward: number
  bonusThreshold: number
  bonusAmount: number
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
    if (saved) {
      const parsed = JSON.parse(saved)
      // Migrate old referrers to new schema
      return parsed.map((r: Referrer) => ({
        ...r,
        rewards: r.rewards || {
          earned: 0,
          paid: 0,
          pending: 0,
          history: []
        }
      }))
    }
    return []
  })
  const [rewardConfig, setRewardConfig] = useState<RewardConfig>(() => {
    const saved = localStorage.getItem('hdd-reward-config')
    return saved ? JSON.parse(saved) : {
      leadReward: 50,
      soldReward: 200,
      bonusThreshold: 5,
      bonusAmount: 100
    }
  })
  const [activeTab, setActiveTab] = useState<'leads' | 'referrers' | 'analytics' | 'rewards'>('analytics')
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showReferrerForm, setShowReferrerForm] = useState(false)
  const [showPayoutForm, setShowPayoutForm] = useState<string | null>(null)
  const [showSettingsForm, setShowSettingsForm] = useState(false)
  const [newLead, setNewLead] = useState<Partial<Lead>>({ source: LEAD_SOURCES[0], status: 'new' })
  const [newReferrer, setNewReferrer] = useState<Partial<Referrer>>({})
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutNote, setPayoutNote] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('hdd-leads', JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem('hdd-referrers', JSON.stringify(referrers))
  }, [referrers])

  useEffect(() => {
    localStorage.setItem('hdd-reward-config', JSON.stringify(rewardConfig))
  }, [rewardConfig])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message: string) => {
    setNotification(message)
  }

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
      totalValue: 0,
      rewards: {
        earned: 0,
        paid: 0,
        pending: 0,
        history: []
      }
    }
    setReferrers([referrer, ...referrers])
    setNewReferrer({})
    setShowReferrerForm(false)
  }

  const addRewardToReferrer = (code: string, amount: number, type: RewardEvent['type'], leadId?: string) => {
    setReferrers(prev => prev.map(r => {
      if (r.code === code) {
        const event: RewardEvent = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type,
          amount,
          leadId
        }
        const newEarned = r.rewards.earned + amount
        const newPending = r.rewards.pending + amount
        return {
          ...r,
          rewards: {
            ...r.rewards,
            earned: newEarned,
            pending: newPending,
            history: [event, ...r.rewards.history]
          }
        }
      }
      return r
    }))
  }

  const checkAndAwardBonus = (code: string) => {
    const referrer = referrers.find(r => r.code === code)
    if (!referrer) return

    // Check if they just hit the threshold and haven't received bonus yet
    const bonusEvents = referrer.rewards.history.filter(e => e.type === 'bonus')
    const qualifiedLeads = leads.filter(l => l.referralCode === code && (l.status === 'qualified' || l.status === 'sold')).length

    // Award bonus for every threshold reached
    const bonusesEarned = Math.floor(qualifiedLeads / rewardConfig.bonusThreshold)
    const bonusesPaid = bonusEvents.length

    if (bonusesEarned > bonusesPaid) {
      addRewardToReferrer(code, rewardConfig.bonusAmount, 'bonus')
      showNotification(`Bonus awarded to ${referrer.name} for ${rewardConfig.bonusThreshold} referrals!`)
    }
  }

  const updateLeadStatus = (id: string, status: Lead['status'], value?: number) => {
    setLeads(prevLeads => {
      const lead = prevLeads.find(l => l.id === id)
      if (!lead) return prevLeads

      const oldStatus = lead.status
      const newLeads = prevLeads.map(l => {
        if (l.id === id) {
          return { ...l, status, value: value ?? l.value }
        }
        return l
      })

      // Award rewards based on status change
      if (lead.referralCode && oldStatus !== status) {
        // Award lead reward when qualified
        if (status === 'qualified' && oldStatus !== 'qualified') {
          addRewardToReferrer(lead.referralCode, rewardConfig.leadReward, 'lead', id)
          showNotification(`$${rewardConfig.leadReward} earned for qualified lead!`)
          // Check for bonus
          setTimeout(() => checkAndAwardBonus(lead.referralCode!), 100)
        }

        // Award sold reward when sold
        if (status === 'sold' && oldStatus !== 'sold') {
          addRewardToReferrer(lead.referralCode, rewardConfig.soldReward, 'sold', id)
          showNotification(`$${rewardConfig.soldReward} earned for sold project!`)

          // Update referrer total value
          if (value) {
            setReferrers(prev => prev.map(r =>
              r.code === lead.referralCode
                ? { ...r, totalValue: r.totalValue + value }
                : r
            ))
          }

          // Check for bonus
          setTimeout(() => checkAndAwardBonus(lead.referralCode!), 100)
        }
      }

      return newLeads
    })
  }

  const recordPayout = (referrerId: string) => {
    const amount = parseFloat(payoutAmount)
    if (!amount || amount <= 0) return

    setReferrers(prev => prev.map(r => {
      if (r.id === referrerId) {
        const event: RewardEvent = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: 'payout',
          amount: -amount,
          note: payoutNote || undefined
        }
        const newPaid = r.rewards.paid + amount
        const newPending = r.rewards.pending - amount
        return {
          ...r,
          rewards: {
            ...r.rewards,
            paid: newPaid,
            pending: Math.max(0, newPending),
            history: [event, ...r.rewards.history]
          }
        }
      }
      return r
    }))

    showNotification(`Payout of $${amount} recorded!`)
    setShowPayoutForm(null)
    setPayoutAmount('')
    setPayoutNote('')
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

  // Rewards analytics
  const currentYear = new Date().getFullYear()
  const totalRewardsEarned = referrers.reduce((sum, r) => sum + r.rewards.earned, 0)
  const totalRewardsPaid = referrers.reduce((sum, r) => sum + r.rewards.paid, 0)
  const totalRewardsPending = referrers.reduce((sum, r) => sum + r.rewards.pending, 0)

  const referrersWithPending = referrers.filter(r => r.rewards.pending > 0).sort((a, b) => b.rewards.pending - a.rewards.pending)

  const getYearlyStats = (referrer: Referrer) => {
    const yearlyEvents = referrer.rewards.history.filter(e => {
      const year = new Date(e.date).getFullYear()
      return year === currentYear
    })
    const earned = yearlyEvents.filter(e => e.type !== 'payout').reduce((sum, e) => sum + e.amount, 0)
    const paid = yearlyEvents.filter(e => e.type === 'payout').reduce((sum, e) => sum + Math.abs(e.amount), 0)
    const referrals = leads.filter(l => {
      const year = new Date(l.createdAt).getFullYear()
      return l.referralCode === referrer.code && year === currentYear && (l.status === 'qualified' || l.status === 'sold')
    }).length
    return { earned, paid, referrals }
  }

  return (
    <div className="app">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <header className="header">
        <h1>🎯 Referral & Lead Tracker</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
        <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>👥 Leads</button>
        <button className={activeTab === 'referrers' ? 'active' : ''} onClick={() => setActiveTab('referrers')}>🌟 Referrers</button>
        <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>💰 Rewards</button>
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
                    <option value="qualified">Qualified</option>
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

      {activeTab === 'rewards' && (
        <div className="rewards">
          <div className="toolbar">
            <button className="btn-secondary" onClick={() => setShowSettingsForm(true)}>⚙️ Configure Rewards</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">${totalRewardsEarned.toLocaleString()}</span>
              <span className="stat-label">Total Earned</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">${totalRewardsPaid.toLocaleString()}</span>
              <span className="stat-label">Total Paid</span>
            </div>
            <div className="stat-card">
              <span className="stat-value highlight">${totalRewardsPending.toLocaleString()}</span>
              <span className="stat-label">Pending Payouts</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{referrersWithPending.length}</span>
              <span className="stat-label">Referrers Owed</span>
            </div>
          </div>

          {referrersWithPending.length > 0 && (
            <div className="section">
              <h2>Pending Payouts</h2>
              <div className="payout-list">
                {referrersWithPending.map(ref => (
                  <div key={ref.id} className="payout-card">
                    <div className="payout-header">
                      <div>
                        <h3>{ref.name}</h3>
                        <span className="code-badge">{ref.code}</span>
                      </div>
                      <div className="payout-amount">${ref.rewards.pending.toLocaleString()}</div>
                    </div>
                    <div className="payout-details">
                      <span>Earned: ${ref.rewards.earned.toLocaleString()}</span>
                      <span>Paid: ${ref.rewards.paid.toLocaleString()}</span>
                      <span>Referrals: {ref.referralCount}</span>
                    </div>
                    <button className="btn-primary btn-small" onClick={() => setShowPayoutForm(ref.id)}>Record Payout</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <h2>{currentYear} Annual Summary</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Referrals</th>
                  <th>Earned</th>
                  <th>Paid</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map(ref => {
                  const yearly = getYearlyStats(ref)
                  if (yearly.referrals === 0 && yearly.earned === 0 && yearly.paid === 0) return null
                  return (
                    <tr key={ref.id}>
                      <td>{ref.name}</td>
                      <td>{yearly.referrals}</td>
                      <td>${yearly.earned.toLocaleString()}</td>
                      <td>${yearly.paid.toLocaleString()}</td>
                      <td className="highlight">${(yearly.earned - yearly.paid).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2>All Reward History</h2>
            <div className="history-list">
              {referrers.flatMap(ref =>
                ref.rewards.history.map(event => ({
                  ...event,
                  referrerName: ref.name,
                  referrerCode: ref.code
                }))
              )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 50)
                .map(event => (
                  <div key={event.id} className={`history-item type-${event.type}`}>
                    <div className="history-date">{event.date}</div>
                    <div className="history-details">
                      <strong>{event.referrerName}</strong>
                      <span className="history-type">{event.type}</span>
                      {event.note && <span className="history-note">{event.note}</span>}
                    </div>
                    <div className={`history-amount ${event.amount < 0 ? 'negative' : 'positive'}`}>
                      {event.amount < 0 ? '-' : '+'}${Math.abs(event.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="section">
            <h2>Current Reward Configuration</h2>
            <div className="config-display">
              <div className="config-item">
                <span className="config-label">Qualified Lead Reward</span>
                <span className="config-value">${rewardConfig.leadReward}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Sold Project Reward</span>
                <span className="config-value">${rewardConfig.soldReward}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Bonus Threshold</span>
                <span className="config-value">{rewardConfig.bonusThreshold} referrals</span>
              </div>
              <div className="config-item">
                <span className="config-label">Bonus Amount</span>
                <span className="config-value">${rewardConfig.bonusAmount}</span>
              </div>
            </div>
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

      {showPayoutForm && (
        <div className="modal-overlay" onClick={() => setShowPayoutForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Record Payout</h2>
            {(() => {
              const referrer = referrers.find(r => r.id === showPayoutForm)
              return referrer ? (
                <>
                  <div className="payout-info">
                    <p><strong>{referrer.name}</strong></p>
                    <p>Pending: ${referrer.rewards.pending.toLocaleString()}</p>
                  </div>
                  <div className="form-grid">
                    <input
                      type="number"
                      placeholder="Amount Paid *"
                      value={payoutAmount}
                      onChange={e => setPayoutAmount(e.target.value)}
                      step="0.01"
                      max={referrer.rewards.pending}
                    />
                    <input
                      placeholder="Note (optional)"
                      value={payoutNote}
                      onChange={e => setPayoutNote(e.target.value)}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn-secondary" onClick={() => setShowPayoutForm(null)}>Cancel</button>
                    <button className="btn-primary" onClick={() => recordPayout(showPayoutForm)}>Record Payment</button>
                  </div>
                </>
              ) : null
            })()}
          </div>
        </div>
      )}

      {showSettingsForm && (
        <div className="modal-overlay" onClick={() => setShowSettingsForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reward Configuration</h2>
            <div className="form-grid">
              <div>
                <label>Qualified Lead Reward ($)</label>
                <input
                  type="number"
                  value={rewardConfig.leadReward}
                  onChange={e => setRewardConfig({ ...rewardConfig, leadReward: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Sold Project Reward ($)</label>
                <input
                  type="number"
                  value={rewardConfig.soldReward}
                  onChange={e => setRewardConfig({ ...rewardConfig, soldReward: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label>Bonus Threshold (referrals)</label>
                <input
                  type="number"
                  value={rewardConfig.bonusThreshold}
                  onChange={e => setRewardConfig({ ...rewardConfig, bonusThreshold: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label>Bonus Amount ($)</label>
                <input
                  type="number"
                  value={rewardConfig.bonusAmount}
                  onChange={e => setRewardConfig({ ...rewardConfig, bonusAmount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <p className="form-note">Changes apply to new rewards only. Existing rewards are not retroactively updated.</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowSettingsForm(false)}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>{leads.length} leads • {referrers.length} referrers • ${totalValue.toLocaleString()} tracked • ${totalRewardsPending.toLocaleString()} pending</p>
      </footer>
    </div>
  )
}

export default App
