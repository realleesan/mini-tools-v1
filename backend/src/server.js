import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import messageTemplateRoutes from './modules/message-template/routes.js'
import categoryRoutes from './modules/categories/routes.js'
import industryRoutes from './modules/industries/routes.js'
import savedMessageRoutes from './modules/saved-messages/routes.js'
import quoteRoutes from './modules/quote/routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/message-templates', messageTemplateRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/industries', industryRoutes)
app.use('/api/saved-messages', savedMessageRoutes)
app.use('/api/quote', quoteRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mini Tools Backend is running' })
})

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`)
})