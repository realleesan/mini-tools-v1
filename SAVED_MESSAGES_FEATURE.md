# Tính Năng Saved Messages - Lưu Tin Nhắn Để Tái Sử Dụng

## 🎯 Mục Đích
Cho phép người dùng lưu lại các tin nhắn đã hoàn thành (với variables đã điền và có thể đã chỉnh sửa) để tái sử dụng sau này, giúp tiết kiệm thời gian và tăng hiệu quả công việc.

## ✨ Tính Năng Mới

### 1. **Nút "Save" trong Live Preview**
- Xuất hiện khi có message được tạo
- Cho phép lưu message hiện tại với tên tùy chỉnh
- Lưu cả variables đã điền và nội dung cuối cùng (kể cả đã chỉnh sửa)

### 2. **Nút "Saved" trong Sidebar**
- Mở modal hiển thị tất cả saved messages
- Hiển thị số lượng saved messages
- Giao diện thân thiện với preview nội dung

### 3. **Quản Lý Saved Messages**
- **Load**: Tải lại saved message vào workspace hiện tại
- **Delete**: Xóa saved message không cần thiết
- **Preview**: Xem trước nội dung trong danh sách

## 🔧 Cấu Trúc Kỹ Thuật

### Database Schema
```sql
CREATE TABLE saved_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- Tên do user đặt
  template_id INTEGER,                   -- ID của template gốc
  template_name TEXT NOT NULL,           -- Tên template (backup)
  variables TEXT NOT NULL,               -- JSON của variables đã điền
  final_message TEXT NOT NULL,           -- Nội dung cuối cùng
  category TEXT DEFAULT 'general',       -- Category của template
  industry TEXT DEFAULT 'general',       -- Industry của template
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### API Endpoints
- `GET /api/saved-messages` - Lấy danh sách saved messages
- `POST /api/saved-messages` - Tạo saved message mới
- `GET /api/saved-messages/:id` - Lấy chi tiết saved message
- `PUT /api/saved-messages/:id` - Cập nhật saved message
- `DELETE /api/saved-messages/:id` - Xóa saved message
- `POST /api/saved-messages/:id/load` - Load saved message vào workspace

### Frontend States
```javascript
const [savedMessages, setSavedMessages] = useState([])
const [showSavedMessages, setShowSavedMessages] = useState(false)
const [showSaveDialog, setShowSaveDialog] = useState(false)
const [saveDialogName, setSaveDialogName] = useState('')
```

## 🚀 Workflow Sử Dụng

### Lưu Message
1. Chọn template và điền variables
2. (Tùy chọn) Chỉnh sửa trong live preview
3. Nhấn nút "Save" 
4. Nhập tên cho saved message
5. Nhấn "Save Message"

### Tái Sử Dụng Saved Message
1. Nhấn nút "Saved" trong sidebar
2. Duyệt danh sách saved messages
3. Nhấn "Load" trên message muốn sử dụng
4. Message được tải vào workspace với:
   - Template được chọn
   - Variables đã điền sẵn
   - Preview hiển thị nội dung cuối cùng

## 💡 Lợi Ích

### Cho Người Dùng
- **Tiết kiệm thời gian**: Không cần điền lại variables cho các message tương tự
- **Tái sử dụng**: Lưu các message template hay dùng
- **Tùy chỉnh**: Có thể chỉnh sửa và lưu phiên bản đã tùy chỉnh
- **Tổ chức**: Quản lý các message theo tên dễ nhớ

### Cho Doanh Nghiệp
- **Chuẩn hóa**: Lưu các message chuẩn của công ty
- **Hiệu quả**: Tăng tốc độ phản hồi khách hàng
- **Chất lượng**: Đảm bảo tính nhất quán trong giao tiếp
- **Chia sẻ**: Có thể chia sẻ saved messages giữa các thành viên

## 🎨 UI/UX Features

### Save Dialog
- Modal đơn giản với input tên
- Auto-focus vào input field
- Validation tên không được trống
- Buttons với hover effects

### Saved Messages Modal
- Danh sách dạng card với preview
- Hiển thị metadata: template, category, industry
- Buttons Load và Delete với icons
- Empty state khi chưa có saved messages
- Responsive design

### Visual Indicators
- Badge hiển thị số lượng saved messages
- Color coding cho các loại buttons
- Hover effects và transitions mượt mà
- Icons phù hợp cho từng action

## 🔄 Tương Thích

### Với Tính Năng Hiện Tại
- Hoạt động với tất cả templates
- Tương thích với live preview và edit mode
- Không ảnh hưởng đến workflow hiện tại
- Có thể sử dụng độc lập hoặc kết hợp

### Mở Rộng Tương Lai
- Có thể thêm tags/labels cho saved messages
- Export/Import saved messages
- Chia sẻ saved messages giữa users
- Tìm kiếm và filter saved messages
- Backup và sync cloud

## 📊 Dữ Liệu Lưu Trữ

### Thông Tin Được Lưu
```json
{
  "id": 1,
  "name": "Welcome Email - Tech Client",
  "template_id": 5,
  "template_name": "Customer Greeting - Tech",
  "variables": {
    "customerName": "John Doe",
    "productName": "AI Solution",
    "salesName": "Alice"
  },
  "final_message": "Hello John Doe!\n\nThank you for your interest in our AI Solution...",
  "category": "greeting",
  "industry": "technology",
  "created_at": "2025-12-13T10:30:00Z"
}
```

### Backup Template Info
- Lưu `template_name` để hiển thị ngay cả khi template gốc bị xóa
- Lưu `category` và `industry` để filter và organize
- Lưu `template_id` để link back nếu template còn tồn tại

## 🎯 Kết Luận

Tính năng Saved Messages biến Message Templates từ một công cụ tạo tin nhắn thành một hệ thống quản lý tin nhắn hoàn chỉnh, giúp người dùng làm việc hiệu quả hơn và tái sử dụng công sức đã bỏ ra.