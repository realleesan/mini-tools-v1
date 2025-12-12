import React, { useState } from 'react'
import axios from 'axios'

const CategoryManager = ({ categories, onClose, onUpdate }) => {
  const [newCategory, setNewCategory] = useState({ name: '', label: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newCategory.name || !newCategory.label) return

    setLoading(true)
    try {
      await axios.post('/api/categories', newCategory)
      setNewCategory({ name: '', label: '' })
      onUpdate()
      alert('Category created successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating category')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id) => {
    if (!editingLabel) return

    setLoading(true)
    try {
      await axios.put(`/api/categories/${id}`, { label: editingLabel })
      setEditingId(null)
      setEditingLabel('')
      onUpdate()
      alert('Category updated successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    setLoading(true)
    try {
      await axios.delete(`/api/categories/${id}`)
      onUpdate()
      alert('Category deleted successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting category')
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
            Manage Categories
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

        {/* Create New Category */}
        <form onSubmit={handleCreate} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Create New Category</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Category name (e.g., support)"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              placeholder="Display label (e.g., Support)"
              value={newCategory.label}
              onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
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
            disabled={loading || !newCategory.name || !newCategory.label}
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
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>

        {/* Categories List */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Existing Categories ({categories.length})
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {categories.map(category => (
              <div key={category.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: '#fff'
              }}>
                <div style={{ flex: 1 }}>
                  {editingId === category.id ? (
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
                        if (e.key === 'Enter') handleUpdate(category.id)
                        if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditingLabel('')
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>{category.label}</span>
                      <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>
                        ({category.name})
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(category.id)}
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
                          setEditingId(category.id)
                          setEditingLabel(category.label)
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
                      {category.name !== 'general' && (
                        <button
                          onClick={() => handleDelete(category.id)}
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

export default CategoryManager