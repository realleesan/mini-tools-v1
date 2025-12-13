import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CategoryManager from './CategoryManager'
import IndustryManager from './IndustryManager'

const MessageTemplate = () => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [variables, setVariables] = useState({})
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditingPreview, setIsEditingPreview] = useState(false)
  const [editableMessage, setEditableMessage] = useState('')
  
  // Saved Messages states
  const [savedMessages, setSavedMessages] = useState([])
  const [showSavedMessages, setShowSavedMessages] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  
  // State cho quản lý template
  const [activeTab, setActiveTab] = useState('use') // 'use' hoặc 'manage'
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general',
    industry: 'general'
  })
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Categories and Industries management
  const [categories, setCategories] = useState([])
  const [industries, setIndustries] = useState([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showIndustryManager, setShowIndustryManager] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
    fetchIndustries()
    fetchSavedMessages()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const fetchIndustries = async () => {
    try {
      const response = await axios.get('/api/industries')
      setIndustries(response.data)
    } catch (error) {
      console.error('Error loading industries:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/message-templates')
      setTemplates(response.data)
    } catch (error) {
      console.error('Lỗi khi tải templates:', error)
    }
  }

  const fetchSavedMessages = async () => {
    try {
      const response = await axios.get('/api/saved-messages')
      setSavedMessages(response.data)
    } catch (error) {
      console.error('Lỗi khi tải saved messages:', error)
    }
  }

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    setSelectedTemplate(templateId)
    
    if (template) {
      // Extract variables from template
      const variableMatches = template.content.match(/\{\{(\w+)\}\}/g) || []
      const templateVars = {}
      variableMatches.forEach(match => {
        const varName = match.replace(/\{\{|\}\}/g, '')
        templateVars[varName] = ''
      })
      setVariables(templateVars)
      
      // Auto-generate preview with empty variables
      generatePreviewWithTemplate(template.content, templateVars)
    }
  }

  const handleVariableChange = (varName, value) => {
    const newVariables = {
      ...variables,
      [varName]: value
    }
    setVariables(newVariables)
    
    // Auto-update preview when variables change
    const template = templates.find(t => t.id === parseInt(selectedTemplate))
    if (template) {
      generatePreviewWithTemplate(template.content, newVariables)
    }
  }

  // Generate preview locally without API call for instant feedback
  const generatePreviewWithTemplate = (templateContent, vars) => {
    let preview = templateContent
    Object.keys(vars).forEach(varName => {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g')
      preview = preview.replace(regex, vars[varName] || `{{${varName}}}`)
    })
    setGeneratedMessage(preview)
    setEditableMessage(preview)
  }

  const handlePreviewEdit = (value) => {
    setEditableMessage(value)
  }

  const toggleEditMode = () => {
    if (isEditingPreview) {
      // Save edited content back to generated message
      setGeneratedMessage(editableMessage)
    } else {
      // Enter edit mode
      setEditableMessage(generatedMessage)
    }
    setIsEditingPreview(!isEditingPreview)
  }

  const generateMessage = async () => {
    if (!selectedTemplate) return

    setLoading(true)
    try {
      const response = await axios.post('/api/message-templates/generate', {
        templateId: parseInt(selectedTemplate),
        variables
      })
      setGeneratedMessage(response.data.message)
    } catch (error) {
      console.error('Lỗi khi tạo tin nhắn:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const textToCopy = isEditingPreview ? editableMessage : generatedMessage
    navigator.clipboard.writeText(textToCopy)
    alert('Message copied to clipboard!')
  }

  // Saved Messages functions
  const handleSaveMessage = async () => {
    if (!saveDialogName.trim()) {
      alert('Please enter a name for the saved message')
      return
    }

    const template = templates.find(t => t.id === parseInt(selectedTemplate))
    if (!template) {
      alert('No template selected')
      return
    }

    const finalMessage = isEditingPreview ? editableMessage : generatedMessage
    if (!finalMessage.trim()) {
      alert('No message to save')
      return
    }

    try {
      await axios.post('/api/saved-messages', {
        name: saveDialogName.trim(),
        template_id: template.id,
        template_name: template.name,
        variables: variables,
        final_message: finalMessage,
        category: template.category,
        industry: template.industry
      })
      
      alert('Message saved successfully!')
      setSaveDialogName('')
      setShowSaveDialog(false)
      fetchSavedMessages()
    } catch (error) {
      console.error('Error saving message:', error)
      alert('Error saving message!')
    }
  }

  const handleLoadSavedMessage = async (savedMessageId) => {
    try {
      const response = await axios.post(`/api/saved-messages/${savedMessageId}/load`)
      const loadData = response.data
      
      // Set template
      setSelectedTemplate(loadData.template_id?.toString() || '')
      
      // Set variables
      setVariables(loadData.variables)
      
      // Set generated message
      setGeneratedMessage(loadData.final_message)
      setEditableMessage(loadData.final_message)
      
      // Close saved messages panel
      setShowSavedMessages(false)
      
      alert('Saved message loaded successfully!')
    } catch (error) {
      console.error('Error loading saved message:', error)
      alert('Error loading saved message!')
    }
  }

  const handleDeleteSavedMessage = async (savedMessageId) => {
    if (!confirm('Are you sure you want to delete this saved message?')) return

    try {
      await axios.delete(`/api/saved-messages/${savedMessageId}`)
      alert('Saved message deleted successfully!')
      fetchSavedMessages()
    } catch (error) {
      console.error('Error deleting saved message:', error)
      alert('Error deleting saved message!')
    }
  }

  // Functions cho quản lý template
  const handleSubmitTemplate = async (e) => {
    e.preventDefault()
    setLoading(true)

    console.log('Submitting form data:', formData) // Debug log

    try {
      if (editingTemplate) {
        await axios.put(`/api/message-templates/${editingTemplate.id}`, formData)
        alert('Template updated successfully!')
      } else {
        await axios.post('/api/message-templates', formData)
        alert('Template created successfully!')
      }
      
      resetForm()
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('An error occurred!')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      industry: template.industry || 'general'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await axios.delete(`/api/message-templates/${id}`)
      alert('Template deleted successfully!')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('An error occurred!')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', content: '', category: 'general', industry: 'general' })
    setEditingTemplate(null)
    setShowForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }



  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !filterCategory || template.category === filterCategory
    const matchesIndustry = !filterIndustry || template.industry === filterIndustry
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesIndustry && matchesSearch
  })

  return (
    <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Left Sidebar - Templates List */}
      <div style={{ 
        width: '320px', 
        background: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 1px 0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>
              Templates
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {filteredTemplates.length} of {templates.length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setShowSavedMessages(true)}
              style={{
                padding: '8px 10px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#059669'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Saved
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '8px 14px',
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#374151'}
              onMouseLeave={(e) => e.target.style.background = '#111827'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '8px'
            }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCategoryManager(true)}
                style={{
                  width: '18px',
                  height: '22px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb'
                  e.target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6'
                  e.target.style.color = '#6b7280'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}
              >
                <option value="">All Industries</option>
                {industries.map(ind => (
                  <option key={ind.name} value={ind.name}>{ind.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowIndustryManager(true)}
                style={{
                  width: '18px',
                  height: '22px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb'
                  e.target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6'
                  e.target.style.color = '#6b7280'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredTemplates.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {templates.length === 0 ? 'No templates yet' : 'No templates match filters'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                {templates.length === 0 ? 'Create your first template' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div 
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id.toString())
                  handleTemplateChange(template.id.toString())
                }}
                style={{
                  padding: '12px',
                  margin: '0 0 6px 0',
                  border: selectedTemplate === template.id.toString() ? '2px solid #111827' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: selectedTemplate === template.id.toString() ? '#f9fafb' : '#fff',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate !== template.id.toString()) {
                    e.target.style.background = '#f9fafb'
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate !== template.id.toString()) {
                    e.target.style.background = '#fff'
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      {template.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        background: selectedTemplate === template.id.toString() ? '#e5e7eb' : '#f3f4f6', 
                        padding: '1px 6px', 
                        borderRadius: '10px', 
                        fontSize: '10px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {categories.find(c => c.name === template.category)?.label || template.category}
                      </span>
                      <span style={{ 
                        background: selectedTemplate === template.id.toString() ? '#ddd6fe' : '#ede9fe', 
                        padding: '1px 6px', 
                        borderRadius: '10px', 
                        fontSize: '10px',
                        color: '#7c3aed',
                        fontWeight: '500'
                      }}>
                        {industries.find(i => i.name === template.industry)?.label || template.industry || 'General'}
                      </span>
                    </div>
                    <p style={{ 
                      margin: '6px 0 0 0', 
                      fontSize: '11px', 
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.3'
                    }}>
                      {template.content.substring(0, 50)}...
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(template)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f3f4f6'
                        e.target.style.color = '#111827'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none'
                        e.target.style.color = '#6b7280'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(template.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fef2f2'
                        e.target.style.color = '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none'
                        e.target.style.color = '#6b7280'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Variables Input Section */}
        {selectedTemplate && Object.keys(variables).length > 0 && (
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                Fill Variables
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.keys(variables).map(varName => (
                <div key={varName}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    color: '#374151', 
                    fontWeight: '500', 
                    fontSize: '13px' 
                  }}>
                    {varName}
                  </label>
                  <input
                    type="text"
                    value={variables[varName]}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    placeholder={`Enter ${varName}`}
                    style={{ 
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px',
                      fontSize: '13px',
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#111827'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Preview Section */}
        {selectedTemplate && (
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  Live Preview
                </h3>
                {isEditingPreview && (
                  <span style={{ 
                    background: '#fef3c7', 
                    color: '#92400e', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    Editing
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {generatedMessage && (
                  <>
                    <button 
                      onClick={() => setShowSaveDialog(true)}
                      style={{
                        padding: '8px 12px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                      onMouseLeave={(e) => e.target.style.background = '#10b981'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                      </svg>
                      Save
                    </button>
                    <button 
                      onClick={toggleEditMode}
                      style={{
                        padding: '8px 12px',
                        background: isEditingPreview ? '#059669' : '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = isEditingPreview ? '#047857' : '#4b5563'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = isEditingPreview ? '#059669' : '#6b7280'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isEditingPreview ? (
                          <path d="M20 6L9 17l-5-5"/>
                        ) : (
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        )}
                      </svg>
                      {isEditingPreview ? 'Save' : 'Edit'}
                    </button>
                  </>
                )}
                <button 
                  onClick={generateMessage}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    background: loading ? '#9ca3af' : '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.target.style.background = '#374151'
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.target.style.background = '#111827'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  {loading ? 'Updating...' : 'Refresh'}
                </button>
                {generatedMessage && (
                  <button 
                    onClick={copyToClipboard}
                    style={{
                      padding: '8px 12px',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                    onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="m5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ 
              flex: 1,
              background: '#f9fafb', 
              padding: '16px', 
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              overflow: 'auto',
              minHeight: '180px'
            }}>
              {generatedMessage ? (
                isEditingPreview ? (
                  <textarea
                    value={editableMessage}
                    onChange={(e) => handlePreviewEdit(e.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '200px',
                      border: 'none',
                      background: 'transparent',
                      resize: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#111827',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      padding: 0
                    }}
                    placeholder="Edit your message here..."
                  />
                ) : (
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#111827',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}>
                    {generatedMessage}
                  </pre>
                )
              ) : (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '12px', opacity: 0.5 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>
                    Select a template to start
                  </p>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Preview will appear instantly when you choose a template
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedTemplate && (
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '60px 40px',
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Select a Template
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '15px', maxWidth: '300px', lineHeight: '1.5' }}>
              Choose a template from the sidebar to start creating your personalized message
            </p>
            <div style={{ 
              padding: '12px 20px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              💡 Tip: Use variables like {`{{customerName}}`} for dynamic content
            </div>
          </div>
        )}

        {/* Template Form Modal */}
        {showForm && (
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
              borderRadius: '4px',
              padding: '24px',
              width: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#000' }}>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              
              <form onSubmit={handleSubmitTemplate}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    color: '#000', 
                    fontWeight: '500', 
                    fontSize: '14px' 
                  }}>
                    Template Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter template name"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #eee', 
                      borderRadius: '3px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      color: '#000', 
                      fontWeight: '500', 
                      fontSize: '14px' 
                    }}>
                      Category:
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #eee', 
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      color: '#000', 
                      fontWeight: '500', 
                      fontSize: '14px' 
                    }}>
                      Industry:
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #eee', 
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    >
                      {industries.map(ind => (
                        <option key={ind.name} value={ind.name}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    color: '#000', 
                    fontWeight: '500', 
                    fontSize: '14px' 
                  }}>
                    Template Content:
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter template content. Use {{variableName}} for dynamic variables."
                    style={{ 
                      width: '100%',
                      minHeight: '200px',
                      padding: '10px',
                      border: '1px solid #eee', 
                      borderRadius: '3px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Tip: Use {`{{variableName}}`} to create dynamic variables. 
                    Example: {`{{customerName}}, {{productName}}, {{price}}`}
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    style={{
                      padding: '10px 20px',
                      background: '#666',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      background: loading ? '#ccc' : '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Saving...' : (editingTemplate ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Manager Modal */}
        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            onUpdate={() => {
              fetchCategories()
              fetchTemplates()
            }}
          />
        )}

        {/* Industry Manager Modal */}
        {showIndustryManager && (
          <IndustryManager
            industries={industries}
            onClose={() => setShowIndustryManager(false)}
            onUpdate={() => {
              fetchIndustries()
              fetchTemplates()
            }}
          />
        )}

        {/* Save Message Dialog */}
        {showSaveDialog && (
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
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Save Message
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  color: '#374151', 
                  fontWeight: '500', 
                  fontSize: '14px' 
                }}>
                  Name for saved message:
                </label>
                <input
                  type="text"
                  value={saveDialogName}
                  onChange={(e) => setSaveDialogName(e.target.value)}
                  placeholder="Enter a name for this message"
                  style={{ 
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowSaveDialog(false)
                    setSaveDialogName('')
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMessage}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  Save Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Messages Modal */}
        {showSavedMessages && (
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
              borderRadius: '8px',
              padding: '24px',
              width: '700px',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  Saved Messages ({savedMessages.length})
                </h3>
                <button 
                  onClick={() => setShowSavedMessages(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6'
                    e.target.style.color = '#111827'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none'
                    e.target.style.color = '#6b7280'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', marginRight: '-8px', paddingRight: '8px' }}>
                {savedMessages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#6b7280'
                  }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                      No saved messages yet
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                      Create and save messages to reuse them later
                    </p>
                  </div>
                ) : (
                  savedMessages.map(savedMessage => (
                    <div 
                      key={savedMessage.id}
                      style={{
                        padding: '16px',
                        margin: '0 0 12px 0',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f9fafb'
                        e.target.style.borderColor = '#d1d5db'
                        e.target.style.transform = 'translateY(-1px)'
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff'
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                            {savedMessage.name}
                          </h4>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span style={{ 
                              background: '#f3f4f6', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '11px',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>
                              {savedMessage.template_name}
                            </span>
                            <span style={{ 
                              background: '#e5e7eb', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '11px',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>
                              {categories.find(c => c.name === savedMessage.category)?.label || savedMessage.category}
                            </span>
                            <span style={{ 
                              background: '#ede9fe', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '11px',
                              color: '#7c3aed',
                              fontWeight: '500'
                            }}>
                              {industries.find(i => i.name === savedMessage.industry)?.label || savedMessage.industry}
                            </span>
                          </div>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            color: '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: '1.4'
                          }}>
                            {savedMessage.final_message.substring(0, 100)}...
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                          <button 
                            onClick={() => handleLoadSavedMessage(savedMessage.id)}
                            style={{
                              background: '#10b981',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#059669'}
                            onMouseLeave={(e) => e.target.style.background = '#10b981'}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                              <line x1="8" y1="1" x2="8" y2="4"/>
                              <line x1="16" y1="1" x2="16" y2="4"/>
                            </svg>
                            Load
                          </button>
                          <button 
                            onClick={() => handleDeleteSavedMessage(savedMessage.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6b7280',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#fef2f2'
                              e.target.style.color = '#dc2626'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none'
                              e.target.style.color = '#6b7280'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageTemplate