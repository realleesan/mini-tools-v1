# Quote Generator - Hướng dẫn sử dụng

## Tổng quan
Tool Quote Generator cho phép tạo báo giá chuyên nghiệp từ template .docx có sẵn và xuất ra file .docx hoặc .pdf.

## Cách sử dụng

### 1. Tạo Quote Template
1. Click nút "New" trong sidebar Templates
2. Điền thông tin template:
   - **Template Name**: Tên template (VD: "Báo giá dịch vụ IT")
   - **Category**: Loại template (general, product, service, project)
   - **Template Fields**: Danh sách các trường dữ liệu

### 2. Cấu hình Fields
Mỗi field cần có:
- **Field name**: Tên biến (VD: `customerName`, `price`)
- **Field label**: Nhãn hiển thị (VD: "Tên khách hàng", "Giá")
- **Type**: Loại dữ liệu (text, number, date, textarea)
- **Required**: Bắt buộc hay không

### 3. Upload file .docx Template
1. Sau khi tạo template, click nút "Upload" 
2. Chọn file .docx có chứa placeholders
3. Placeholders phải có format: `{{fieldName}}`

### 4. Tạo báo giá
1. Chọn template từ sidebar
2. Điền thông tin vào các trường
3. Click "Generate DOCX" hoặc "Generate PDF"
4. Download file đã tạo

## Format Template .docx

### Placeholders
Sử dụng double curly braces cho placeholders:
```
{{customerName}} - Tên khách hàng
{{companyName}} - Tên công ty
{{price}} - Giá
{{date}} - Ngày
{{description}} - Mô tả
```

### Ví dụ template .docx:
```
BÁO GIÁ DỊCH VỤ

Ngày: {{date}}
Khách hàng: {{customerName}}
Công ty: {{companyName}}

Dịch vụ: {{serviceName}}
Mô tả: {{description}}
Giá: {{price}} VND

Có hiệu lực đến: {{validUntil}}

Trân trọng,
Công ty ABC
```

## Tính năng

### ✅ Đã hoàn thành:
- Tạo và quản lý quote templates
- Upload file .docx template
- Merge dữ liệu với template
- Generate file .docx
- Generate file .pdf
- Download files
- Lịch sử quotes đã tạo
- Validation dữ liệu đầu vào

### 🔄 Có thể mở rộng:
- Bulk quote generation
- Email integration
- Template sharing
- Advanced formatting
- Custom branding
- Quote approval workflow

## Cấu trúc thư mục

```
backend/src/modules/quote/
├── routes.js              # API endpoints
├── templates/             # Thư mục chứa .docx templates
│   └── README.md
└── generated/             # Thư mục chứa files đã generate
    └── README.md

frontend/src/modules/quote/
└── QuoteGenerator.jsx     # Component chính
```

## API Endpoints

- `GET /api/quote/templates` - Lấy danh sách templates
- `POST /api/quote/templates` - Tạo template mới
- `POST /api/quote/templates/:id/upload` - Upload file template
- `POST /api/quote/generate` - Generate quote
- `GET /api/quote/download/:quoteId` - Download file
- `GET /api/quote/history` - Lịch sử quotes
- `DELETE /api/quote/templates/:id` - Xóa template

## Dependencies

### Backend:
- `docxtemplater` - Xử lý .docx templates
- `pizzip` - Zip file handling
- `docx-pdf` - Convert .docx to .pdf
- `multer` - File upload handling

### Frontend:
- `axios` - HTTP client
- `react` - UI framework

## Lưu ý quan trọng

1. **File format**: Chỉ hỗ trợ .docx (không hỗ trợ .doc)
2. **Placeholder format**: Phải dùng `{{fieldName}}` (case-sensitive)
3. **File size**: Giới hạn 10MB cho file template
4. **Security**: Files được lưu trên server, cần implement cleanup job
5. **PDF conversion**: Có thể fail trên một số hệ thống, fallback về .docx

## Troubleshooting

### Lỗi thường gặp:
1. **"Template không tồn tại"**: Kiểm tra template đã được tạo và upload file
2. **"PDF conversion failed"**: Sử dụng .docx thay vì .pdf
3. **"Placeholder not found"**: Kiểm tra tên field khớp với placeholder trong .docx
4. **"File upload failed"**: Kiểm tra file format và size

### Debug:
- Kiểm tra console logs
- Verify file paths trong database
- Test với template đơn giản trước