import { useState, useEffect } from 'react'
import './App.css'

interface AnniversaryTrigger {
  sent: boolean
  sentAt?: string
}

interface YearlyAnniversary {
  year: number
  sent: boolean
  sentAt?: string
}

interface AnniversaryTriggers {
  day30Review: AnniversaryTrigger
  month6Maintenance: AnniversaryTrigger
  year1Anniversary: AnniversaryTrigger
  yearlyAnniversary: YearlyAnniversary[]
}

interface EmailHistoryEntry {
  date: string
  type: 'checkup' | 'seasonal'
  subject: string
  status: 'sent' | 'failed'
  emailId?: string
}

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
  lastEmailed?: string
  nextCheckup?: string
  notes: string
  projectCompletionDate: string
  anniversaryTriggers: AnniversaryTriggers
  emailHistory: EmailHistoryEntry[]
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
    if (!saved) return []

    const parsed = JSON.parse(saved)
    // Migrate old customers to have anniversary fields
    return parsed.map((c: Customer) => ({
      ...c,
      projectCompletionDate: c.projectCompletionDate || c.projectDate,
      anniversaryTriggers: c.anniversaryTriggers || {
        day30Review: { sent: false },
        month6Maintenance: { sent: false },
        year1Anniversary: { sent: false },
        yearlyAnniversary: []
      },
      emailHistory: c.emailHistory || []
    }))
  })
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'due' | 'expiring' | 'anniversaries'>('all')
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    projectType: PROJECT_TYPES[0],
    material: MATERIALS[0].name
  })
  const [sendingEmail, setSendingEmail] = useState<{ [key: string]: boolean }>({})
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    localStorage.setItem('hdd-warranties', JSON.stringify(customers))
  }, [customers])

  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Anniversary helper functions
  const isDueForAnniversary = (customer: Customer, type: '30day' | '6month' | '1year' | 'yearly') => {
    const completion = customer.projectCompletionDate
    if (!completion) return false

    const now = new Date()
    const completionDate = new Date(completion)
    const daysSince = Math.floor((now.getTime() - completionDate.getTime()) / (24 * 60 * 60 * 1000))

    if (type === '30day') {
      if (customer.anniversaryTriggers.day30Review.sent) return false
      return daysSince >= 30
    }

    if (type === '6month') {
      if (customer.anniversaryTriggers.month6Maintenance.sent) return false
      return daysSince >= 182 // ~6 months
    }

    if (type === '1year') {
      if (customer.anniversaryTriggers.year1Anniversary.sent) return false
      return daysSince >= 365
    }

    if (type === 'yearly') {
      const yearsSince = Math.floor(daysSince / 365)
      if (yearsSince < 2) return false

      const lastSentYear = customer.anniversaryTriggers.yearlyAnniversary
        .filter(a => a.sent)
        .sort((a, b) => b.year - a.year)[0]?.year || 1

      return yearsSince > lastSentYear
    }

    return false
  }

  const markAnniversarySent = (customerId: string, type: '30day' | '6month' | '1year' | 'yearly') => {
    setCustomers(customers.map(c => {
      if (c.id !== customerId) return c

      const triggers = { ...c.anniversaryTriggers }

      if (type === '30day') {
        triggers.day30Review = { sent: true, sentAt: today }
      } else if (type === '6month') {
        triggers.month6Maintenance = { sent: true, sentAt: today }
      } else if (type === '1year') {
        triggers.year1Anniversary = { sent: true, sentAt: today }
      } else if (type === 'yearly') {
        const daysSince = Math.floor((new Date().getTime() - new Date(c.projectCompletionDate).getTime()) / (24 * 60 * 60 * 1000))
        const year = Math.floor(daysSince / 365)
        triggers.yearlyAnniversary = [...triggers.yearlyAnniversary, { year, sent: true, sentAt: today }]
      }

      return { ...c, anniversaryTriggers: triggers, lastEmailed: today }
    }))
  }

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
      notes: newCustomer.notes || '',
      projectCompletionDate: newCustomer.projectDate || '',
      anniversaryTriggers: {
        day30Review: { sent: false },
        month6Maintenance: { sent: false },
        year1Anniversary: { sent: false },
        yearlyAnniversary: []
      },
      emailHistory: []
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
    if (filter === 'anniversaries') {
      return isDueForAnniversary(c, '30day') ||
             isDueForAnniversary(c, '6month') ||
             isDueForAnniversary(c, '1year') ||
             isDueForAnniversary(c, 'yearly')
    }
    return true
  })

  const dueForCheckup = customers.filter(c => c.nextCheckup && c.nextCheckup <= nextMonth).length
  const expiringWarranties = customers.filter(c => c.warrantyExpires <= nextYear).length

  // Anniversary stats
  const due30DayReviews = customers.filter(c => isDueForAnniversary(c, '30day')).length
  const due6MonthMaintenance = customers.filter(c => isDueForAnniversary(c, '6month')).length
  const due1YearAnniversary = customers.filter(c => isDueForAnniversary(c, '1year')).length
  const dueYearlyAnniversary = customers.filter(c => isDueForAnniversary(c, 'yearly')).length
  const totalAnniversaryDue = due30DayReviews + due6MonthMaintenance + due1YearAnniversary + dueYearlyAnniversary

  const generateEmailContent = (customer: Customer, type: 'checkup' | 'seasonal') => {
    const firstName = customer.name.split(' ')[0]

    if (type === 'checkup') {
      const subject = 'Annual Deck Checkup - Hickory Dickory Decks Cincinnati'
      const html = `
        <p>Hi ${firstName},</p>

        <p>It's been a year since we completed your ${customer.projectType.toLowerCase()}! We wanted to reach out to see how it's holding up.</p>

        <p>As part of our commitment to quality, we offer a complimentary annual checkup to ensure everything is in great shape. This quick visit lets us:</p>

        <ul>
          <li>Inspect for any issues covered under your ${customer.warrantyYears}-year warranty</li>
          <li>Check fasteners and structural integrity</li>
          <li>Provide seasonal maintenance tips</li>
          <li>Answer any questions you might have</li>
        </ul>

        <p>Would you like to schedule a quick 15-minute visit? Just reply to this email or call us at (513) 555-1234.</p>

        <p>Thanks for choosing Hickory Dickory Decks!</p>

        <p>Best,<br>
        Nathan & Brinton<br>
        Hickory Dickory Decks Cincinnati</p>
      `
      return { subject, html, text: html.replace(/<[^>]*>/g, '') }
    }

    const subject = 'Spring Deck Care Tips - Hickory Dickory Decks'
    const html = `
      <p>Hi ${firstName},</p>

      <p>Spring is here! Time to get your ${customer.material} deck ready for the season.</p>

      <p><strong>Quick maintenance tips:</strong></p>
      <ul>
        <li>Sweep off debris and leaves</li>
        <li>Rinse with garden hose</li>
        <li>Check for any loose boards or hardware</li>
        <li>Clear drainage gaps between boards</li>
      </ul>

      <p>Your ${customer.warrantyYears}-year warranty is active through ${new Date(customer.warrantyExpires).getFullYear()}. If you notice any issues, let us know!</p>

      <p>Enjoy the weather!</p>

      <p>Best,<br>
      Hickory Dickory Decks Cincinnati<br>
      (513) 555-1234</p>
    `
    return { subject, html, text: html.replace(/<[^>]*>/g, '') }
  }

  const generateEmail = (customer: Customer, type: 'checkup' | 'seasonal') => {
    const { subject, text } = generateEmailContent(customer, type)
    return `Subject: ${subject}\n\n${text}`
  }

  const sendEmail = async (customer: Customer, type: 'checkup' | 'seasonal') => {
    if (!customer.email) {
      alert('Customer has no email address on file')
      return
    }

    const emailKey = `${customer.id}-${type}`
    setSendingEmail(prev => ({ ...prev, [emailKey]: true }))
    setEmailStatus(prev => ({ ...prev, [emailKey]: 'Sending...' }))

    try {
      const { subject, html } = generateEmailContent(customer, type)

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customer.email,
          subject,
          html,
          customerName: customer.name,
          emailType: type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      // Update customer record
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id
            ? {
                ...c,
                lastEmailed: today,
                emailHistory: [
                  ...c.emailHistory,
                  {
                    date: today,
                    type,
                    subject,
                    status: 'sent' as const,
                    emailId: data.id,
                  },
                ],
              }
            : c
        )
      )

      setEmailStatus(prev => ({ ...prev, [emailKey]: 'Sent successfully!' }))
      setTimeout(() => {
        setEmailStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[emailKey]
          return newStatus
        })
      }, 3000)
    } catch (error) {
      console.error('Email send error:', error)

      // Record failed attempt
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id
            ? {
                ...c,
                emailHistory: [
                  ...c.emailHistory,
                  {
                    date: today,
                    type,
                    subject: generateEmailContent(customer, type).subject,
                    status: 'failed' as const,
                  },
                ],
              }
            : c
        )
      )

      setEmailStatus(prev => ({
        ...prev,
        [emailKey]: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
      setTimeout(() => {
        setEmailStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[emailKey]
          return newStatus
        })
      }, 5000)
    } finally {
      setSendingEmail(prev => ({ ...prev, [emailKey]: false }))
    }
  }

  // Anniversary email generators
  const generateAnniversaryEmailContent = (customer: Customer, type: '30day' | '6month' | '1year' | 'yearly') => {
    const firstName = customer.name.split(' ')[0]
    const googleReviewLink = 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK_HERE/review'

    if (type === '30day') {
      const subject = `How's your new ${customer.projectType.toLowerCase()}, ${firstName}?`
      const html = `
        <p>Hi ${firstName},</p>

        <p>It's been about a month since we completed your ${customer.material} ${customer.projectType.toLowerCase()}, and we hope you're loving it!</p>

        <p>We'd be incredibly grateful if you could take 2 minutes to share your experience on Google. Your feedback helps other Cincinnati homeowners make confident decisions about their outdoor projects.</p>

        <p><a href="${googleReviewLink}">Leave a review here</a></p>

        <p>If anything isn't quite right, please let us know directly so we can make it perfect.</p>

        <p>Thanks for choosing Hickory Dickory Decks!</p>

        <p>Best,<br>
        Nathan & Brinton<br>
        Hickory Dickory Decks Cincinnati<br>
        (513) 555-1234</p>
      `
      return { subject, html, text: html.replace(/<[^>]*>/g, '') }
    }

    if (type === '6month') {
      const month = new Date().toLocaleString('default', { month: 'long' })
      const isComposite = customer.material.includes('Trex') || customer.material.includes('TimberTech')
      const subject = `6 months with your ${customer.projectType.toLowerCase()} - maintenance tips inside`
      const html = `
        <p>Hi ${firstName},</p>

        <p>Half a year has flown by since we built your ${customer.material} ${customer.projectType.toLowerCase()}!</p>

        <p><strong>Quick ${month} maintenance tips:</strong></p>
        <ul>
          ${isComposite ? `
            <li>Rinse off with a garden hose to remove pollen and debris</li>
            <li>Use a deck cleaner for any stubborn stains</li>
            <li>Check railings and fasteners are secure</li>
            <li>Trim back any plants touching the deck</li>
          ` : `
            <li>Inspect for any loose boards or splitting</li>
            <li>Check stain condition and reapply if needed</li>
            <li>Tighten any loose screws or nails</li>
            <li>Ensure proper drainage between boards</li>
          `}
        </ul>

        <p>Remember, your ${customer.warrantyYears}-year warranty covers manufacturing defects and structural issues. If you notice anything unusual, just give us a call!</p>

        <p>Enjoying your outdoor space? We'd love a Google review if you haven't already left one!</p>

        <p>Best,<br>
        Hickory Dickory Decks Cincinnati<br>
        (513) 555-1234</p>
      `
      return { subject, html, text: html.replace(/<[^>]*>/g, '') }
    }

    if (type === '1year') {
      const subject = `Happy deck-iversary, ${firstName}!`
      const html = `
        <p>Hi ${firstName},</p>

        <p>Can you believe it's been a whole year since we completed your ${customer.projectType.toLowerCase()}? Time flies when you're enjoying Cincinnati's outdoor weather!</p>

        <p>We hope your ${customer.material} deck has been the backdrop for countless family memories, summer BBQs, and morning coffee moments.</p>

        <p><strong>THINKING ABOUT UPGRADES?</strong><br>
        Many of our customers add to their outdoor living space in year two. We'd love to chat if you're considering:</p>

        <ul>
          <li>Pergola or shade structure</li>
          <li>Privacy screens</li>
          <li>Outdoor kitchen or bar</li>
          <li>Deck lighting</li>
          <li>Additional deck sections</li>
        </ul>

        <p>We offer special pricing for returning customers, and all our work comes with the same quality guarantee.</p>

        <p>Want to explore ideas? Just reply to schedule a free consultation!</p>

        <p>Thanks for being a valued Hickory Dickory Decks customer.</p>

        <p>Best,<br>
        Nathan & Brinton<br>
        Hickory Dickory Decks Cincinnati<br>
        (513) 555-1234<br>
        www.hickorydickorydeckscincinnati.com</p>
      `
      return { subject, html, text: html.replace(/<[^>]*>/g, '') }
    }

    if (type === 'yearly') {
      const daysSince = Math.floor((new Date().getTime() - new Date(customer.projectCompletionDate).getTime()) / (24 * 60 * 60 * 1000))
      const years = Math.floor(daysSince / 365)
      const warrantyActive = years < customer.warrantyYears
      const subject = `Your ${customer.projectType.toLowerCase()} turns ${years}!`
      const html = `
        <p>Hi ${firstName},</p>

        <p>${years} years ago, we had the pleasure of building your ${customer.material} ${customer.projectType.toLowerCase()}, and we wanted to check in!</p>

        <p><strong>TIME FOR A QUICK INSPECTION?</strong><br>
        After ${years} years, it's a great time to:</p>

        <ul>
          <li>Inspect fasteners and structural components</li>
          <li>Check for any warranty-covered issues</li>
          <li>Get professional maintenance advice</li>
          <li>Discuss any upgrades or additions</li>
        </ul>

        <p>Your ${customer.warrantyYears}-year warranty is ${warrantyActive ? `active through ${new Date(customer.warrantyExpires).getFullYear()}` : 'complete, but we still stand behind our work'}.</p>

        <p><strong>REFER A FRIEND, EARN $200</strong><br>
        Know anyone thinking about a deck or outdoor project? We offer a $200 referral bonus for every project that moves forward. Just have them mention your name!</p>

        <p>Want to schedule a complimentary inspection? Reply to this email or call us at (513) 555-1234.</p>

        <p>Best,<br>
        Nathan & Brinton<br>
        Hickory Dickory Decks Cincinnati</p>
      `
      return { subject, html, text: html.replace(/<[^>]*>/g, '') }
    }

    return { subject: '', html: '', text: '' }
  }

  const generateAnniversaryEmail = (customer: Customer, type: '30day' | '6month' | '1year' | 'yearly') => {
    const { subject, text } = generateAnniversaryEmailContent(customer, type)
    return `Subject: ${subject}\n\n${text}`
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ Warranty & Anniversary Tracker</h1>
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
        <div className="stat-card" style={{ borderColor: '#8B4513' }}>
          <span className="num" style={{ color: '#8B4513' }}>{totalAnniversaryDue}</span>
          <span className="label">Anniversary Emails Due</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'due' ? 'active' : ''} onClick={() => setFilter('due')}>Due for Checkup</button>
          <button className={filter === 'expiring' ? 'active' : ''} onClick={() => setFilter('expiring')}>Expiring Soon</button>
          <button className={filter === 'anniversaries' ? 'active' : ''} onClick={() => setFilter('anniversaries')}>
            Anniversaries {totalAnniversaryDue > 0 && `(${totalAnniversaryDue})`}
          </button>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Customer</button>
      </div>

      {filter === 'anniversaries' && totalAnniversaryDue > 0 && (
        <div className="anniversary-summary">
          <h3>Anniversary Summary</h3>
          <div className="anniversary-stats">
            {due30DayReviews > 0 && <span>📧 {due30DayReviews} due for 30-day review request</span>}
            {due6MonthMaintenance > 0 && <span>🔧 {due6MonthMaintenance} due for 6-month maintenance tips</span>}
            {due1YearAnniversary > 0 && <span>🎉 {due1YearAnniversary} celebrating 1-year anniversary</span>}
            {dueYearlyAnniversary > 0 && <span>🎂 {dueYearlyAnniversary} due for annual anniversary</span>}
          </div>
        </div>
      )}

      <div className="customers-list">
        {filteredCustomers.map(customer => {
          const isDue = customer.nextCheckup && customer.nextCheckup <= nextMonth
          const isExpiring = customer.warrantyExpires <= nextYear
          const is30DayDue = isDueForAnniversary(customer, '30day')
          const is6MonthDue = isDueForAnniversary(customer, '6month')
          const is1YearDue = isDueForAnniversary(customer, '1year')
          const isYearlyDue = isDueForAnniversary(customer, 'yearly')

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
                {customer.lastEmailed && (
                  <div>
                    <span className="label">Last Emailed:</span>
                    <span>{customer.lastEmailed}</span>
                  </div>
                )}
              </div>

              {customer.emailHistory && customer.emailHistory.length > 0 && (
                <div className="email-history">
                  <span className="label">Email History:</span>
                  <div className="history-entries">
                    {customer.emailHistory.slice(-3).map((entry, idx) => (
                      <span
                        key={idx}
                        className={`history-badge ${entry.status}`}
                        title={`${entry.subject} - ${entry.date}`}
                      >
                        {entry.type === 'checkup' ? '📧' : '🌸'} {entry.date} ({entry.status})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Anniversary Alerts */}
              {(is30DayDue || is6MonthDue || is1YearDue || isYearlyDue) && (
                <div className="anniversary-alerts">
                  <span className="label">Anniversary Due:</span>
                  <div className="anniversary-badges">
                    {is30DayDue && <span className="anniversary-badge day30">30-Day Review</span>}
                    {is6MonthDue && <span className="anniversary-badge month6">6-Month Maintenance</span>}
                    {is1YearDue && <span className="anniversary-badge year1">1-Year Anniversary</span>}
                    {isYearlyDue && <span className="anniversary-badge yearly">Annual Anniversary</span>}
                  </div>
                </div>
              )}

              <div className="customer-actions">
                <div className="action-group">
                  <button
                    onClick={() => sendEmail(customer, 'checkup')}
                    disabled={sendingEmail[`${customer.id}-checkup`] || !customer.email}
                    title={!customer.email ? 'No email address' : 'Send checkup email'}
                  >
                    {sendingEmail[`${customer.id}-checkup`] ? '⏳' : '📧'} Send Checkup
                  </button>
                  <button
                    onClick={() => {
                      const email = generateEmail(customer, 'checkup')
                      navigator.clipboard.writeText(email)
                      alert('Checkup email copied to clipboard!')
                    }}
                    className="btn-copy"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
                <div className="action-group">
                  <button
                    onClick={() => sendEmail(customer, 'seasonal')}
                    disabled={sendingEmail[`${customer.id}-seasonal`] || !customer.email}
                    title={!customer.email ? 'No email address' : 'Send seasonal email'}
                  >
                    {sendingEmail[`${customer.id}-seasonal`] ? '⏳' : '🌸'} Send Seasonal
                  </button>
                  <button
                    onClick={() => {
                      const email = generateEmail(customer, 'seasonal')
                      navigator.clipboard.writeText(email)
                      alert('Seasonal email copied to clipboard!')
                    }}
                    className="btn-copy"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
                <button onClick={() => markContacted(customer.id)}>✅ Mark Contacted</button>
                <button className="btn-danger" onClick={() => deleteCustomer(customer.id)}>🗑️</button>
              </div>

              {/* Anniversary Actions */}
              {(is30DayDue || is6MonthDue || is1YearDue || isYearlyDue) && (
                <div className="anniversary-actions">
                  <span className="label">Anniversary Emails:</span>
                  <div className="action-row">
                    {is30DayDue && (
                      <button
                        onClick={() => {
                          const email = generateAnniversaryEmail(customer, '30day')
                          navigator.clipboard.writeText(email)
                          markAnniversarySent(customer.id, '30day')
                          alert('30-day review email copied to clipboard!')
                        }}
                        className="anniversary-action"
                      >
                        📧 30-Day Review
                      </button>
                    )}
                    {is6MonthDue && (
                      <button
                        onClick={() => {
                          const email = generateAnniversaryEmail(customer, '6month')
                          navigator.clipboard.writeText(email)
                          markAnniversarySent(customer.id, '6month')
                          alert('6-month maintenance email copied to clipboard!')
                        }}
                        className="anniversary-action"
                      >
                        🔧 6-Month Tips
                      </button>
                    )}
                    {is1YearDue && (
                      <button
                        onClick={() => {
                          const email = generateAnniversaryEmail(customer, '1year')
                          navigator.clipboard.writeText(email)
                          markAnniversarySent(customer.id, '1year')
                          alert('1-year anniversary email copied to clipboard!')
                        }}
                        className="anniversary-action"
                      >
                        🎉 1-Year Anniversary
                      </button>
                    )}
                    {isYearlyDue && (
                      <button
                        onClick={() => {
                          const email = generateAnniversaryEmail(customer, 'yearly')
                          navigator.clipboard.writeText(email)
                          markAnniversarySent(customer.id, 'yearly')
                          alert('Annual anniversary email copied to clipboard!')
                        }}
                        className="anniversary-action"
                      >
                        🎂 Annual Anniversary
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(emailStatus[`${customer.id}-checkup`] || emailStatus[`${customer.id}-seasonal`]) && (
                <div className={`email-toast ${
                  (emailStatus[`${customer.id}-checkup`] || emailStatus[`${customer.id}-seasonal`])?.includes('success') ? 'success' :
                  (emailStatus[`${customer.id}-checkup`] || emailStatus[`${customer.id}-seasonal`])?.includes('Failed') ? 'error' : 'info'
                }`}>
                  {emailStatus[`${customer.id}-checkup`] || emailStatus[`${customer.id}-seasonal`]}
                </div>
              )}
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
        <p>Track warranties • Schedule checkups • Celebrate anniversaries • Keep customers happy</p>
      </footer>
    </div>
  )
}

export default App
