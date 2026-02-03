import { useState, useEffect } from 'react'
import './App.css'
import { uploadToBlob, deleteFromBlob, isBlobUrl } from './utils/blobStorage'
import { useMigrateToBlob } from './hooks/useMigrateToBlob'

interface Project {
  id: string
  name: string
  date: string
  type: string
  material: string
  neighborhood: string
  beforePhotos: string[]
  afterPhotos: string[]
  notes: string
}

const PROJECT_TYPES = ['Deck', 'Pergola', 'Pool Surround', 'Gazebo', 'Patio Cover', 'Railing Only']
const MATERIALS = ['Trex Select', 'Trex Enhance', 'Trex Transcend', 'TimberTech PRO', 'TimberTech AZEK']
const NEIGHBORHOODS = ['Mason', 'West Chester', 'Liberty Township', 'Loveland', 'Anderson Township', 'Blue Ash', 'Madeira', 'Hyde Park', 'Indian Hill', 'Other']

function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('hdd-projects')
    return saved ? JSON.parse(saved) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState({ type: '', material: '', neighborhood: '' })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    type: PROJECT_TYPES[0],
    material: MATERIALS[0],
    neighborhood: NEIGHBORHOODS[0],
    beforePhotos: [],
    afterPhotos: []
  })
  const [uploading, setUploading] = useState(false)

  // Migrate legacy base64 photos to Blob storage
  const migrationStatus = useMigrateToBlob(projects, setProjects)

  useEffect(() => {
    localStorage.setItem('hdd-projects', JSON.stringify(projects))
  }, [projects])

  const filteredProjects = projects.filter(p => {
    if (filter.type && p.type !== filter.type) return false
    if (filter.material && p.material !== filter.material) return false
    if (filter.neighborhood && p.neighborhood !== filter.neighborhood) return false
    return true
  })

  const handleAddProject = () => {
    if (!newProject.name || !newProject.date) return
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name || '',
      date: newProject.date || '',
      type: newProject.type || PROJECT_TYPES[0],
      material: newProject.material || MATERIALS[0],
      neighborhood: newProject.neighborhood || NEIGHBORHOODS[0],
      beforePhotos: newProject.beforePhotos || [],
      afterPhotos: newProject.afterPhotos || [],
      notes: newProject.notes || ''
    }
    setProjects([project, ...projects])
    setNewProject({ type: PROJECT_TYPES[0], material: MATERIALS[0], neighborhood: NEIGHBORHOODS[0], beforePhotos: [], afterPhotos: [] })
    setShowForm(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    const photoKey = type === 'before' ? 'beforePhotos' : 'afterPhotos'

    try {
      // Upload all files to Blob storage
      const uploadPromises = Array.from(files).map(file => uploadToBlob(file))
      const blobUrls = await Promise.all(uploadPromises)

      setNewProject(prev => ({
        ...prev,
        [photoKey]: [
          ...(prev[photoKey] || []),
          ...blobUrls
        ]
      }))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload photos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return

    const project = projects.find(p => p.id === id)
    if (!project) return

    // Delete blob photos from storage
    const blobPhotos = [
      ...project.beforePhotos.filter(isBlobUrl),
      ...project.afterPhotos.filter(isBlobUrl)
    ]

    try {
      await Promise.all(blobPhotos.map(url => deleteFromBlob(url)))
    } catch (error) {
      console.error('Failed to delete some photos from blob storage:', error)
      // Continue with project deletion even if blob deletion fails
    }

    setProjects(projects.filter(p => p.id !== id))
    setSelectedProject(null)
  }

  const removePhotoFromNewProject = async (photoUrl: string, type: 'before' | 'after') => {
    const photoKey = type === 'before' ? 'beforePhotos' : 'afterPhotos'

    // Delete from blob if it's a blob URL
    if (isBlobUrl(photoUrl)) {
      try {
        await deleteFromBlob(photoUrl)
      } catch (error) {
        console.error('Failed to delete photo:', error)
      }
    }

    setNewProject(prev => ({
      ...prev,
      [photoKey]: (prev[photoKey] || []).filter(url => url !== photoUrl)
    }))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📸 Project Photo Manager</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      {migrationStatus.isRunning && (
        <div className="migration-banner">
          <p>
            Migrating photos to cloud storage... {migrationStatus.progress} of {migrationStatus.total}
          </p>
        </div>
      )}

      {uploading && (
        <div className="upload-banner">
          <p>Uploading photos...</p>
        </div>
      )}

      <div className="toolbar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Project</button>
        <div className="filters">
          <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}>
            <option value="">All Types</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filter.material} onChange={e => setFilter({...filter, material: e.target.value})}>
            <option value="">All Materials</option>
            {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filter.neighborhood} onChange={e => setFilter({...filter, neighborhood: e.target.value})}>
            <option value="">All Areas</option>
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Project</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name / Address</label>
                <input 
                  type="text" 
                  value={newProject.name || ''} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g., Johnson Family - Mason"
                />
              </div>
              <div className="form-group">
                <label>Completion Date</label>
                <input 
                  type="date" 
                  value={newProject.date || ''} 
                  onChange={e => setNewProject({...newProject, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Project Type</label>
                <select value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})}>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Material</label>
                <select value={newProject.material} onChange={e => setNewProject({...newProject, material: e.target.value})}>
                  {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Neighborhood</label>
                <select value={newProject.neighborhood} onChange={e => setNewProject({...newProject, neighborhood: e.target.value})}>
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea 
                  value={newProject.notes || ''} 
                  onChange={e => setNewProject({...newProject, notes: e.target.value})}
                  placeholder="Special features, customer feedback, etc."
                />
              </div>
              <div className="form-group">
                <label>Before Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleFileUpload(e, 'before')}
                  disabled={uploading}
                />
                <div className="photo-preview">
                  {newProject.beforePhotos?.map((p, i) => (
                    <div key={i} className="photo-preview-item">
                      <img src={p} alt="before" />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => removePhotoFromNewProject(p, 'before')}
                        disabled={uploading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>After Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleFileUpload(e, 'after')}
                  disabled={uploading}
                />
                <div className="photo-preview">
                  {newProject.afterPhotos?.map((p, i) => (
                    <div key={i} className="photo-preview-item">
                      <img src={p} alt="after" />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => removePhotoFromNewProject(p, 'after')}
                        disabled={uploading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddProject}>Save Project</button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <h2>{selectedProject.name}</h2>
            <div className="project-meta">
              <span>{selectedProject.date}</span>
              <span>{selectedProject.type}</span>
              <span>{selectedProject.material}</span>
              <span>{selectedProject.neighborhood}</span>
            </div>
            {selectedProject.notes && <p className="project-notes">{selectedProject.notes}</p>}
            <div className="photo-comparison">
              <div className="photo-column">
                <h3>Before</h3>
                {selectedProject.beforePhotos.map((p, i) => <img key={i} src={p} alt="before" />)}
                {selectedProject.beforePhotos.length === 0 && <p className="no-photos">No before photos</p>}
              </div>
              <div className="photo-column">
                <h3>After</h3>
                {selectedProject.afterPhotos.map((p, i) => <img key={i} src={p} alt="after" />)}
                {selectedProject.afterPhotos.length === 0 && <p className="no-photos">No after photos</p>}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={() => deleteProject(selectedProject.id)}>Delete</button>
              <button className="btn-secondary" onClick={() => setSelectedProject(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Add your first project!</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
              <div className="project-thumbnail">
                {project.afterPhotos[0] ? (
                  <img src={project.afterPhotos[0]} alt={project.name} />
                ) : project.beforePhotos[0] ? (
                  <img src={project.beforePhotos[0]} alt={project.name} />
                ) : (
                  <div className="no-image">📷</div>
                )}
              </div>
              <div className="project-info">
                <h3>{project.name}</h3>
                <p>{project.date}</p>
                <div className="project-tags">
                  <span className="tag">{project.type}</span>
                  <span className="tag">{project.material}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="footer">
        <p>{projects.length} projects • {projects.reduce((sum, p) => sum + p.beforePhotos.length + p.afterPhotos.length, 0)} photos</p>
      </footer>
    </div>
  )
}

export default App
