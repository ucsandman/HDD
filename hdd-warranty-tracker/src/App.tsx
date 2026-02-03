import { useState, useEffect } from 'react'
import './App.css'

interface Customer {
  id: string
  name: string
  address: string
  phone: string
  email: string
  projectDate: string
  projectType: string
  material: string
  warrantyYears: number
  warrantyExpires: string
  lastContact?: string
  nextCheckup?: string
  notes: string
}

const PROJECT_TYPES = ['Deck', 'Pergola', 'Pool Surround', 'Gazebo', 'Railing']
const MATERIALS = [
  { name: 'Trex Select', warranty: 25 },
  { name: 'Trex Enhance', warranty: 25 },
  { name: 'Trex Transcend', warranty: 25 },
  { name: 'TimberTech PRO', warranty: 25 },
  { name: 'TimberTech AZEK', warranty: 50 }
]

function App() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hdd-warranties')
    return saved ? JSON.parse(saved) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'due' | 'expiring'>('all')
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    projectType: PROJECT_TYPES[0],
    material: MATERIALS[0].name
  })

  useEffect(() => {
    localStorage.setItem('hdd-warranties', JSON.stringify(customers))
  }, [customers])

  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.projectDate) return
    
    const material = MATERIALS.find(m => m.name === newCustomer.material) || MATERIALS[0]
    const projectDate = new Date(newCustomer.projectDate!)
    const warrantyExpires = new Date(projectDate)
    warrantyExpires.setFullYear(warrantyExpires.getFullYear() + material.warranty)
    
    const nextCheckup = new Date(projectDate)
    nextCheckup.setFullYear(nextCheckup.getFullYear() + 1)

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name || '',
      address: newCustomer.address || '',
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      projectDate: newCustomer.projectDate || '',
      projectType: newCustomer.projectType || PROJECT_TYPES[0],
      material: newCustomer.material || MATERIALS[0].name,
      warrantyYears: material.warranty,
      warrantyExpires: warrantyExpires.toISOString().split('T')[0],
      nextCheckup: nextCheckup.toISOString().split('T')[0],
      notes: newCustomer.notes || ''
    }

    setCustomers([customer, ...customers])
    setNewCustomer({ projectType: PROJECT_TYPES[0], material: MATERIALS[0].name })
    setShowForm(false)
  }

  const markContacted = (id: string) => {
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    
    setCustomers(customers.map(c => 
      c.id === id 
        ? { ...c, lastContact: today, nextCheckup: nextYear.toISOString().split('T')[0] }
        : c
    ))
  }

  const deleteCustomer = (id: string) => {
    if (confirm('Delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id))
    }
  }

  const filteredCustomers = customers.filter(c => {
    if (filter === 'due') return c.nextCheckup && c.nextCheckup <= nextMonth
    if (filter === 'expiring') return c.warrantyExpires <= nextYear
    return true
  })

  const dueForCheckup = customers.filter(c => c.nextCheckup && c.nextCheckup <= nextMonth).length
  const expiringWarranties = customers.filter(c => c.warrantyExpires <= nextYear).length

  const generateEmail = (customer: Customer, type: 'checkup' | 'seasonal') => {
    if (type === 'checkup') {
      return `Subject: Annual Deck Checkup - Hickory Dickory Decks Cincinnati

Hi ${customer.name.split(' ')[0]},

It's been a year since we completed your ${customer.projectType.toLowerCase()}! We wanted to reach out to see how it's holding up.

As part of our commitment to quality, we offer a complimentary annual checkup to ensure everything is in great shape. This quick visit lets us:

• Inspect for any issues covered under your ${customer.warrantyYears}-year warranty
• Check fasteners and structural integrity
• Provide seasonal maintenance tips
• Answer any questions you might have

Would you like to schedule a quick 15-minute visit? Just reply to this email or call us at (513) 555-1234.

Thanks for choosing Hickory Dickory Decks!

Best,
Nathan & Brinton
Hickory Dickory Decks Cincinnati`
    }
    
    return `Subject: Spring Deck Care Tips - Hickory Dickory Decks

Hi ${customer.name.split(' ')[0]},

Spring is here! Time to get your ${customer.material} deck ready for the season.

Quick maintenance tips:
✓ Sweep off debris and leaves
✓ Rinse with garden hose
✓ Check for any loose boards or hardware
✓ Clear drainage gaps between boards

Your ${customer.warrantyYears}-year warranty is active through ${new Date(customer.warrantyExpires).getFullYear()}. If you notice any issues, let us know!

Enjoy the weather!

Best,
Hickory Dickory Decks Cincinnati
(513) 555-1234`
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ Warranty Tracker</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="num">{customers.length}</span>
          <span className="label">Total Customers</span>
        </div>
        <div className="stat-card warning">
          <span className="num">{dueForCheckup}</span>
          <span className="label">Due for Checkup</span>
        </div>
        <div className="stat-card alert">
          <span className="num">{expiringWarranties}</span>
          <span className="label">Warranties Expiring</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'due' ? 'active' : ''} onClick={() => setFilter('due')}>Due for Checkup</button>
          <button className={filter === 'expiring' ? 'active' : ''} onClick={() => setFilter('expiring')}>Expiring Soon</button>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Customer</button>
      </div>

      <div className="customers-list">
        {filteredCustomers.map(customer => {
          const isDue = customer.nextCheckup && customer.nextCheckup <= nextMonth
          const isExpiring = customer.warrantyExpires <= nextYear
          
          return (
            <div key={customer.id} className={`customer-card ${isDue ? 'due' : ''} ${isExpiring ? 'expiring' : ''}`}>
              <div className="customer-header">
                <div>
                  <h3>{customer.name}</h3>
                  <p className="address">{customer.address}</p>
                </div>
                <div className="warranty-badge">
                  {customer.warrantyYears}yr warranty
                </div>
              </div>
              
              <div className="customer-details">
                <span>🏗️ {customer.projectType}</span>
                <span>🪵 {customer.material}</span>
                <span>📅 {customer.projectDate}</span>
              </div>
              
              <div className="customer-status">
                <div>
                  <span className="label">Warranty Expires:</span>
                  <span className={isExpiring ? 'alert-text' : ''}>{customer.warrantyExpires}</span>
                </div>
                <div>
                  <span className="label">Next Checkup:</span>
                  <span className={isDue ? 'warning-text' : ''}>{customer.nextCheckup || 'Not scheduled'}</span>
                </div>
                {customer.lastContact && (
                  <div>
                    <span className="label">Last Contact:</span>
                    <span>{customer.lastContact}</span>
                  </div>
                )}
              </div>

              <div className="customer-actions">
                <button onClick={() => {
                  const email = generateEmail(customer, 'checkup')
                  navigator.clipboard.writeText(email)
                  alert('Checkup email copied to clipboard!')
                }}>📧 Checkup Email</button>
                <button onClick={() => {
                  const email = generateEmail(customer, 'seasonal')
                  navigator.clipboard.writeText(email)
                  alert('Seasonal email copied to clipboard!')
                }}>🌸 Seasonal Email</button>
                <button onClick={() => markContacted(customer.id)}>✅ Mark Contacted</button>
                <button className="btn-danger" onClick={() => deleteCustomer(customer.id)}>🗑️</button>
              </div>
            </div>
          )
        })}
        {filteredCustomers.length === 0 && (
          <p className="empty">No customers match this filter</p>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Customer</h2>
            <div className="form-grid">
              <input placeholder="Customer Name *" value={newCustomer.name || ''} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input placeholder="Address" value={newCustomer.address || ''} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <input placeholder="Phone" value={newCustomer.phone || ''} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              <input placeholder="Email" value={newCustomer.email || ''} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              <div className="form-row">
                <label>Project Date *</label>
                <input type="date" value={newCustomer.projectDate || ''} onChange={e => setNewCustomer({...newCustomer, projectDate: e.target.value})} />
              </div>
              <select value={newCustomer.projectType} onChange={e => setNewCustomer({...newCustomer, projectType: e.target.value})}>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={newCustomer.material} onChange={e => setNewCustomer({...newCustomer, material: e.target.value})}>
                {MATERIALS.map(m => <option key={m.name} value={m.name}>{m.name} ({m.warranty}yr warranty)</option>)}
              </select>
              <textarea placeholder="Notes" value={newCustomer.notes || ''} onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={addCustomer}>Add Customer</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>Track warranties • Schedule checkups • Keep customers happy</p>
      </footer>
    </div>
  )
}

export default App
