import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, 'mini-tools.db')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Lỗi kết nối database:', err.message)
  } else {
    console.log('Đã kết nối SQLite database')
    initTables()
  }
})

function initTables() {
  // Bảng categories
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bảng industries
  db.run(`
    CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bảng message templates
  db.run(`
    CREATE TABLE IF NOT EXISTS message_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      industry TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add industry column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE message_templates ADD COLUMN industry TEXT DEFAULT 'general'`, (err) => {
    // Ignore error if column already exists
  })

  // Insert default categories
  db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
    if (row.count === 0) {
      const defaultCategories = [
        { name: 'general', label: 'General' },
        { name: 'greeting', label: 'Greeting' },
        { name: 'quotation', label: 'Quotation' },
        { name: 'follow-up', label: 'Follow Up' },
        { name: 'closing', label: 'Closing' },
        { name: 'promotion', label: 'Promotion' },
        { name: 'support', label: 'Support' }
      ]

      defaultCategories.forEach(category => {
        db.run(
          "INSERT INTO categories (name, label) VALUES (?, ?)",
          [category.name, category.label]
        )
      })
      
      console.log('Đã thêm categories mặc định')
    }
  })

  // Insert default industries
  db.get("SELECT COUNT(*) as count FROM industries", (err, row) => {
    if (row.count === 0) {
      const defaultIndustries = [
        { name: 'general', label: 'General' },
        { name: 'technology', label: 'Technology' },
        { name: 'real-estate', label: 'Real Estate' },
        { name: 'ecommerce', label: 'E-commerce' },
        { name: 'healthcare', label: 'Healthcare' },
        { name: 'finance', label: 'Finance' },
        { name: 'education', label: 'Education' },
        { name: 'retail', label: 'Retail' }
      ]

      defaultIndustries.forEach(industry => {
        db.run(
          "INSERT INTO industries (name, label) VALUES (?, ?)",
          [industry.name, industry.label]
        )
      })
      
      console.log('Đã thêm industries mặc định')
    }
  })

  // Insert sample templates
  db.get("SELECT COUNT(*) as count FROM message_templates", (err, row) => {
    if (row.count === 0) {
      const sampleTemplates = [
        {
          name: 'Customer Greeting - Tech',
          content: 'Hello {{customerName}}!\n\nThank you for your interest in our {{productName}}.\n\nI\'m {{salesName}}, and I\'ll be helping you explore our technology solutions.\n\nCould you tell me more about your specific requirements?',
          category: 'greeting',
          industry: 'technology'
        },
        {
          name: 'Product Quote - Real Estate',
          content: 'Dear {{customerName}},\n\nBased on your requirements, here\'s the quote for {{propertyName}}:\n\n- Price: {{price}}\n- Location: {{location}}\n- Size: {{size}}\n- Available from: {{availableDate}}\n\nThis offer is valid for {{validDays}} days.\n\nBest regards,\n{{salesName}}',
          category: 'quotation',
          industry: 'real-estate'
        },
        {
          name: 'Follow Up - E-commerce',
          content: 'Hi {{customerName}},\n\nI wanted to follow up on the {{productName}} you were interested in.\n\nWe currently have a special promotion running until {{promoEndDate}}.\n\nWould you like to schedule a call to discuss this further?\n\nBest,\n{{salesName}}',
          category: 'follow-up',
          industry: 'ecommerce'
        }
      ]

      sampleTemplates.forEach(template => {
        db.run(
          "INSERT INTO message_templates (name, content, category, industry) VALUES (?, ?, ?, ?)",
          [template.name, template.content, template.category, template.industry]
        )
      })
      
      console.log('Đã thêm dữ liệu mẫu cho message templates')
    }
  })
}

export default db