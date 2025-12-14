import React, { useState } from 'react'
import QuotePreview from './QuotePreview'

const QuoteGenerator = () => {
  const [formData, setFormData] = useState({
    // Thông tin dự án
    ten_web: '',
    khach_hang: '',
    cong_nghe: '',
    chi_phi: '',
    bao_gom: '',
    thoi_gian: '',
    
    // Mục tiêu dự án
    cho_phep: [],
    yeu_cau: [],
    
    // Cấu trúc website
    user: [],
    admin: [],
    
    // Thời gian triển khai
    thoi_gian_du_kien: '',
    
    // Giai đoạn công việc
    gd1_time: '',
    gd2_time: '',
    gd3_time: '',
    gd4_time: '',
    
    // Chi phí dự kiến
    dot1_percent: 30,
    dot2_percent: 40,
    dot3_percent: 30,
    
    // Bàn giao
    bao_hanh: ''
  })

  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSaveQuote = async () => {
    if (!formData.ten_web || !formData.khach_hang) {
      alert('Vui lòng nhập tên website và khách hàng')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/quote/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        alert('Báo giá đã được lưu thành công!')
        console.log('Saved quote:', result.data)
      } else {
        alert('Lỗi: ' + result.message)
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Lỗi khi lưu báo giá: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExportDOCX = async () => {
    if (!formData.ten_web || !formData.khach_hang) {
      alert('Vui lòng nhập tên website và khách hàng trước khi xuất file')
      return
    }

    setExporting(true)
    try {
      const response = await fetch('/api/quote/export/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bao_gia_${formData.ten_web.replace(/\s+/g, '_')}_${Date.now()}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('Xuất file DOCX thành công!')
      } else {
        const error = await response.json()
        alert('Lỗi: ' + error.message)
      }
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      alert('Lỗi khi xuất file DOCX: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!formData.ten_web || !formData.khach_hang) {
      alert('Vui lòng nhập tên website và khách hàng trước khi xuất file')
      return
    }

    setExporting(true)
    try {
      const response = await fetch('/api/quote/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bao_gia_${formData.ten_web.replace(/\s+/g, '_')}_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        alert('Xuất file PDF thành công!')
      } else {
        const error = await response.json()
        alert('Lỗi: ' + error.message)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Lỗi khi xuất file PDF: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Form Input */}
        <div className="flex-1">
          <div className="card" style={{ border: '1px solid #eee' }}>
            <h2 className="text-xl font-bold mb-6">Tạo Báo Giá Website</h2>
            
            {/* Thông tin cơ bản */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin dự án</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên website</label>
                  <input
                    type="text"
                    value={formData.ten_web}
                    onChange={(e) => handleInputChange('ten_web', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Nhập tên website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Khách hàng</label>
                  <input
                    type="text"
                    value={formData.khach_hang}
                    onChange={(e) => handleInputChange('khach_hang', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Tên khách hàng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Công nghệ sử dụng</label>
                  <input
                    type="text"
                    value={formData.cong_nghe}
                    onChange={(e) => handleInputChange('cong_nghe', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="VD: React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tổng chi phí (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.chi_phi}
                    onChange={(e) => handleInputChange('chi_phi', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Bao gồm</label>
                  <textarea
                    value={formData.bao_gom}
                    onChange={(e) => handleInputChange('bao_gom', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded h-20"
                    placeholder="Mô tả những gì bao gồm trong báo giá"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thời gian triển khai</label>
                  <input
                    type="text"
                    value={formData.thoi_gian}
                    onChange={(e) => handleInputChange('thoi_gian', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="VD: 4-6 tuần"
                  />
                </div>
              </div>
            </div>

            {/* Mục tiêu dự án */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">1. Mục tiêu dự án</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Cho phép</label>
                {formData.cho_phep.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('cho_phep', index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      placeholder="Nhập chức năng cho phép"
                    />
                    <button
                      onClick={() => removeArrayItem('cho_phep', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('cho_phep')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Thêm chức năng
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Yêu cầu chính</label>
                {formData.yeu_cau.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('yeu_cau', index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      placeholder="Nhập yêu cầu chính"
                    />
                    <button
                      onClick={() => removeArrayItem('yeu_cau', index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('yeu_cau')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Thêm yêu cầu
                </button>
              </div>
            </div>

            {/* Cấu trúc website */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">2. Cấu trúc website</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Người dùng</label>
                  {formData.user.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('user', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Chức năng người dùng"
                      />
                      <button
                        onClick={() => removeArrayItem('user', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('user')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    + Thêm chức năng user
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quản trị viên (Admin Panel)</label>
                  {formData.admin.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('admin', index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Chức năng admin"
                      />
                      <button
                        onClick={() => removeArrayItem('admin', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('admin')}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    + Thêm chức năng admin
                  </button>
                </div>
              </div>
            </div>

            {/* Thời gian triển khai */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">3. Thời gian triển khai</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dự kiến</label>
                  <input
                    type="text"
                    value={formData.thoi_gian_du_kien}
                    onChange={(e) => handleInputChange('thoi_gian_du_kien', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="VD: 4-6 tuần"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-3">Giai đoạn công việc</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">GĐ1: Phân tích yêu cầu, thiết kế giao diện (UI/UX)</label>
                    <input
                      type="text"
                      value={formData.gd1_time}
                      onChange={(e) => handleInputChange('gd1_time', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="VD: 1 tuần"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">GĐ2: Lập trình Frontend, giao diện người dùng</label>
                    <input
                      type="text"
                      value={formData.gd2_time}
                      onChange={(e) => handleInputChange('gd2_time', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="VD: 2 tuần"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">GĐ3: Xây dựng Backend, API, ...</label>
                    <input
                      type="text"
                      value={formData.gd3_time}
                      onChange={(e) => handleInputChange('gd3_time', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="VD: 2 tuần"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">GĐ4: Kiểm thử – tối ưu – cài đặt hosting – bàn giao</label>
                    <input
                      type="text"
                      value={formData.gd4_time}
                      onChange={(e) => handleInputChange('gd4_time', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="VD: 1 tuần"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chi phí dự kiến */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">4. Chi phí dự kiến</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đợt 1 (%)</label>
                  <input
                    type="number"
                    value={formData.dot1_percent}
                    onChange={(e) => handleInputChange('dot1_percent', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Đợt 2 (%)</label>
                  <input
                    type="number"
                    value={formData.dot2_percent}
                    onChange={(e) => handleInputChange('dot2_percent', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Đợt 3 (%)</label>
                  <input
                    type="number"
                    value={formData.dot3_percent}
                    onChange={(e) => handleInputChange('dot3_percent', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Bàn giao */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">5. Bàn giao</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Bảo hành</label>
                <input
                  type="text"
                  value={formData.bao_hanh}
                  onChange={(e) => handleInputChange('bao_hanh', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="VD: 6 tháng"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={saving || exporting}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu Báo Giá'}
              </button>
              <button
                onClick={handleExportDOCX}
                disabled={saving || exporting}
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {exporting ? 'Đang xuất...' : 'Xuất DOCX'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={saving || exporting}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {exporting ? 'Đang xuất...' : 'Xuất PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="flex-1">
            <QuotePreview data={formData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteGenerator