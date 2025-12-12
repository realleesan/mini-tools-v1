# Mini Tools Suite

Bộ công cụ modular hỗ trợ công việc sale với kiến trúc micro-modules.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Template Engine**: Handlebars
- **Database**: SQLite
- **Architecture**: Modular micro-modules

## Cấu trúc Project

```
mini-tools-suite/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Shared components
│   │   ├── modules/         # Tool modules
│   │   │   └── message-template/
│   │   └── pages/           # Main pages
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── database/        # Database setup
│   │   ├── modules/         # API modules
│   │   │   └── message-template/
│   │   └── server.js
└── package.json            # Root package.json
```

## Cài đặt và Chạy

1. **Cài đặt dependencies:**
```bash
npm run install:all
```

2. **Chạy development:**
```bash
npm run dev
```

3. **Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002

## Modules hiện tại

### 1. Message Template Tool
- Tạo tin nhắn trả lời khách hàng theo mẫu có sẵn
- Sử dụng Handlebars để render template với variables
- CRUD operations cho templates
- 3 mẫu có sẵn: chào hỏi, báo giá, theo dõi

## Thêm Module mới

1. **Frontend**: Tạo folder trong `frontend/src/modules/`
2. **Backend**: Tạo folder trong `backend/src/modules/`
3. **Database**: Thêm tables trong `backend/src/database/init.js`
4. **Routes**: Import routes mới vào `backend/src/server.js`
5. **Navigation**: Thêm link trong `frontend/src/components/Layout.jsx`

## API Endpoints

### Message Templates
- `GET /api/message-templates` - Lấy danh sách templates
- `GET /api/message-templates/:id` - Lấy template theo ID
- `POST /api/message-templates` - Tạo template mới
- `PUT /api/message-templates/:id` - Cập nhật template
- `DELETE /api/message-templates/:id` - Xóa template
- `POST /api/message-templates/generate` - Tạo tin nhắn từ template