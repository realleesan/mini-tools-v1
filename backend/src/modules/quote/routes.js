import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { generateDOCX, generatePDF } from './exportService.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Tạo thư mục generated nếu chưa có
const generatedDir = join(__dirname, 'generated')
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true })
}

// GET /api/quote/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Quote Generator API is working',
    timestamp: new Date().toISOString()
  })
})

// POST /api/quote/generate - Generate quote
router.post('/generate', async (req, res) => {
  try {
    const quoteData = req.body
    
    // Validate required fields
    if (!quoteData.ten_web || !quoteData.khach_hang) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên website và khách hàng là bắt buộc'
      })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `quote_${timestamp}.json`
    const filepath = join(generatedDir, filename)

    // Add metadata
    const quoteWithMeta = {
      ...quoteData,
      id: timestamp,
      created_at: new Date().toISOString(),
      status: 'draft'
    }

    // Save to file
    fs.writeFileSync(filepath, JSON.stringify(quoteWithMeta, null, 2))

    res.json({
      status: 'success',
      message: 'Báo giá đã được tạo thành công',
      data: {
        id: timestamp,
        filename,
        quote: quoteWithMeta
      }
    })

  } catch (error) {
    console.error('Error generating quote:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo báo giá',
      error: error.message
    })
  }
})

// GET /api/quote/list - List all quotes
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(generatedDir)
    const quotes = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const filepath = join(generatedDir, file)
          const content = fs.readFileSync(filepath, 'utf8')
          const quote = JSON.parse(content)
          return {
            id: quote.id,
            filename: file,
            ten_web: quote.ten_web,
            khach_hang: quote.khach_hang,
            chi_phi: quote.chi_phi,
            created_at: quote.created_at,
            status: quote.status || 'draft'
          }
        } catch (err) {
          console.error(`Error reading file ${file}:`, err)
          return null
        }
      })
      .filter(quote => quote !== null)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.json({
      status: 'success',
      data: quotes
    })

  } catch (error) {
    console.error('Error listing quotes:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách báo giá',
      error: error.message
    })
  }
})

// GET /api/quote/:id - Get specific quote
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const files = fs.readdirSync(generatedDir)
    const targetFile = files.find(file => file.includes(id))

    if (!targetFile) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy báo giá'
      })
    }

    const filepath = join(generatedDir, targetFile)
    const content = fs.readFileSync(filepath, 'utf8')
    const quote = JSON.parse(content)

    res.json({
      status: 'success',
      data: quote
    })

  } catch (error) {
    console.error('Error getting quote:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy báo giá',
      error: error.message
    })
  }
})

// DELETE /api/quote/:id - Delete quote
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const files = fs.readdirSync(generatedDir)
    const targetFile = files.find(file => file.includes(id))

    if (!targetFile) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy báo giá'
      })
    }

    const filepath = join(generatedDir, targetFile)
    fs.unlinkSync(filepath)

    res.json({
      status: 'success',
      message: 'Đã xóa báo giá thành công'
    })

  } catch (error) {
    console.error('Error deleting quote:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa báo giá',
      error: error.message
    })
  }
})

// POST /api/quote/export/docx - Export to DOCX
router.post('/export/docx', async (req, res) => {
  try {
    const quoteData = req.body
    
    if (!quoteData.ten_web || !quoteData.khach_hang) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên website và khách hàng là bắt buộc'
      })
    }

    const docxBuffer = await generateDOCX(quoteData)
    
    const filename = `bao_gia_${quoteData.ten_web.replace(/\s+/g, '_')}_${Date.now()}.docx`
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(docxBuffer)

  } catch (error) {
    console.error('Error exporting DOCX:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xuất file DOCX',
      error: error.message
    })
  }
})

// POST /api/quote/export/pdf - Export to PDF
router.post('/export/pdf', async (req, res) => {
  try {
    const quoteData = req.body
    
    if (!quoteData.ten_web || !quoteData.khach_hang) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên website và khách hàng là bắt buộc'
      })
    }

    const pdfBuffer = await generatePDF(quoteData)
    
    const filename = `bao_gia_${quoteData.ten_web.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)

  } catch (error) {
    console.error('Error exporting PDF:', error)
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xuất file PDF',
      error: error.message
    })
  }
})

export default router