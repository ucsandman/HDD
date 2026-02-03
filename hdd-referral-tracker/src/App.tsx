import { useState, useEffect, useRef } from 'react'
import './App.css'
import type { Lead, Referrer, DateRange } from './types'
import { parseLeadCSV, exportLeadsToCSV, exportReferrersToCSV, downloadCSV, type CSVImportResult } from './utils/csvUtils'
import { filterLeadsByDateRange, calculateConversionFunnel, calculateSourceMetrics, calculateAverageTimeToClose } from './utils/analytics'

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
  const [showImportModal, setShowImportModal] = useState(false)
  const [showJsonImportModal, setShowJsonImportModal] = useState(false)
  const [newLead, setNewLead] = useState<Partial<Lead>>({ source: LEAD_SOURCES[0], status: 'new' })
  const [newReferrer, setNewReferrer] = useState<Partial<Referrer>>({})
  const [csvContent, setCsvContent] = useState('')
  const [jsonContent, setJsonContent] = useState('')
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('hdd-leads', JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem('hdd-referrers', JSON.stringify(referrers))
  }, [referrers])

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

  const checkDuplicate = (lead: Partial<Lead>): string | null => {
    if (lead.phone) {
      const phoneMatch = leads.find(l => l.phone === lead.phone)
      if (phoneMatch) return `Phone ${lead.phone} already exists (${phoneMatch.name})`
    }
    if (lead.email) {
      const emailMatch = leads.find(l => l.email.toLowerCase() === lead.email?.toLowerCase())
      if (emailMatch) return `Email ${lead.email} already exists (${emailMatch.name})`
    }
    return null
  }

  const addLead = () => {
    if (!newLead.name) return

    // Check for duplicates
    const duplicate = checkDuplicate(newLead)
    if (duplicate) {
      if (!window.confirm(`${duplicate}\n\nAdd anyway?`)) {
        return
      }
    }

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
      const referrer = referrers.find(r => r.code === lead.referralCode)
      if (referrer) {
        setReferrers(prev => prev.map(r =>
          r.code === lead.referralCode
            ? { ...r, referralCount: r.referralCount + 1 }
            : r
        ))
        showNotification(`Lead linked to referrer: ${referrer.name}`)
      }
    }

    setLeads([lead, ...leads])
    setNewLead({ source: LEAD_SOURCES[0], status: 'new' })
    setShowLeadForm(false)
    showNotification('Lead added successfully')
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
    showNotification(`Referrer added with code: ${referrer.code}`)
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

  // CSV Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvContent(text)
    }
    reader.readAsText(file)
  }

  const handleCsvImport = () => {
    if (!csvContent) return

    const result = parseLeadCSV(csvContent, leads)
    setImportResult(result)

    if (result.imported.length > 0) {
      setLeads([...result.imported, ...leads])

      // Update referrer counts
      result.imported.forEach(lead => {
        if (lead.referralCode) {
          setReferrers(prev => prev.map(r =>
            r.code === lead.referralCode
              ? { ...r, referralCount: r.referralCount + 1 }
              : r
          ))
        }
      })

      showNotification(`Imported ${result.imported.length} leads`)
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setCsvContent('')
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // JSON Import (for Lead Response integration)
  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonContent)

      // Support both single object and array
      const leadsToImport = Array.isArray(data) ? data : [data]
      const imported: Lead[] = []
      const skipped: string[] = []

      leadsToImport.forEach((item: Partial<Lead> & { [key: string]: unknown }) => {
        if (!item.name) {
          skipped.push('Missing name')
          return
        }

        // Check for duplicates
        const duplicate = checkDuplicate(item)
        if (duplicate) {
          skipped.push(duplicate)
          return
        }

        const lead: Lead = {
          id: Date.now().toString() + Math.random(),
          name: item.name,
          phone: item.phone || '',
          email: item.email || '',
          source: item.source || 'Other',
          referralCode: item.referralCode?.toUpperCase(),
          referredBy: item.referredBy,
          status: item.status || 'new',
          value: item.value,
          createdAt: item.createdAt || new Date().toISOString().split('T')[0],
          notes: item.notes || ''
        }

        imported.push(lead)

        // Update referrer if applicable
        if (lead.referralCode) {
          setReferrers(prev => prev.map(r =>
            r.code === lead.referralCode
              ? { ...r, referralCount: r.referralCount + 1 }
              : r
          ))
        }
      })

      if (imported.length > 0) {
        setLeads([...imported, ...leads])
        showNotification(`Imported ${imported.length} lead(s)${skipped.length > 0 ? `, skipped ${skipped.length}` : ''}`)
      } else {
        showNotification('No leads imported')
      }

      setShowJsonImportModal(false)
      setJsonContent('')
    } catch {
      alert('Invalid JSON format')
    }
  }

  // Export handlers
  const handleExportLeads = () => {
    const csv = exportLeadsToCSV(leads)
    const filename = `hdd-leads-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(filename, csv)
    showNotification('Leads exported')
  }

  const handleExportReferrers = () => {
    const csv = exportReferrersToCSV(referrers)
    const filename = `hdd-referrers-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(filename, csv)
    showNotification('Referrers exported')
  }

  // Analytics with date range
  const filteredLeads = filterLeadsByDateRange(leads, dateRange)
  const sourceStats = calculateSourceMetrics(filteredLeads, LEAD_SOURCES)
  const conversionFunnel = calculateConversionFunnel(filteredLeads)
  const avgTimeToClose = calculateAverageTimeToClose(filteredLeads)

  const totalLeads = filteredLeads.length
  const totalSold = filteredLeads.filter(l => l.status === 'sold').length
  const totalValue = filteredLeads.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.value || 0), 0)
  const referralLeads = filteredLeads.filter(l => l.referralCode).length
  const conversionRate = totalLeads > 0 ? Math.round((totalSold / totalLeads) * 100) : 0

  return (
    <div className="app">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <header className="header">
        <h1>Referral & Lead Tracker</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      <div className="tabs">
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Leads</button>
        <button className={activeTab === 'referrers' ? 'active' : ''} onClick={() => setActiveTab('referrers')}>Referrers</button>
      </div>

      {activeTab === 'analytics' && (
        <div className="analytics">
          <div className="toolbar">
            <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="date-range-select">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="all">All Time</option>
            </select>
          </div>

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
              <span className="stat-value">{conversionRate}%</span>
              <span className="stat-label">Conversion Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{referralLeads}</span>
              <span className="stat-label">From Referrals</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{avgTimeToClose}</span>
              <span className="stat-label">Avg Days to Close</span>
            </div>
          </div>

          {conversionFunnel.length > 0 && (
            <div className="section">
              <h2>Conversion Funnel</h2>
              <div className="funnel">
                {conversionFunnel.map(stage => (
                  <div key={stage.stage} className="funnel-stage">
                    <div className="funnel-bar" style={{ width: `${stage.percentage}%` }}>
                      <span className="funnel-label">{stage.stage}</span>
                      <span className="funnel-value">{stage.count} ({stage.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <h2>Lead Source Performance</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Leads</th>
                  <th>Sold</th>
                  <th>Conv. Rate</th>
                  <th>Avg Days</th>
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
                    <td>{s.avgTimeToClose || '-'}</td>
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
            <button className="btn-secondary" onClick={() => setShowImportModal(true)}>Import CSV</button>
            <button className="btn-secondary" onClick={() => setShowJsonImportModal(true)}>Sync from Lead Response</button>
            <button className="btn-secondary" onClick={handleExportLeads}>Export CSV</button>
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
                  <span>{lead.createdAt}</span>
                  <span>{lead.source}</span>
                  {lead.referralCode && <span>Ref: {lead.referralCode}</span>}
                  {lead.value && <span>${lead.value.toLocaleString()}</span>}
                </div>
                <div className="lead-contact">
                  {lead.phone && <span>{lead.phone}</span>}
                  {lead.email && <span>{lead.email}</span>}
                </div>
                {lead.notes && <div className="lead-notes">{lead.notes}</div>}
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
            <button className="btn-secondary" onClick={handleExportReferrers}>Export CSV</button>
          </div>

          <div className="referrers-grid">
            {referrers.map(ref => {
              const refLeads = leads.filter(l => l.referralCode === ref.code)
              const soldLeads = refLeads.filter(l => l.status === 'sold')

              return (
                <div key={ref.id} className="referrer-card">
                  <h3>{ref.name}</h3>
                  <div className="referrer-code">
                    <span className="code">{ref.code}</span>
                    <button onClick={() => {
                      navigator.clipboard.writeText(ref.code)
                      showNotification('Code copied!')
                    }}>Copy</button>
                  </div>
                  <div className="referrer-stats">
                    <div><span className="num">{ref.referralCount}</span> referrals</div>
                    <div><span className="num">{soldLeads.length}</span> sold</div>
                    <div><span className="num">${ref.totalValue.toLocaleString()}</span> value</div>
                  </div>
                  {ref.phone && <p className="contact">{ref.phone}</p>}
                  {ref.email && <p className="contact">{ref.email}</p>}
                </div>
              )
            })}
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

      {showImportModal && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal import-modal" onClick={e => e.stopPropagation()}>
            <h2>Import Leads from CSV</h2>

            <div className="import-instructions">
              <p>CSV format: name, phone, email, source, referralCode, status, value, createdAt, notes</p>
              <p>Only <strong>name</strong> is required. First row should be headers.</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="file-input"
            />

            {csvContent && !importResult && (
              <div className="csv-preview">
                <h3>Preview</h3>
                <pre>{csvContent.split('\n').slice(0, 5).join('\n')}</pre>
                {csvContent.split('\n').length > 5 && <p>...and {csvContent.split('\n').length - 5} more rows</p>}
              </div>
            )}

            {importResult && (
              <div className="import-result">
                <h3>Import Results</h3>
                <div className="result-summary">
                  <div className="result-stat success">
                    <span className="result-num">{importResult.imported.length}</span>
                    <span className="result-label">Imported</span>
                  </div>
                  <div className="result-stat warning">
                    <span className="result-num">{importResult.skipped.length}</span>
                    <span className="result-label">Skipped</span>
                  </div>
                  <div className="result-stat error">
                    <span className="result-num">{importResult.errors.length}</span>
                    <span className="result-label">Errors</span>
                  </div>
                </div>

                {importResult.skipped.length > 0 && (
                  <div className="result-details">
                    <h4>Skipped Rows</h4>
                    <ul>
                      {importResult.skipped.slice(0, 5).map((skip, i) => (
                        <li key={i}>Row {skip.row}: {skip.reason}</li>
                      ))}
                      {importResult.skipped.length > 5 && <li>...and {importResult.skipped.length - 5} more</li>}
                    </ul>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="result-details">
                    <h4>Errors</h4>
                    <ul>
                      {importResult.errors.map((err, i) => (
                        <li key={i}>Row {err.row}: {err.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeImportModal}>Close</button>
              {csvContent && !importResult && (
                <button className="btn-primary" onClick={handleCsvImport}>Import</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showJsonImportModal && (
        <div className="modal-overlay" onClick={() => setShowJsonImportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Sync from Lead Response</h2>

            <div className="import-instructions">
              <p>Paste JSON from Lead Response webhook or export:</p>
              <pre className="json-example">{`{
  "name": "John Doe",
  "phone": "555-1234",
  "email": "john@example.com",
  "source": "Google Search",
  "referralCode": "JOHN123"
}`}</pre>
            </div>

            <textarea
              placeholder="Paste JSON here..."
              value={jsonContent}
              onChange={e => setJsonContent(e.target.value)}
              rows={10}
              className="json-textarea"
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowJsonImportModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleJsonImport} disabled={!jsonContent}>Import</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>{leads.length} leads • {referrers.length} referrers • ${leads.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()} tracked</p>
      </footer>
    </div>
  )
}

export default App
