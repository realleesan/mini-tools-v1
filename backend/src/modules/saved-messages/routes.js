import express from 'express'
import { db } from '../../database/init.js'

const router = express.Router()

// Get all saved messages
router.get('/', (req, res) => {
  const query = `
    SELECT 
      sm.*,
      mt.name as original_template_name
    FROM saved_messages sm
    LEFT JOIN message_templates mt ON sm.template_id = mt.id
    ORDER BY sm.created_at DESC
  `
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching saved messages:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    // Parse variables JSON for each row
    const savedMessages = rows.map(row => ({
      ...row,
      variables: JSON.parse(row.variables)
    }))
    
    res.json(savedMessages)
  })
})

// Get saved message by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  
  const query = `
    SELECT 
      sm.*,
      mt.name as original_template_name
    FROM saved_messages sm
    LEFT JOIN message_templates mt ON sm.template_id = mt.id
    WHERE sm.id = ?
  `
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching saved message:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Saved message not found' })
    }
    
    // Parse variables JSON
    const savedMessage = {
      ...row,
      variables: JSON.parse(row.variables)
    }
    
    res.json(savedMessage)
  })
})

// Create new saved message
router.post('/', (req, res) => {
  const { name, template_id, template_name, variables, final_message, category, industry } = req.body
  
  if (!name || !template_name || !variables || !final_message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const query = `
    INSERT INTO saved_messages (name, template_id, template_name, variables, final_message, category, industry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  
  const variablesJson = JSON.stringify(variables)
  
  db.run(query, [name, template_id, template_name, variablesJson, final_message, category || 'general', industry || 'general'], function(err) {
    if (err) {
      console.error('Error creating saved message:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Saved message created successfully' 
    })
  })
})

// Update saved message
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { name, variables, final_message, category, industry } = req.body
  
  if (!name || !variables || !final_message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const query = `
    UPDATE saved_messages 
    SET name = ?, variables = ?, final_message = ?, category = ?, industry = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  
  const variablesJson = JSON.stringify(variables)
  
  db.run(query, [name, variablesJson, final_message, category || 'general', industry || 'general', id], function(err) {
    if (err) {
      console.error('Error updating saved message:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Saved message not found' })
    }
    
    res.json({ message: 'Saved message updated successfully' })
  })
})

// Delete saved message
router.delete('/:id', (req, res) => {
  const { id } = req.params
  
  const query = 'DELETE FROM saved_messages WHERE id = ?'
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting saved message:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Saved message not found' })
    }
    
    res.json({ message: 'Saved message deleted successfully' })
  })
})

// Load saved message into current session
router.post('/:id/load', (req, res) => {
  const { id } = req.params
  
  const query = `
    SELECT 
      sm.*,
      mt.content as template_content
    FROM saved_messages sm
    LEFT JOIN message_templates mt ON sm.template_id = mt.id
    WHERE sm.id = ?
  `
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error loading saved message:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Saved message not found' })
    }
    
    // Parse variables JSON and return data for loading into UI
    const loadData = {
      template_id: row.template_id,
      template_name: row.template_name,
      template_content: row.template_content,
      variables: JSON.parse(row.variables),
      final_message: row.final_message,
      category: row.category,
      industry: row.industry
    }
    
    res.json(loadData)
  })
})

export default router