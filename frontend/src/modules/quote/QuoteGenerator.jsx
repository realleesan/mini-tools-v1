import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import QuoteTemplate from '../../components/QuoteTemplate'

// CSS styles for docx preview
const docxPreviewStyles = `
  .docx-preview p {
    margin: 8px 0;
    text-align: justify;
  }
  .docx-preview h1, .docx-preview h2, .docx-preview h3 {
    margin: 16px 0 8px 0;
    font-weight: bold;
  }
  .docx-preview h1 { font-size: 18px; }
  .docx-preview h2 { font-size: 16px; }
  .docx-preview h3 { font-size: 14px; }
  .docx-preview strong, .docx-preview b {
    font-weight: bold;
  }
  .docx-preview em, .docx-preview i {
    font-style: italic;
  }
  .docx-preview ul, .docx-preview ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  .docx-preview li {
    margin: 4px 0;
  }
  .docx-preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }
  .docx-preview td, .docx-preview th {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  .docx-preview th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
`

const QuoteGenerator = () => {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [quoteData, setQuoteData] = useState({})
  const [loading, setLoading] = useState(false)
  const [generatedQuote, setGeneratedQuote] = useState(null)
  // Template management states
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    fields: [{ name: '', label: '', type: 'text', required: true }],
    category: 'general'
  })
  const [editingTemplate, setEditingTemplate] = useState(null)

  const [previewContent, setPreviewContent] = useState('')
  const [isEditingPreview, setIsEditingPreview] = useState(false)
  const [editablePreview, setEditablePreview] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  
  // Rich text editor states
  const [editorRef, setEditorRef] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/quote/templates')
      setTemplates(response.data)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }



  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    setSelectedTemplate(templateId)
    
    if (template) {
      const fields = JSON.parse(template.fields)
      const initialData = {}
      fields.forEach(field => {
        initialData[field.name] = ''
      })
      setQuoteData(initialData)
      
      // Auto-generate preview with empty variables
      generateLivePreview(template, initialData)
    }
  }

  const handleDataChange = (fieldName, value) => {
    const newData = {
      ...quoteData,
      [fieldName]: value
    }
    setQuoteData(newData)
    
    // Auto-update live preview với debounce để tránh gọi API quá nhiều
    clearTimeout(window.previewTimeout)
    window.previewTimeout = setTimeout(() => {
      const template = templates.find(t => t.id === parseInt(selectedTemplate))
      if (template) {
        generateLivePreview(template, newData)
      }
    }, 500) // Delay 500ms
  }

  const generateQuote = async (format = 'html') => {
    if (!selectedTemplate || !quoteData) return

    setLoading(true)
    try {
      if (format === 'html' || format === 'pdf') {
        // Generate HTML version using QuoteTemplate
        const quoteElement = document.createElement('div')
        const root = ReactDOM.createRoot(quoteElement)
        root.render(<QuoteTemplate data={quoteData} />)
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Báo giá - ${quoteData.ten_web || 'Website'}</title>
    <style>
        body { margin: 0; padding: 20px; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    ${quoteElement.innerHTML}
</body>
</html>`

        // Create and download HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quote_${quoteData.ten_web || 'website'}_${Date.now()}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        alert(`Báo giá đã được tạo thành công! Format: ${format.toUpperCase()}`)
        
        if (format === 'pdf') {
          alert('Để chuyển sang PDF: Mở file HTML vừa tải → Ctrl+P → Save as PDF')
        }
      } else {
        // Fallback to old API method
        const response = await axios.post('/api/quote/generate', {
          templateId: parseInt(selectedTemplate),
          quoteData,
          format
        })
        
        setGeneratedQuote(response.data)
        alert(`Báo giá đã được tạo thành công! Format: ${format.toUpperCase()}`)
        
        if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank')
        }
      }
    } catch (error) {
      console.error('Error generating quote:', error)
      alert('Lỗi khi tạo báo giá!')
    } finally {
      setLoading(false)
    }
  }



  const addField = () => {
    setTemplateForm(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', label: '', type: 'text', required: true }]
    }))
  }



  const removeField = (index) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const updateField = (index, key, value) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, [key]: value } : field
      )
    }))
  }

  const createTemplateFromFile = async (file, name, category) => {
    const formData = new FormData()
    formData.append('template', file)
    formData.append('name', name)
    formData.append('category', category)
    
    try {
      const response = await axios.post('/api/quote/templates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      alert(`Template created successfully! Found ${response.data.fields.length} fields: ${response.data.placeholders.join(', ')}`)
      return response.data
    } catch (error) {
      console.error('Error creating template from file:', error)
      throw error
    }
  }

  const createTemplate = async () => {
    // Validation
    if (!templateForm.name.trim()) {
      alert('Please enter template name')
      return
    }
    
    try {
      if (editingTemplate) {
        // Update existing template - keep old workflow
        if (!templateForm.fields || templateForm.fields.length === 0) {
          alert('Please add at least one field')
          return
        }
        
        // Validate fields
        for (let i = 0; i < templateForm.fields.length; i++) {
          const field = templateForm.fields[i]
          if (!field.name.trim() || !field.label.trim()) {
            alert(`Please fill in field name and label for field ${i + 1}`)
            return
          }
        }
        
        await axios.put(`/api/quote/templates/${editingTemplate.id}`, templateForm)
        alert('Template updated successfully!')
        resetTemplateForm()
        fetchTemplates()
      } else {
        // Create new template - upload file first
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = '.docx'
        fileInput.onchange = async (e) => {
          const file = e.target.files[0]
          if (file) {
            try {
              await createTemplateFromFile(file, templateForm.name, templateForm.category)
              resetTemplateForm()
              fetchTemplates()
            } catch (error) {
              alert(`Error creating template: ${error.response?.data?.error || error.message}`)
            }
          }
        }
        fileInput.click()
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert(`Error saving template: ${error.response?.data?.error || error.message}`)
    }
  }

  const resetTemplateForm = () => {
    setShowTemplateForm(false)
    setEditingTemplate(null)
    setTemplateForm({
      name: '',
      fields: [{ name: '', label: '', type: 'text', required: true }],
      category: 'general'
    })
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      fields: JSON.parse(template.fields),
      category: template.category
    })
    setShowTemplateForm(true)
  }

  // Generate live preview from .docx template
  const generateLivePreview = async (template, data) => {
    // Kiểm tra xem template có file .docx không
    if (!template.template_path || 
        template.template_path === 'sample_service_quote.docx' || 
        template.template_path === 'sample_product_quote.docx') {
      // Fallback to simple preview nếu chưa có file
      const fields = JSON.parse(template.fields)
      let preview = `<div style="font-family: 'Times New Roman', serif; line-height: 1.6; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px; color: #111827;">QUOTE PREVIEW</h2>
        <p><strong>Template:</strong> ${template.name}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr style="margin: 20px 0;">
      `
      
      fields.forEach(field => {
        const value = data[field.name] || `<span style="background: #fef3c7; padding: 2px 4px; border-radius: 3px;">{{${field.name}}}</span>`
        preview += `<p><strong>${field.label}:</strong> ${value}</p>`
      })
      
      preview += `<hr style="margin: 20px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">Generated by Quote Generator</p>
        <p style="text-align: center; color: #f59e0b; font-size: 12px;">⚠️ Upload .docx template to see actual document preview</p>
      </div>`
      
      setPreviewContent(preview)
      setEditablePreview(preview.replace(/<[^>]*>/g, '')) // Plain text for editing
      return
    }

    try {
      setPreviewLoading(true)
      // Gọi API để lấy preview từ file .docx
      const response = await axios.post(`/api/quote/templates/${template.id}/preview`, {
        data: data
      })
      
      if (response.data.success) {
        // Sử dụng HTML content nếu có, fallback to plain text
        const content = response.data.htmlContent || response.data.content
        setPreviewContent(content)
        setEditablePreview(response.data.content) // Plain text cho editing
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      // Fallback to simple preview nếu có lỗi
      const fields = JSON.parse(template.fields)
      let preview = `QUOTE PREVIEW\n\nTemplate: ${template.name}\nDate: ${new Date().toLocaleDateString()}\n\n`
      
      fields.forEach(field => {
        const value = data[field.name] || `{{${field.name}}}`
        preview += `${field.label}: ${value}\n`
      })
      
      preview += `\n---\nError loading .docx preview. Please check template file.`
      setPreviewContent(preview)
      setEditablePreview(preview)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handlePreviewEdit = (value) => {
    setEditablePreview(value)
  }

  const toggleEditMode = () => {
    if (isEditingPreview) {
      // Save edited content back to preview
      setPreviewContent(editablePreview)
    } else {
      // Enter edit mode - use HTML content if available
      setEditablePreview(previewContent.includes('<') ? previewContent : `<p>${previewContent.replace(/\n/g, '</p><p>')}</p>`)
    }
    setIsEditingPreview(!isEditingPreview)
  }

  const copyToClipboard = () => {
    const textToCopy = isEditingPreview ? editablePreview : previewContent
    navigator.clipboard.writeText(textToCopy)
    alert('Quote copied to clipboard!')
  }

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    if (editorRef) {
      setEditablePreview(editorRef.innerHTML)
    }
  }

  const insertText = (text) => {
    if (editorRef) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(text))
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      setEditablePreview(editorRef.innerHTML)
    }
  }

  const refreshPreview = () => {
    const template = templates.find(t => t.id === parseInt(selectedTemplate))
    if (template) {
      generateLivePreview(template, quoteData)
    }
  }

  const uploadTemplateFile = async (templateId, file) => {
    const formData = new FormData()
    formData.append('template', file)
    
    try {
      await axios.post(`/api/quote/templates/${templateId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Template file uploaded successfully!')
    } catch (error) {
      console.error('Error uploading template file:', error)
      alert('Error uploading template file!')
    }
  }

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      await axios.delete(`/api/quote/templates/${templateId}`)
      alert('Template deleted successfully!')
      
      // Reset selected template if it was the deleted one
      if (selectedTemplate === templateId.toString()) {
        setSelectedTemplate('')
        setQuoteData({})
      }
      
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template!')
    }
  }

  const selectedTemplateData = templates.find(t => t.id === parseInt(selectedTemplate))
  const templateFields = selectedTemplateData ? JSON.parse(selectedTemplateData.fields) : []

  // Toolbar button style
  const toolbarButtonStyle = {
    padding: '4px 8px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    minWidth: '28px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }

  return (
    <>
      <style>{docxPreviewStyles}</style>
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left Sidebar - Templates */}
      <div style={{ 
        width: '320px', 
        background: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)', // Fixed height
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
              Quote Templates
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {templates.length} templates
            </p>
          </div>
          <button 
            onClick={() => setShowTemplateForm(true)}
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
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New
          </button>
        </div>

        {/* Templates List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {templates.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p style={{ margin: 0, fontSize: '14px' }}>No templates yet</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Create your first template</p>
            </div>
          ) : (
            templates.map(template => (
              <div 
                key={template.id}
                onClick={() => handleTemplateChange(template.id.toString())}
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
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#d1d5db'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate !== template.id.toString()) {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      {template.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ 
                        background: '#f3f4f6', 
                        padding: '1px 6px', 
                        borderRadius: '10px', 
                        fontSize: '10px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {template.category}
                      </span>
                      {template.template_path && template.template_path !== 'sample_service_quote.docx' && template.template_path !== 'sample_product_quote.docx' ? (
                        <span style={{ 
                          background: '#dcfce7', 
                          color: '#166534',
                          padding: '1px 6px', 
                          borderRadius: '10px', 
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          ✓ File Ready
                        </span>
                      ) : (
                        <span style={{ 
                          background: '#fef3c7', 
                          color: '#92400e',
                          padding: '1px 6px', 
                          borderRadius: '10px', 
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          ⚠ No File
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '11px', 
                      color: '#6b7280'
                    }}>
                      {JSON.parse(template.fields).length} fields
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                    {(!template.template_path || template.template_path === 'sample_service_quote.docx' || template.template_path === 'sample_product_quote.docx') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const fileInput = document.createElement('input')
                          fileInput.type = 'file'
                          fileInput.accept = '.docx'
                          fileInput.onchange = async (event) => {
                            const file = event.target.files[0]
                            if (file) {
                              await uploadTemplateFile(template.id, file)
                              fetchTemplates()
                            }
                          }
                          fileInput.click()
                        }}
                        title="Upload .docx template file"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#10b981',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0fdf4'
                          e.target.style.color = '#059669'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none'
                          e.target.style.color = '#10b981'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTemplate(template)
                      }}
                      title="Edit template"
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
                        deleteTemplate(template.id)
                      }}
                      title="Delete template"
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
                        <path d="m19,6v14a2,2 0 0,1 -2,2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
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

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', gap: '20px', height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        {/* Quote Form - Left Side */}
        {selectedTemplate && (
          <div style={{ 
            width: '50%',
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            height: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {selectedTemplateData?.name}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {templateFields.map((field, index) => (
                <div key={field.name}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '6px',
                    color: '#374151', 
                    fontWeight: '500', 
                    fontSize: '14px' 
                  }}>
                    {field.label}
                    {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={quoteData[field.name] || ''}
                      onChange={(e) => handleDataChange(field.name, e.target.value)}
                      required={field.required}
                      style={{ 
                        width: '100%',
                        minHeight: '80px',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={quoteData[field.name] || ''}
                      onChange={(e) => handleDataChange(field.name, e.target.value)}
                      required={field.required}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={quoteData[field.name] || ''}
                      onChange={(e) => handleDataChange(field.name, e.target.value)}
                      required={field.required}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={quoteData[field.name] || ''}
                      onChange={(e) => handleDataChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => generateQuote('html')}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  background: loading ? '#9ca3af' : '#111827',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {loading ? 'Generating...' : 'Export HTML'}
              </button>
              
              <button 
                onClick={() => generateQuote('pdf')}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  background: loading ? '#9ca3af' : '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {loading ? 'Generating...' : 'Print PDF'}
              </button>
            </div>
          </div>
        )}

        {/* Live Preview Section - Right Side */}
        {selectedTemplate && (
          <div style={{ 
            width: '50%',
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: '100%'
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
                {previewContent && (
                  <>
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
                  onClick={refreshPreview}
                  style={{
                    padding: '8px 12px',
                    background: '#111827',
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
                  onMouseEnter={(e) => e.target.style.background = '#374151'}
                  onMouseLeave={(e) => e.target.style.background = '#111827'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  Refresh
                </button>
                {previewContent && (
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
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              {previewLoading ? (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #111827',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '12px'
                  }}></div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Loading preview from .docx...
                  </p>
                </div>
              ) : previewContent ? (
                isEditingPreview ? (
                  <div>
                    {/* Rich Text Editor Toolbar */}
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      padding: '8px',
                      background: '#f8f9fa',
                      border: '1px solid #e5e7eb',
                      borderBottom: 'none',
                      borderRadius: '4px 4px 0 0',
                      flexWrap: 'wrap'
                    }}>
                      {/* Font formatting */}
                      <button onClick={() => execCommand('bold')} style={toolbarButtonStyle} title="Bold">
                        <strong>B</strong>
                      </button>
                      <button onClick={() => execCommand('italic')} style={toolbarButtonStyle} title="Italic">
                        <em>I</em>
                      </button>
                      <button onClick={() => execCommand('underline')} style={toolbarButtonStyle} title="Underline">
                        <u>U</u>
                      </button>
                      
                      <div style={{ width: '1px', background: '#d1d5db', margin: '0 4px' }}></div>
                      
                      {/* Alignment */}
                      <button onClick={() => execCommand('justifyLeft')} style={toolbarButtonStyle} title="Align Left">
                        ⬅
                      </button>
                      <button onClick={() => execCommand('justifyCenter')} style={toolbarButtonStyle} title="Center">
                        ↔
                      </button>
                      <button onClick={() => execCommand('justifyRight')} style={toolbarButtonStyle} title="Align Right">
                        ➡
                      </button>
                      
                      <div style={{ width: '1px', background: '#d1d5db', margin: '0 4px' }}></div>
                      
                      {/* Font size */}
                      <select 
                        onChange={(e) => execCommand('fontSize', e.target.value)}
                        style={{
                          padding: '2px 4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="">Size</option>
                        <option value="1">8pt</option>
                        <option value="2">10pt</option>
                        <option value="3">12pt</option>
                        <option value="4">14pt</option>
                        <option value="5">18pt</option>
                        <option value="6">24pt</option>
                        <option value="7">36pt</option>
                      </select>
                      
                      {/* Font color */}
                      <input
                        type="color"
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        style={{
                          width: '30px',
                          height: '24px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Text Color"
                      />
                      
                      {/* Background color */}
                      <input
                        type="color"
                        onChange={(e) => execCommand('backColor', e.target.value)}
                        style={{
                          width: '30px',
                          height: '24px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                        title="Background Color"
                      />
                    </div>
                    
                    {/* Rich Text Editor */}
                    <div
                      ref={setEditorRef}
                      contentEditable
                      onInput={(e) => handlePreviewEdit(e.target.innerHTML)}
                      dangerouslySetInnerHTML={{ __html: editablePreview }}
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0 0 4px 4px',
                        background: 'white',
                        padding: '16px',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#111827',
                        fontFamily: '"Times New Roman", serif',
                        lineHeight: '1.6',
                        overflowY: 'auto'
                      }}
                    />
                  </div>
                ) : (
                  // Render QuoteTemplate component với data
                  <div style={{ 
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <QuoteTemplate data={quoteData} />
                  </div>
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
                    Fill in the form to see preview
                  </p>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Preview will appear instantly as you type
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State - Full width */}
        {!selectedTemplate && (
          <div style={{ 
            flex: 1, // Take all remaining space
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '60px 40px',
            textAlign: 'center',
            height: 'calc(100vh - 140px)', // Same as sidebar
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            
            <h1 style={{ margin: '0 0 16px 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>
              Quote Generator
            </h1>
            
            <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: '18px', maxWidth: '500px', lineHeight: '1.6' }}>
              Create professional quotes quickly and easily. Choose a template from the sidebar or create a new one to get started.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              <div style={{ 
                padding: '20px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '200px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: '#111827', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Upload Template
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                  Upload your .docx file with placeholders like {'{'}{'}'} customerName {'}'}
                </p>
              </div>
              
              <div style={{ 
                padding: '20px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '200px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: '#374151', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Add Fields
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                  Customize your template with dynamic fields and data
                </p>
              </div>
              
              <div style={{ 
                padding: '20px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '200px'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: '#6b7280', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Generate Quote
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                  Export as DOCX or PDF with professional formatting
                </p>
              </div>
            </div>
            
            <div style={{ 
              padding: '16px 24px',
              background: '#111827',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'white',
              fontWeight: '500',
              maxWidth: '600px'
            }}>
              🚀 Get started by clicking "New" in the sidebar to create your first template!
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/quote/templates/create-clean', {
                      name: 'Clean Template',
                      category: 'general'
                    })
                    alert('Clean template created! Please upload a .docx file to complete setup.')
                    fetchTemplates()
                  } catch (error) {
                    console.error('Error creating clean template:', error)
                    alert('Error creating template!')
                  }
                }}
                style={{
                  padding: '12px 24px',
                  background: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Create Clean Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Template Form Modal */}
      {showTemplateForm && (
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
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {editingTemplate ? 'Edit Quote Template' : 'Create Quote Template'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '500', 
                fontSize: '14px' 
              }}>
                Template Name:
              </label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                style={{ 
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '500', 
                fontSize: '14px' 
              }}>
                Category:
              </label>
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                style={{ 
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="general">General</option>
                <option value="product">Product Quote</option>
                <option value="service">Service Quote</option>
                <option value="project">Project Quote</option>
              </select>
            </div>

            {editingTemplate && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ 
                      color: '#374151', 
                      fontWeight: '500', 
                      fontSize: '14px' 
                    }}>
                      Template Fields:
                    </label>
                    <button 
                      onClick={addField}
                      style={{
                        padding: '6px 12px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Add Custom Field
                    </button>
                  </div>
                </div>
                
                {templateForm.fields.map((field, index) => (
                  <div key={index} style={{ 
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    background: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        Field #{index + 1}
                      </h5>
                      <button 
                        onClick={() => removeField(index)}
                        disabled={templateForm.fields.length <= 1}
                        title={templateForm.fields.length <= 1 ? "Cannot remove the last field" : "Remove field"}
                        style={{
                          padding: '4px 8px',
                          background: templateForm.fields.length <= 1 ? '#9ca3af' : '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: templateForm.fields.length <= 1 ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                          Field Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., customerName"
                          value={field.name}
                          onChange={(e) => updateField(index, 'name', e.target.value)}
                          style={{ 
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                          Field Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Customer Name"
                          value={field.label}
                          onChange={(e) => updateField(index, 'label', e.target.value)}
                          style={{ 
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, 'type', e.target.value)}
                          style={{ 
                            padding: '8px 10px',
                            border: '1px solid #d1d5db', 
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="textarea">Textarea</option>
                        </select>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '500' }}>
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                            style={{ marginRight: '6px' }}
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              padding: '12px',
              background: editingTemplate ? '#fef3c7' : '#f0f9ff',
              border: `1px solid ${editingTemplate ? '#f59e0b' : '#0369a1'}`,
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: editingTemplate ? '#92400e' : '#0369a1' }}>
                <strong>{editingTemplate ? 'Edit Mode:' : 'New Template:'}</strong> {editingTemplate 
                  ? 'Modify fields manually or upload a new .docx file to replace the template.'
                  : 'Upload a .docx file and we\'ll automatically detect placeholders like {{customerName}}, {{price}}, etc. and create fields for you!'
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={resetTemplateForm}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                Cancel
              </button>
              <button 
                onClick={createTemplate}
                style={{
                  padding: '10px 20px',
                  background: '#111827',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#374151'}
                onMouseLeave={(e) => e.target.style.background = '#111827'}
              >
                {editingTemplate ? 'Update Template' : 'Upload .docx & Create'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
    </>
  )
}

export default QuoteGenerator