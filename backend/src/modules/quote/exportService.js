import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx'
import htmlPdf from 'html-pdf-node'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Format currency for display
const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount)
}

// Calculate amount based on percentage
const calculateAmount = (total, percent) => {
  const totalAmount = parseFloat(total) || 0
  return Math.round(totalAmount * (percent / 100))
}

// Generate DOCX
export const generateDOCX = async (quoteData) => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: "KẾ HOẠCH TRIỂN KHAI DỰ ÁN",
                bold: true,
                size: 32,
                color: "d32f2f"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Project Info
          new Paragraph({
            children: [
              new TextRun({ text: "Dự án: ", bold: true }),
              new TextRun({ text: `Xây dựng website ${quoteData.ten_web || '{{ten_web}}'}` })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Khách hàng: ", bold: true }),
              new TextRun({ text: quoteData.khach_hang || '{{khach_hang}}' })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Thực hiện: ", bold: true }),
              new TextRun({ text: "Misty Team (Đại diện: Bảo Nhật – Zalo: 0914960029)" })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Ngôn ngữ & Công nghệ sử dụng: ", bold: true }),
              new TextRun({ text: quoteData.cong_nghe || '{{cong_nghe}}' })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tổng chi phí ước tính: ", bold: true }),
              new TextRun({ 
                text: `${formatCurrency(quoteData.chi_phi) || '{{chi_phi}}'} (bao gồm ${quoteData.bao_gom || '{{bao_gom}}'}).`,
                bold: true,
                color: "d32f2f"
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Thời gian triển khai: ", bold: true }),
              new TextRun({ text: `${quoteData.thoi_gian || '{{thoi_gian}}'} (thời gian chỉ là tương đối, phụ thuộc vào khối lượng công việc và phát sinh).` })
            ],
            spacing: { after: 400 }
          }),

          // Section 1: Mục tiêu dự án
          new Paragraph({
            children: [
              new TextRun({ text: "1. MỤC TIÊU DỰ ÁN", bold: true, size: 28 })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Xây dựng website ${quoteData.ten_web || '{{ten_web}}'}, cho phép:` })
            ],
            spacing: { after: 200 }
          }),

          // Cho phép list
          ...(quoteData.cho_phep && quoteData.cho_phep.length > 0 
            ? quoteData.cho_phep.map(item => 
                new Paragraph({
                  children: [new TextRun({ text: `• ${item}.` })],
                  spacing: { after: 100 }
                })
              )
            : [new Paragraph({
                children: [new TextRun({ text: "• {{cho_phep_1}}." })],
                spacing: { after: 100 }
              })]
          ),

          new Paragraph({
            children: [
              new TextRun({ text: "Các yêu cầu chính:" })
            ],
            spacing: { after: 200, before: 200 }
          }),

          // Yêu cầu list
          ...(quoteData.yeu_cau && quoteData.yeu_cau.length > 0 
            ? quoteData.yeu_cau.map(item => 
                new Paragraph({
                  children: [new TextRun({ text: `• ${item}.` })],
                  spacing: { after: 100 }
                })
              )
            : [new Paragraph({
                children: [new TextRun({ text: "• {{yeu_cau_1}}." })],
                spacing: { after: 100 }
              })]
          ),

          // Section 2: Cấu trúc website
          new Paragraph({
            children: [
              new TextRun({ text: "2. CẤU TRÚC WEBSITE", bold: true, size: 28 })
            ],
            spacing: { after: 200, before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: "(Cấu trúc phía dưới là cấu trúc trang cơ bản, một vài trang có chứa các trang con khác)",
                italics: true,
                size: 20
              })
            ],
            spacing: { after: 200 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "a. Người dùng", bold: true })
            ],
            spacing: { after: 200 }
          }),

          // User list
          ...(quoteData.user && quoteData.user.length > 0 
            ? quoteData.user.map(item => 
                new Paragraph({
                  children: [new TextRun({ text: `• ${item}.` })],
                  spacing: { after: 100 }
                })
              )
            : [new Paragraph({
                children: [new TextRun({ text: "• {{user_1}}." })],
                spacing: { after: 100 }
              })]
          ),

          new Paragraph({
            children: [
              new TextRun({ text: "b. Quản trị viên (Admin Panel)", bold: true })
            ],
            spacing: { after: 200, before: 200 }
          }),

          // Admin list
          ...(quoteData.admin && quoteData.admin.length > 0 
            ? quoteData.admin.map(item => 
                new Paragraph({
                  children: [new TextRun({ text: `• ${item}.` })],
                  spacing: { after: 100 }
                })
              )
            : [new Paragraph({
                children: [new TextRun({ text: "• {{admin_1}}." })],
                spacing: { after: 100 }
              })]
          ),

          // Section 3: Thời gian triển khai
          new Paragraph({
            children: [
              new TextRun({ text: "3. THỜI GIAN TRIỂN KHAI", bold: true, size: 28 })
            ],
            spacing: { after: 200, before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Dự kiến: " }),
              new TextRun({ text: quoteData.thoi_gian_du_kien || '{{thoi_gian}}' })
            ],
            spacing: { after: 200 }
          }),

          // Timeline Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Giai đoạn", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Nội dung công việc", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Thời gian", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "GĐ1" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Phân tích yêu cầu, thiết kế giao diện (UI/UX)" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: quoteData.gd1_time || '{{khoang_time_1}}' })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "GĐ2" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Lập trình Frontend, giao diện người dùng" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: quoteData.gd2_time || '{{khoang_time_2}}' })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "GĐ3" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Xây dựng Backend, API, ..." })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: quoteData.gd3_time || '{{khoang_time_3}}' })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "GĐ4" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Kiểm thử – tối ưu – cài đặt hosting – bàn giao" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: quoteData.gd4_time || '{{khoang_time_4}}' })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              })
            ]
          }),

          // Section 4: Chi phí dự kiến
          new Paragraph({
            children: [
              new TextRun({ text: "4. CHI PHÍ DỰ KIẾN", bold: true, size: 28 })
            ],
            spacing: { after: 200, before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tổng chi phí: " }),
              new TextRun({ 
                text: formatCurrency(quoteData.chi_phi) || '{{chi_phi}}',
                bold: true,
                color: "d32f2f"
              })
            ],
            spacing: { after: 200 }
          }),

          // Cost Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Đợt", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Nội dung", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Tỷ lệ", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Số tiền", bold: true })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "f0f0f0" }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Đợt 1" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Khi bắt đầu dự án, sau khi duyệt giao diện cơ bản" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${quoteData.dot1_percent || 30}%` })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: `${formatCurrency(calculateAmount(quoteData.chi_phi, quoteData.dot1_percent || 30))} đ`,
                        bold: true,
                        color: "d32f2f"
                      })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Đợt 2" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Sau khi hoàn thiện frontend và phần backend của user" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${quoteData.dot2_percent || 40}%` })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: `${formatCurrency(calculateAmount(quoteData.chi_phi, quoteData.dot2_percent || 40))} đ`,
                        bold: true,
                        color: "d32f2f"
                      })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Đợt 3" })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Sau khi hoàn thiện frontend và phần backend của admin, hoàn thiện, bàn giao" })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${quoteData.dot3_percent || 30}%` })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: `${formatCurrency(calculateAmount(quoteData.chi_phi, quoteData.dot3_percent || 30))} đ`,
                        bold: true,
                        color: "d32f2f"
                      })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              })
            ]
          }),

          // Payment info
          new Paragraph({
            children: [
              new TextRun({ text: "Thanh toán:", bold: true, color: "d32f2f" })
            ],
            spacing: { after: 200, before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Ngân hàng: MB BANK", bold: true, color: "d32f2f" })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• STK: 0914960029006", bold: true, color: "d32f2f" })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Tên: LE VU BAO NHAT", bold: true, color: "d32f2f" })
            ],
            spacing: { after: 400 }
          }),

          // Section 5: Bàn giao
          new Paragraph({
            children: [
              new TextRun({ text: "5. BÀN GIAO", bold: true, size: 28 })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Source code đầy đủ (FE + BE + Admin)." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• File database + hướng dẫn cài đặt." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Tài liệu quản trị website." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `• Bảo hành ${quoteData.bao_hanh || '{{bao_hanh}}'} sau triển khai.` })],
            spacing: { after: 400 }
          }),

          // Section 6: Chi chú & cam kết
          new Paragraph({
            children: [
              new TextRun({ text: "6. CHI CHÚ & CAM KẾT", bold: true, size: 28 })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Website responsive, bảo mật cơ bản, tối ưu tốc độ." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Nội dung do khách hàng cung cấp." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Hỗ trợ bảo trì trong thời gian bảo hành, sửa lỗi phát sinh nếu có." })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Có thể mở rộng chức năng sau này." })],
            spacing: { after: 400 }
          }),

          // Footer
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Xin cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!",
                bold: true,
                color: "d32f2f",
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 }
          })
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    return buffer

  } catch (error) {
    console.error('Error generating DOCX:', error)
    throw error
  }
}

// Generate PDF
export const generatePDF = async (quoteData) => {
  try {
    const htmlContent = generateHTMLContent(quoteData)
    
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    }

    const file = { content: htmlContent }
    const pdfBuffer = await htmlPdf.generatePdf(file, options)
    
    return pdfBuffer

  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

// Generate HTML content for PDF
const generateHTMLContent = (data) => {
  const formatListItems = (items, fallback) => {
    if (items && items.length > 0) {
      return items.map(item => `<li>${item}.</li>`).join('')
    }
    return `<li>${fallback}.</li>`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 13px;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #d32f2f;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          margin-top: 20px;
        }
        .red-text {
          color: #d32f2f;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        .text-center {
          text-align: center;
        }
        ul {
          margin-left: 20px;
          margin-bottom: 10px;
        }
        li {
          margin: 3px 0;
        }
        p {
          margin: 5px 0;
        }
        hr {
          margin: 20px 0;
          border: 0.5px solid #000;
        }
        .italic-note {
          font-size: 12px;
          font-style: italic;
        }
        .footer {
          text-align: center;
          color: #d32f2f;
          font-style: italic;
          margin-top: 15px;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">KẾ HOẠCH TRIỂN KHAI DỰ ÁN</div>

      <p><strong>Dự án:</strong> Xây dựng website ${data.ten_web || '{{ten_web}}'}</p>
      <p><strong>Khách hàng:</strong> ${data.khach_hang || '{{khach_hang}}'}</p>
      <p><strong>Thực hiện:</strong> Misty Team (Đại diện: Bảo Nhật – Zalo: 0914960029)</p>
      <p><strong>Ngôn ngữ & Công nghệ sử dụng:</strong> ${data.cong_nghe || '{{cong_nghe}}'}</p>
      <p><strong>Tổng chi phí ước tính:</strong> <span class="red-text">${formatCurrency(data.chi_phi) || '{{chi_phi}}'}</span> (bao gồm ${data.bao_gom || '{{bao_gom}}'}).</p>
      <p><strong>Thời gian triển khai:</strong> ${data.thoi_gian || '{{thoi_gian}}'} (thời gian chỉ là tương đối, phụ thuộc vào khối lượng công việc và phát sinh).</p>

      <hr>

      <div class="section-title">1. MỤC TIÊU DỰ ÁN</div>
      <p>Xây dựng website ${data.ten_web || '{{ten_web}}'}, cho phép:</p>
      <ul>
        ${formatListItems(data.cho_phep, '{{cho_phep_1}}')}
      </ul>
      
      <p>Các yêu cầu chính:</p>
      <ul>
        ${formatListItems(data.yeu_cau, '{{yeu_cau_1}}')}
      </ul>

      <hr>

      <div class="section-title">2. CẤU TRÚC WEBSITE</div>
      <p class="italic-note">(Cấu trúc phía dưới là cấu trúc trang cơ bản, một vài trang có chứa các trang con khác)</p>
      
      <p><strong>a. Người dùng</strong></p>
      <ul>
        ${formatListItems(data.user, '{{user_1}}')}
      </ul>

      <p><strong>b. Quản trị viên (Admin Panel)</strong></p>
      <ul>
        ${formatListItems(data.admin, '{{admin_1}}')}
      </ul>

      <hr>

      <div class="section-title">3. THỜI GIAN TRIỂN KHAI</div>
      <p>Dự kiến: ${data.thoi_gian_du_kien || '{{thoi_gian}}'}</p>

      <table>
        <thead>
          <tr>
            <th>Giai đoạn</th>
            <th>Nội dung công việc</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">GĐ1</td>
            <td>Phân tích yêu cầu, thiết kế giao diện (UI/UX)</td>
            <td class="text-center">${data.gd1_time || '{{khoang_time_1}}'}</td>
          </tr>
          <tr>
            <td class="text-center">GĐ2</td>
            <td>Lập trình Frontend, giao diện người dùng</td>
            <td class="text-center">${data.gd2_time || '{{khoang_time_2}}'}</td>
          </tr>
          <tr>
            <td class="text-center">GĐ3</td>
            <td>Xây dựng Backend, API, ...</td>
            <td class="text-center">${data.gd3_time || '{{khoang_time_3}}'}</td>
          </tr>
          <tr>
            <td class="text-center">GĐ4</td>
            <td>Kiểm thử – tối ưu – cài đặt hosting – bàn giao</td>
            <td class="text-center">${data.gd4_time || '{{khoang_time_4}}'}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">4. CHI PHÍ DỰ KIẾN</div>
      <p>Tổng chi phí: <span class="red-text">${formatCurrency(data.chi_phi) || '{{chi_phi}}'}</span></p>

      <table>
        <thead>
          <tr>
            <th>Đợt</th>
            <th>Nội dung</th>
            <th>Tỷ lệ</th>
            <th>Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">Đợt 1</td>
            <td>Khi bắt đầu dự án, sau khi duyệt giao diện cơ bản</td>
            <td class="text-center">${data.dot1_percent || 30}%</td>
            <td class="text-center">
              <span class="red-text">${formatCurrency(calculateAmount(data.chi_phi, data.dot1_percent || 30))} đ</span>
            </td>
          </tr>
          <tr>
            <td class="text-center">Đợt 2</td>
            <td>Sau khi hoàn thiện frontend và phần backend của user</td>
            <td class="text-center">${data.dot2_percent || 40}%</td>
            <td class="text-center">
              <span class="red-text">${formatCurrency(calculateAmount(data.chi_phi, data.dot2_percent || 40))} đ</span>
            </td>
          </tr>
          <tr>
            <td class="text-center">Đợt 3</td>
            <td>Sau khi hoàn thiện frontend và phần backend của admin, hoàn thiện, bàn giao</td>
            <td class="text-center">${data.dot3_percent || 30}%</td>
            <td class="text-center">
              <span class="red-text">${formatCurrency(calculateAmount(data.chi_phi, data.dot3_percent || 30))} đ</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="red-text"><strong>Thanh toán:</strong></p>
      <ul class="red-text">
        <li><strong>Ngân hàng:</strong> MB BANK</li>
        <li><strong>STK:</strong> 0914960029006</li>
        <li><strong>Tên:</strong> LE VU BAO NHAT</li>
      </ul>

      <div class="section-title">5. BÀN GIAO</div>
      <ul>
        <li>Source code đầy đủ (FE + BE + Admin).</li>
        <li>File database + hướng dẫn cài đặt.</li>
        <li>Tài liệu quản trị website.</li>
        <li>Bảo hành ${data.bao_hanh || '{{bao_hanh}}'} sau triển khai.</li>
      </ul>

      <div class="section-title">6. CHI CHÚ & CAM KẾT</div>
      <ul>
        <li>Website responsive, bảo mật cơ bản, tối ưu tốc độ.</li>
        <li>Nội dung do khách hàng cung cấp.</li>
        <li>Hỗ trợ bảo trì trong thời gian bảo hành, sửa lỗi phát sinh nếu có.</li>
        <li>Có thể mở rộng chức năng sau này.</li>
      </ul>
      
      <div class="footer">
        Xin cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
      </div>
    </body>
    </html>
  `
}