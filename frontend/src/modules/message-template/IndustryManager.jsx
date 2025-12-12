import React, { useState } from 'react'
import axios from 'axios'

const IndustryManager = ({ industries, onClose, onUpdate }) => {
  const [newIndustry, setNewIndustry] = useState({ name: '', label: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newIndustry.name || !newIndustry.label) return

    setLoading(true)
    try {
      await axios.post('/api/industries', newIndustry)
      setNewIndustry({ name: '', label: '' })
      onUpdate()
      alert('Industry created successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating industry')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id) => {
    if (!editingLabel) return

    setLoading(true)
    try {
      await axios.put(`/api/industries/${id}`, { label: editingLabel })
      setEditingId(null)
      setEditingLabel('')
      onUpdate()
      alert('Industry updated successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating industry')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this industry?')) return

    setLoading(true)
    try {
      await axios.delete(`/api/industries/${id}`)
      onUpdate()
      alert('Industry deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting industry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '6px',
        padding: '24px',
        width: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Manage Industries
          </h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280'
          }}>
            ×
          </button>
        </div>

        {/* Create New Industry */}
        <form onSubmit={handleCreate} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Create New Industry</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Industry name (e.g., automotive)"
              value={newIndustry.name}
              onChange={(e) => setNewIndustry(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              placeholder="Display label (e.g., Automotive)"
              value={newIndustry.label}
              onChange={(e) => setNewIndustry(prev => ({ ...prev, label: e.target.value }))}
              style={{
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newIndustry.name || !newIndustry.label}
            style={{
              padding: '8px 16px',
              background: loading ? '#9ca3af' : '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Creating...' : 'Create Industry'}
          </button>
        </form>

        {/* Industries List */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Existing Industries ({industries.length})
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {industries.map(industry => (
              <div key={industry.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff'
              }}>
                <div style={{ flex: 1 }}>
                  {editingId === industry.id ? (
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '3px',
                        fontSize: '13px'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleUpdate(industry.id)
                        if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditingLabel('')
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>{industry.label}</span>
                      <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
                        ({industry.name})
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  {editingId === industry.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(industry.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditingLabel('')
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#6b7280',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(industry.id)
                          setEditingLabel(industry.label)
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#111827',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Edit
                      </button>
                      {industry.name !== 'general' && (
                        <button
                          onClick={() => handleDelete(industry.id)}
                          style={{
                            padding: '4px 8px',
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndustryManager