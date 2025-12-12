import express from 'express'
import { db } from '../../database/init.js'

const router = express.Router()

// Lấy danh sách categories
router.get('/', (req, res) => {
  db.all("SELECT * FROM categories ORDER BY label", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Tạo category mới
router.post('/', (req, res) => {
  const { name, label } = req.body

  if (!name || !label) {
    res.status(400).json({ error: 'Name and label are required' })
    return
  }

  db.run(
    "INSERT INTO categories (name, label) VALUES (?, ?)",
    [name.toLowerCase().replace(/\s+/g, '-'), label],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Category already exists' })
        } else {
          res.status(500).json({ error: err.message })
        }
        return
      }
      res.json({ 
        id: this.lastID,
        name: name.toLowerCase().replace(/\s+/g, '-'),
        label,
        message: 'Category created successfully'
      })
    }
  )
})

// Cập nhật category
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { label } = req.body

  if (!label) {
    res.status(400).json({ error: 'Label is required' })
    return
  }

  db.run(
    "UPDATE categories SET label = ? WHERE id = ?",
    [label, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Category not found' })
        return
      }
      res.json({ message: 'Category updated successfully' })
    }
  )
})

// Tạo categories hàng loạt
router.post('/bulk', (req, res) => {
  const { categories } = req.body

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ error: 'Categories array is required' })
    return
  }

  const stmt = db.prepare("INSERT INTO categories (name, label) VALUES (?, ?)")
  const results = []
  const errors = []

  categories.forEach((category, index) => {
    if (!category.name || !category.label) {
      errors.push(`Item ${index + 1}: Name and label are required`)
      return
    }

    try {
      const result = stmt.run(category.name.toLowerCase().replace(/\s+/g, '-'), category.label)
      results.push({
        id: result.lastID,
        name: category.name.toLowerCase().replace(/\s+/g, '-'),
        label: category.label
      })
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        errors.push(`Item ${index + 1}: Category "${category.name}" already exists`)
      } else {
        errors.push(`Item ${index + 1}: ${err.message}`)
      }
    }
  })

  stmt.finalize()

  res.json({
    created: results,
    errors: errors,
    message: `Created ${results.length} categories${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
  })
})

// Xóa categories hàng loạt
router.delete('/bulk', (req, res) => {
  const { ids } = req.body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'IDs array is required' })
    return
  }

  // Check if any categories are being used
  const placeholders = ids.map(() => '?').join(',')
  db.all(
    `SELECT c.id, c.name, COUNT(mt.id) as usage_count 
     FROM categories c 
     LEFT JOIN message_templates mt ON c.name = mt.category 
     WHERE c.id IN (${placeholders}) 
     GROUP BY c.id, c.name`,
    ids,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }

      const inUse = rows.filter(row => row.usage_count > 0)
      if (inUse.length > 0) {
        res.status(400).json({ 
          error: 'Some categories are being used and cannot be deleted',
          inUse: inUse.map(row => ({ id: row.id, name: row.name, usage_count: row.usage_count }))
        })
        return
      }

      // Delete categories
      db.run(`DELETE FROM categories WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        res.json({ 
          message: `Deleted ${this.changes} categories successfully`,
          deleted_count: this.changes
        })
      })
    }
  )
})

// Xóa category
router.delete('/:id', (req, res) => {
  const { id } = req.params
  
  // Check if category is being used
  db.get("SELECT COUNT(*) as count FROM message_templates WHERE category = (SELECT name FROM categories WHERE id = ?)", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: `Cannot delete category. It is being used by ${row.count} template(s)` })
      return
    }

    db.run("DELETE FROM categories WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Category not found' })
        return
      }
      res.json({ message: 'Category deleted successfully' })
    })
  })
})

export default router