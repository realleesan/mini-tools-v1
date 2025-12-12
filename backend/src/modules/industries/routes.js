import express from 'express'
import { db } from '../../database/init.js'

const router = express.Router()

// Lấy danh sách industries
router.get('/', (req, res) => {
  db.all("SELECT * FROM industries ORDER BY label", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Tạo industry mới
router.post('/', (req, res) => {
  const { name, label } = req.body

  if (!name || !label) {
    res.status(400).json({ error: 'Name and label are required' })
    return
  }

  db.run(
    "INSERT INTO industries (name, label) VALUES (?, ?)",
    [name.toLowerCase().replace(/\s+/g, '-'), label],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Industry already exists' })
        } else {
          res.status(500).json({ error: err.message })
        }
        return
      }
      res.json({ 
        id: this.lastID,
        name: name.toLowerCase().replace(/\s+/g, '-'),
        label,
        message: 'Industry created successfully'
      })
    }
  )
})

// Cập nhật industry
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { label } = req.body

  if (!label) {
    res.status(400).json({ error: 'Label is required' })
    return
  }

  db.run(
    "UPDATE industries SET label = ? WHERE id = ?",
    [label, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Industry not found' })
        return
      }
      res.json({ message: 'Industry updated successfully' })
    }
  )
})

// Tạo industries hàng loạt
router.post('/bulk', (req, res) => {
  const { industries } = req.body

  if (!industries || !Array.isArray(industries) || industries.length === 0) {
    res.status(400).json({ error: 'Industries array is required' })
    return
  }

  const stmt = db.prepare("INSERT INTO industries (name, label) VALUES (?, ?)")
  const results = []
  const errors = []

  industries.forEach((industry, index) => {
    if (!industry.name || !industry.label) {
      errors.push(`Item ${index + 1}: Name and label are required`)
      return
    }

    try {
      const result = stmt.run(industry.name.toLowerCase().replace(/\s+/g, '-'), industry.label)
      results.push({
        id: result.lastID,
        name: industry.name.toLowerCase().replace(/\s+/g, '-'),
        label: industry.label
      })
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        errors.push(`Item ${index + 1}: Industry "${industry.name}" already exists`)
      } else {
        errors.push(`Item ${index + 1}: ${err.message}`)
      }
    }
  })

  stmt.finalize()

  res.json({
    created: results,
    errors: errors,
    message: `Created ${results.length} industries${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
  })
})

// Xóa industries hàng loạt
router.delete('/bulk', (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'IDs array is required' })
    return
  }

  // Check if any industries are being used
  const placeholders = ids.map(() => '?').join(',')
  db.all(
    `SELECT i.id, i.name, COUNT(mt.id) as usage_count 
     FROM industries i 
     LEFT JOIN message_templates mt ON i.name = mt.industry 
     WHERE i.id IN (${placeholders}) 
     GROUP BY i.id, i.name`,
    ids,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }

      const inUse = rows.filter(row => row.usage_count > 0)
      if (inUse.length > 0) {
        res.status(400).json({ 
          error: 'Some industries are being used and cannot be deleted',
          inUse: inUse.map(row => ({ id: row.id, name: row.name, usage_count: row.usage_count }))
        })
        return
      }

      // Delete industries
      db.run(`DELETE FROM industries WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        res.json({ 
          message: `Deleted ${this.changes} industries successfully`,
          deleted_count: this.changes
        })
      })
    }
  )
})

// Xóa industry
router.delete('/:id', (req, res) => {
  const { id } = req.params
  
  // Check if industry is being used
  db.get("SELECT COUNT(*) as count FROM message_templates WHERE industry = (SELECT name FROM industries WHERE id = ?)", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: `Cannot delete industry. It is being used by ${row.count} template(s)` })
      return
    }

    db.run("DELETE FROM industries WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Industry not found' })
        return
      }
      res.json({ message: 'Industry deleted successfully' })
    })
  })
})

export default router