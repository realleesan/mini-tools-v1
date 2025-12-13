import express from 'express'
import { db } from '../../database/init.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import docxConverter from 'docx-pdf'
import { promisify } from 'util'
import multer from 'multer'
import mammoth from 'mammoth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const convertToPdf = promisify(docxConverter)

// Tạo thư mục cần thiết
const templatesDir = path.join(__dirname, 'templates')
const generatedDir = path.join(__dirname, 'generated')

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true })
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true })
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, templatesDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true)
    } else {
      cb(new Error('Only .docx files are allowed!'), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Lấy danh sách quote templates
router.get('/templates', (req, res) => {
  db.all("SELECT * FROM quote_templates ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Lấy template theo ID
router.get('/templates/:id', (req, res) => {
  const { id } = req.params
  db.get("SELECT * FROM quote_templates WHERE id = ?", [id], (err, row) => {
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

// Preview template với data
router.post('/templates/:id/preview', async (req, res) => {
  const { id } = req.params
  const { data } = req.body

  try {
    const template = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM quote_templates WHERE id = ?", [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
    
    if (!template) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }

    // Kiểm tra file template có tồn tại không
    const templatePath = path.join(templatesDir, template.template_path)
    if (!fs.existsSync(templatePath)) {
      res.status(404).json({ error: 'File template không tồn tại' })
      return
    }

    // Sử dụng mammoth để đọc .docx và convert sang HTML/text
    const result = await mammoth.extractRawText({ path: templatePath })
    let text = result.value
    
    // Thay thế placeholders với data
    let previewText = text
    if (data) {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        previewText = previewText.replace(regex, data[key] || `{{${key}}}`)
      })
    }

    // Nếu muốn HTML format thay vì plain text
    const htmlResult = await mammoth.convertToHtml({ path: templatePath })
    let htmlContent = htmlResult.value
    
    if (data) {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        htmlContent = htmlContent.replace(regex, data[key] || `{{${key}}}`)
      })
    }

    res.json({ 
      success: true,
      content: previewText,
      htmlContent: htmlContent,
      originalContent: text
    })

  } catch (error) {
    console.error('Preview generation error:', error)
    res.status(500).json({ error: 'Lỗi khi tạo preview: ' + error.message })
  }

})

// Tạo báo giá từ template
router.post('/generate', async (req, res) => {
  const { templateId, quoteData, format = 'docx' } = req.body

  console.log('Generate quote request:', { templateId, quoteData, format })

  if (!templateId || !quoteData) {
    res.status(400).json({ error: 'Template ID và dữ liệu báo giá là bắt buộc' })
    return
  }

  try {
    // Lấy thông tin template
    const template = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM quote_templates WHERE id = ?", [templateId], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })

    if (!template) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }

    // Đọc file template .docx
    const templatePath = path.join(templatesDir, template.template_path)
    console.log('Template path:', templatePath)
    console.log('File exists:', fs.existsSync(templatePath))
    
    if (!fs.existsSync(templatePath)) {
      res.status(404).json({ error: 'File template không tồn tại' })
      return
    }

    // Parse template fields trước - dùng cho cả success và fallback
    const templateFields = JSON.parse(template.fields)
    const completeData = {}
    
    templateFields.forEach(field => {
      completeData[field.name] = quoteData[field.name] || `[${field.label}]`
    })
    
    console.log('Quote data keys:', Object.keys(quoteData))
    console.log('Template fields:', template.fields)
    console.log('Complete data:', completeData)

    // Kiểm tra xem có phải file text template không
    const isTextTemplate = template.template_path.endsWith('.txt')
    
    if (isTextTemplate) {
      // Xử lý text template
      console.log('Processing text template...')
      const textContent = fs.readFileSync(templatePath, 'utf8')
      
      // Replace placeholders
      let processedContent = textContent
      templateFields.forEach(field => {
        const regex = new RegExp(`\\{\\{${field.name}\\}\\}`, 'g')
        processedContent = processedContent.replace(regex, completeData[field.name] || `[${field.label}]`)
      })
      
      // Tạo file output
      const timestamp = Date.now()
      const fileName = `quote_${templateId}_${timestamp}.txt`
      const outputPath = path.join(generatedDir, fileName)
      
      fs.writeFileSync(outputPath, processedContent, 'utf8')
      
      // Lưu vào database
      const quoteId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO quotes (template_id, customer_name, quote_data, file_path, format) VALUES (?, ?, ?, ?, ?)",
          [templateId, completeData.customerName || 'Unknown', JSON.stringify(completeData), fileName, 'txt'],
          function(err) {
            if (err) reject(err)
            else resolve(this.lastID)
          }
        )
      })

      res.json({
        success: true,
        quoteId,
        fileName: fileName,
        downloadUrl: `/api/quote/download/${quoteId}`,
        format: 'txt'
      })
      return
    }

    try {
      const content = fs.readFileSync(templatePath, 'binary')
      const zip = new PizZip(content)
      
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        errorLogging: true
      })
      
      doc.setData(completeData)
      doc.render()
      
    } catch (docxError) {
      console.error('Docxtemplater error:', docxError)
      
      // Template docx bị lỗi, tạo file text thay thế
      console.log('Template docx has errors, generating text file instead...')
      
      let textContent = `QUOTE DOCUMENT\n\nTemplate: ${template.name}\nDate: ${new Date().toLocaleDateString()}\n\n`
      
      templateFields.forEach(field => {
        const value = quoteData[field.name] || '[Not provided]'
        textContent += `${field.label}: ${value}\n`
      })
      
      textContent += `\n---\nGenerated by Quote Generator\n\nNote: Original .docx template has formatting errors. Please upload a new template file.`
      
      // Tạo file text
      const timestamp = Date.now()
      const fileName = `quote_${templateId}_${timestamp}.txt`
      const textPath = path.join(generatedDir, fileName)
      
      fs.writeFileSync(textPath, textContent, 'utf8')
      
      // Lưu thông tin quote vào database
      const quoteId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO quotes (template_id, customer_name, quote_data, file_path, format) VALUES (?, ?, ?, ?, ?)",
          [templateId, completeData.customerName || completeData.khach_hang || 'Unknown', JSON.stringify(completeData), fileName, 'txt'],
          function(err) {
            if (err) reject(err)
            else resolve(this.lastID)
          }
        )
      })

      res.json({
        success: true,
        quoteId,
        fileName: fileName,
        downloadUrl: `/api/quote/download/${quoteId}`,
        format: 'txt',
        message: 'Generated as text file - please upload a new .docx template'
      })
      return
    }

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    // Tạo tên file unique
    const timestamp = Date.now()
    const fileName = `quote_${templateId}_${timestamp}`
    const docxPath = path.join(generatedDir, `${fileName}.docx`)

    // Lưu file .docx
    fs.writeFileSync(docxPath, buf)

    let finalPath = docxPath
    let mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    // Convert sang PDF nếu cần
    if (format === 'pdf') {
      const pdfPath = path.join(generatedDir, `${fileName}.pdf`)
      try {
        await convertToPdf(docxPath, pdfPath)
        finalPath = pdfPath
        mimeType = 'application/pdf'
      } catch (pdfError) {
        console.error('PDF conversion error:', pdfError)
        // Fallback to docx if PDF conversion fails
      }
    }

    // Lưu thông tin quote vào database
    const quoteId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO quotes (template_id, customer_name, quote_data, file_path, format) VALUES (?, ?, ?, ?, ?)",
        [templateId, quoteData.customerName || 'Unknown', JSON.stringify(quoteData), path.basename(finalPath), format],
        function(err) {
          if (err) reject(err)
          else resolve(this.lastID)
        }
      )
    })

    res.json({
      success: true,
      quoteId,
      fileName: path.basename(finalPath),
      downloadUrl: `/api/quote/download/${quoteId}`,
      format: path.extname(finalPath).substring(1)
    })

  } catch (error) {
    console.error('Quote generation error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      properties: error.properties
    })
    
    // Log individual errors if it's a multi_error
    if (error.properties && error.properties.errors) {
      console.error('Individual errors:')
      error.properties.errors.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, {
          message: err.message,
          properties: err.properties
        })
      })
    }
    
    res.status(500).json({ error: 'Lỗi khi tạo báo giá: ' + error.message })
  }
})

// Download file báo giá
router.get('/download/:quoteId', (req, res) => {
  const { quoteId } = req.params

  db.get("SELECT * FROM quotes WHERE id = ?", [quoteId], (err, quote) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (!quote) {
      res.status(404).json({ error: 'Báo giá không tồn tại' })
      return
    }

    const filePath = path.join(generatedDir, quote.file_path)
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File không tồn tại' })
      return
    }

    const ext = path.extname(quote.file_path).substring(1)
    const mimeType = ext === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${quote.file_path}"`)
    
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  })
})

// Lấy danh sách quotes đã tạo
router.get('/history', (req, res) => {
  db.all(`
    SELECT q.*, qt.name as template_name 
    FROM quotes q 
    LEFT JOIN quote_templates qt ON q.template_id = qt.id 
    ORDER BY q.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Tạo template mới từ file upload
router.post('/templates/upload', upload.single('template'), async (req, res) => {
  const { name, category = 'general' } = req.body
  
  if (!name) {
    res.status(400).json({ error: 'Tên template là bắt buộc' })
    return
  }

  if (!req.file) {
    res.status(400).json({ error: 'Vui lòng upload file .docx' })
    return
  }

  try {
    // Đọc file và tìm placeholders
    const result = await mammoth.extractRawText({ path: req.file.path })
    const text = result.value
    
    // Tìm tất cả placeholders {{fieldName}} với regex cải thiện
    const placeholderMatches = text.match(/\{\{([^}]+)\}\}/g) || []
    const uniquePlaceholders = [...new Set(placeholderMatches)]
    
    console.log('Found placeholders:', uniquePlaceholders)
    console.log('Text content:', text.substring(0, 500) + '...')
    
    // Tạo fields từ placeholders
    let fields = uniquePlaceholders.map(placeholder => {
      const fieldName = placeholder.replace(/\{\{|\}\}/g, '').trim()
      return {
        name: fieldName,
        label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1'),
        type: 'text',
        required: true
      }
    })
    
    // Nếu không tìm thấy placeholders, để trống để user tự thêm fields
    if (fields.length === 0) {
      console.log('No placeholders found, template will start empty')
    }

    // Lưu vào database
    db.run(
      "INSERT INTO quote_templates (name, template_path, fields, category) VALUES (?, ?, ?, ?)",
      [name, req.file.filename, JSON.stringify(fields), category],
      function(err) {
        if (err) {
          // Xóa file nếu lưu database thất bại
          fs.unlinkSync(req.file.path)
          res.status(500).json({ error: err.message })
          return
        }
        
        res.json({ 
          id: this.lastID,
          name,
          fields,
          placeholders: uniquePlaceholders,
          message: `Template đã được tạo với ${fields.length} fields tự động`
        })
      }
    )

  } catch (error) {
    // Xóa file nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    console.error('Error processing template:', error)
    res.status(500).json({ error: 'Lỗi khi xử lý file template: ' + error.message })
  }
})

// Tạo template mới (legacy - cho edit)
router.post('/templates', (req, res) => {
  const { name, fields, category = 'general' } = req.body
  
  if (!name || !fields) {
    res.status(400).json({ error: 'Tên template và danh sách fields là bắt buộc' })
    return
  }

  // Template path sẽ được set sau khi upload file
  const templatePath = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.docx`

  db.run(
    "INSERT INTO quote_templates (name, template_path, fields, category) VALUES (?, ?, ?, ?)",
    [name, templatePath, JSON.stringify(fields), category],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ 
        id: this.lastID,
        templatePath,
        message: 'Template đã được tạo thành công'
      })
    }
  )
})

// Upload template file
router.post('/templates/:id/upload', upload.single('template'), async (req, res) => {
  const { id } = req.params
  
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  try {
    // Test the uploaded docx file
    const content = fs.readFileSync(req.file.path, 'binary')
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })
    
    // Try to extract placeholders
    const result = await mammoth.extractRawText({ path: req.file.path })
    const text = result.value
    const placeholderMatches = text.match(/\{\{([^}]+)\}\}/g) || []
    const uniquePlaceholders = [...new Set(placeholderMatches)]
    
    console.log('Found placeholders in new template:', uniquePlaceholders)
    
    // Update template path in database
    db.run(
      "UPDATE quote_templates SET template_path = ? WHERE id = ?",
      [req.file.filename, id],
      function(err) {
        if (err) {
          fs.unlinkSync(req.file.path)
          res.status(500).json({ error: err.message })
          return
        }
        
        if (this.changes === 0) {
          fs.unlinkSync(req.file.path)
          res.status(404).json({ error: 'Template không tồn tại' })
          return
        }

        res.json({ 
          message: 'Template file uploaded and validated successfully',
          filename: req.file.filename,
          placeholders: uniquePlaceholders
        })
      }
    )
    
  } catch (error) {
    // Delete file if validation fails
    fs.unlinkSync(req.file.path)
    console.error('Template validation error:', error)
    res.status(400).json({ 
      error: 'Invalid .docx template file. Please check for formatting errors.',
      details: error.message
    })
  }
})

// Xóa quote
router.delete('/:id', (req, res) => {
  const { id } = req.params
  
  // Lấy thông tin quote trước khi xóa
  db.get("SELECT * FROM quotes WHERE id = ?", [id], (err, quote) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (!quote) {
      res.status(404).json({ error: 'Quote không tồn tại' })
      return
    }

    // Xóa file đã generate
    const filePath = path.join(generatedDir, quote.file_path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Xóa record trong database
    db.run("DELETE FROM quotes WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ message: 'Quote đã được xóa' })
    })
  })
})

// Cập nhật template
router.put('/templates/:id', (req, res) => {
  const { id } = req.params
  const { name, fields, category } = req.body
  
  if (!name || !fields) {
    res.status(400).json({ error: 'Tên template và danh sách fields là bắt buộc' })
    return
  }

  db.run(
    "UPDATE quote_templates SET name = ?, fields = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, JSON.stringify(fields), category, id],
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

// Tạo template mới với file docx sạch
router.post('/templates/create-clean', (req, res) => {
  const { name = 'Simple Quote Template', category = 'general' } = req.body
  
  // Tạo basic fields cho template sạch
  const basicFields = [
    { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
    { name: 'companyName', label: 'Company Name', type: 'text', required: true },
    { name: 'projectName', label: 'Project Name', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'validUntil', label: 'Valid Until', type: 'date', required: true }
  ]
  
  // Tạo simple docx content
  const simpleDocxContent = `
QUOTE DOCUMENT

Customer: {{customerName}}
Company: {{companyName}}
Project: {{projectName}}
Price: {{price}}
Valid Until: {{validUntil}}

Description:
{{description}}

---
Generated by Quote Generator
`
  
  // Tạo file text tạm thời (sẽ work như docx đơn giản)
  const timestamp = Date.now()
  const fileName = `simple_template_${timestamp}.txt`
  const filePath = path.join(templatesDir, fileName)
  
  fs.writeFileSync(filePath, simpleDocxContent, 'utf8')
  
  db.run(
    "INSERT INTO quote_templates (name, template_path, fields, category) VALUES (?, ?, ?, ?)",
    [name, fileName, JSON.stringify(basicFields), category],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ 
        id: this.lastID,
        name,
        fields: basicFields,
        message: 'Simple template created successfully!',
        templatePath: fileName
      })
    }
  )
})

// Xóa template
router.delete('/templates/:id', (req, res) => {
  const { id } = req.params
  
  // Lấy thông tin template trước khi xóa
  db.get("SELECT * FROM quote_templates WHERE id = ?", [id], (err, template) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (!template) {
      res.status(404).json({ error: 'Template không tồn tại' })
      return
    }

    // Xóa file template
    const templatePath = path.join(templatesDir, template.template_path)
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath)
    }

    // Xóa record trong database
    db.run("DELETE FROM quote_templates WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ message: 'Template đã được xóa' })
    })
  })
})

export default router