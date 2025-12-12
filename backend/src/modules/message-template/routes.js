import express from 'express'
import { db } from '../../database/init.js'
import Handlebars from 'handlebars'

const router = express.Router()

// Lấy danh sách templates
router.get('/', (req, res) => {
  db.all("SELECT * FROM message_templates ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Lấy template theo ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  db.get("SELECT * FROM message_templates WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (!row) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }
    res.json(row)
  })
})

// Tạo tin nhắn từ template
router.post('/generate', (req, res) => {
  const { templateId, variables } = req.body

  if (!templateId) {
    res.status(400).json({ error: 'Template ID là bắt buộc' })
    return
  }

  db.get("SELECT * FROM message_templates WHERE id = ?", [templateId], (err, template) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (!template) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }

    try {
      // Compile template với Handlebars
      const compiledTemplate = Handlebars.compile(template.content)
      const message = compiledTemplate(variables || {})
      
      res.json({ 
        message,
        templateName: template.name,
        variables: variables || {}
      })
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tạo tin nhắn: ' + error.message })
    }
  })
})

// Tạo template mới
router.post('/', (req, res) => {
  const { name, content, category = 'general', industry = 'general' } = req.body
  
  console.log('Creating template with data:', { name, content, category, industry }) // Debug log

  if (!name || !content) {
    res.status(400).json({ error: 'Tên và nội dung template là bắt buộc' })
    return
  }

  db.run(
    "INSERT INTO message_templates (name, content, category, industry) VALUES (?, ?, ?, ?)",
    [name, content, category, industry],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ 
        id: this.lastID,
        message: 'Template đã được tạo thành công'
      })
    }
  )
})

// Cập nhật template
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { name, content, category, industry } = req.body
  
  console.log('Updating template with data:', { id, name, content, category, industry }) // Debug log

  db.run(
    "UPDATE message_templates SET name = ?, content = ?, category = ?, industry = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, content, category, industry, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Template không tồn tại' })
        return
      }
      res.json({ message: 'Template đã được cập nhật' })
    }
  )
})

// Xóa template
router.delete('/:id', (req, res) => {
  const { id } = req.params
  
  db.run("DELETE FROM message_templates WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }
    res.json({ message: 'Template đã được xóa' })
  })
})

export default router