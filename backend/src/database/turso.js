import { createClient } from '@libsql/client'

// Turso database connection
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initTables() {
  try {
    // Bảng categories
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Bảng industries
    await db.execute(`
      CREATE TABLE IF NOT EXISTS industries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Bảng message templates
    await db.execute(`
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

    // Insert default data
    await insertDefaultData()
    
    console.log('Turso database initialized successfully')
  } catch (error) {
    console.error('Error initializing Turso database:', error)
  }
}

async function insertDefaultData() {
  // Check and insert default categories
  const categoriesResult = await db.execute("SELECT COUNT(*) as count FROM categories")
  if (categoriesResult.rows[0].count === 0) {
    const defaultCategories = [
      { name: 'general', label: 'General' },
      { name: 'greeting', label: 'Greeting' },
      { name: 'quotation', label: 'Quotation' },
      { name: 'follow-up', label: 'Follow Up' },
      { name: 'closing', label: 'Closing' },
      { name: 'promotion', label: 'Promotion' },
      { name: 'support', label: 'Support' }
    ]

    for (const category of defaultCategories) {
      await db.execute(
        "INSERT INTO categories (name, label) VALUES (?, ?)",
        [category.name, category.label]
      )
    }
    console.log('Default categories inserted')
  }

  // Check and insert default industries
  const industriesResult = await db.execute("SELECT COUNT(*) as count FROM industries")
  if (industriesResult.rows[0].count === 0) {
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

    for (const industry of defaultIndustries) {
      await db.execute(
        "INSERT INTO industries (name, label) VALUES (?, ?)",
        [industry.name, industry.label]
      )
    }
    console.log('Default industries inserted')
  }

  // Check and insert sample templates
  const templatesResult = await db.execute("SELECT COUNT(*) as count FROM message_templates")
  if (templatesResult.rows[0].count === 0) {
    const sampleTemplates = [
      {
        name: 'Customer Greeting - Tech',
        content: 'Hello {{customerName}}!\n\nThank you for your interest in our {{productName}}.\n\nI\'m {{salesName}}, and I\'ll be helping you explore our technology solutions.\n\nCould you tell me more about your specific requirements?',
        category: 'greeting',
        industry: 'technology'
      },

      {
        name: 'Follow Up - E-commerce',
        content: 'Hi {{customerName}},\n\nI wanted to follow up on the {{productName}} you were interested in.\n\nWe currently have a special promotion running until {{promoEndDate}}.\n\nWould you like to schedule a call to discuss this further?\n\nBest,\n{{salesName}}',
        category: 'follow-up',
        industry: 'ecommerce'
      }
    ]

    for (const template of sampleTemplates) {
      await db.execute(
        "INSERT INTO message_templates (name, content, category, industry) VALUES (?, ?, ?, ?)",
        [template.name, template.content, template.category, template.industry]
      )
    }
    console.log('Sample templates inserted')
  }
}

export default db