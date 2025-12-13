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

  // Bảng saved messages
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      template_id INTEGER,
      template_name TEXT NOT NULL,
      variables TEXT NOT NULL,
      final_message TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      industry TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES message_templates (id)
    )
  `)

  // Bảng quote templates
  db.run(`
    CREATE TABLE IF NOT EXISTS quote_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      template_path TEXT NOT NULL,
      fields TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Bảng quotes
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER,
      customer_name TEXT,
      quote_data TEXT NOT NULL,
      file_path TEXT NOT NULL,
      format TEXT DEFAULT 'docx',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES quote_templates (id)
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

  // Insert sample quote templates
  db.get("SELECT COUNT(*) as count FROM quote_templates", (err, row) => {
    if (row && row.count === 0) {
      const sampleQuoteTemplates = [
        {
          name: 'Basic Service Quote',
          fields: JSON.stringify([
            { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
            { name: 'companyName', label: 'Company Name', type: 'text', required: true },
            { name: 'serviceName', label: 'Service Name', type: 'text', required: true },
            { name: 'description', label: 'Service Description', type: 'textarea', required: true },
            { name: 'price', label: 'Price', type: 'number', required: true },
            { name: 'validUntil', label: 'Valid Until', type: 'date', required: true }
          ]),
          category: 'service',
          template_path: 'sample_service_quote.docx'
        },
        {
          name: 'Product Quote',
          fields: JSON.stringify([
            { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
            { name: 'companyName', label: 'Company Name', type: 'text', required: true },
            { name: 'productName', label: 'Product Name', type: 'text', required: true },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'unitPrice', label: 'Unit Price', type: 'number', required: true },
            { name: 'totalPrice', label: 'Total Price', type: 'number', required: true },
            { name: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true }
          ]),
          category: 'product',
          template_path: 'sample_product_quote.docx'
        }
      ]

      sampleQuoteTemplates.forEach(template => {
        db.run(
          "INSERT INTO quote_templates (name, fields, category, template_path) VALUES (?, ?, ?, ?)",
          [template.name, template.fields, template.category, template.template_path]
        )
      })
      
      console.log('Đã thêm dữ liệu mẫu cho quote templates')
    }
  })
}

export default db