import React from 'react'

const QuotePreview = ({ data }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '0'
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  const calculateAmount = (percent) => {
    const total = parseFloat(data.chi_phi) || 0
    return Math.round(total * (percent / 100))
  }

  const previewStyle = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '13px',
    lineHeight: '1.4',
    color: '#000',
    backgroundColor: '#fff',
    padding: '30px',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid #ddd'
  }

  const headerStyle = {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }

  const sectionTitleStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '20px'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '15px',
    fontSize: '12px'
  }

  const thStyle = {
    border: '1px solid #000',
    padding: '6px 8px',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '12px'
  }

  const tdStyle = {
    border: '1px solid #000',
    padding: '6px 8px',
    textAlign: 'left',
    fontSize: '12px'
  }

  const tdCenterStyle = {
    ...tdStyle,
    textAlign: 'center'
  }

  const redTextStyle = {
    color: '#d32f2f',
    fontWeight: 'bold'
  }

  const listStyle = {
    marginLeft: '20px',
    marginBottom: '10px'
  }

  return (
    <div className="card" style={{ border: '1px solid #eee', maxHeight: '90vh', overflow: 'hidden' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
        <h3 className="text-lg font-semibold">Preview Báo Giá</h3>
      </div>
      
      <div style={previewStyle}>
        <div style={headerStyle}>
          KẾ HOẠCH TRIỂN KHAI DỰ ÁN
        </div>

        {/* Thông tin dự án */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '5px 0' }}><strong>Dự án:</strong> Xây dựng website {data.ten_web || '{{ten_web}}'}</p>
          <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {data.khach_hang || '{{khach_hang}}'}</p>
          <p style={{ margin: '5px 0' }}><strong>Thực hiện:</strong> Misty Team (Đại diện: Bảo Nhật – Zalo: 0914960029)</p>
          <p style={{ margin: '5px 0' }}><strong>Ngôn ngữ & Công nghệ sử dụng:</strong> {data.cong_nghe || '{{cong_nghe}}'}</p>
          <p style={{ margin: '5px 0' }}>
            <strong>Tổng chi phí ước tính:</strong> <span style={redTextStyle}>{formatCurrency(data.chi_phi) || '{{chi_phi}}'}</span> (bao gồm {data.bao_gom || '{{bao_gom}}'}).
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Thời gian triển khai:</strong> {data.thoi_gian || '{{thoi_gian}}'} (thời gian chỉ là tương đối, phụ thuộc vào khối lượng công việc và phát sinh).
          </p>
        </div>

        <hr style={{ margin: '20px 0', border: '0.5px solid #000' }} />

        {/* 1. Mục tiêu dự án */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>1. MỤC TIÊU DỰ ÁN</div>
          <p style={{ margin: '8px 0' }}>Xây dựng website {data.ten_web || '{{ten_web}}'}, cho phép:</p>
          <ul style={listStyle}>
            {data.cho_phep.length > 0 ? (
              data.cho_phep.map((item, index) => (
                <li key={index} style={{ margin: '3px 0' }}>{item}.</li>
              ))
            ) : (
              <li style={{ margin: '3px 0' }}>{'{{cho_phep_1}}'}.</li>
            )}
          </ul>
          
          <p style={{ margin: '8px 0' }}>Các yêu cầu chính:</p>
          <ul style={listStyle}>
            {data.yeu_cau.length > 0 ? (
              data.yeu_cau.map((item, index) => (
                <li key={index} style={{ margin: '3px 0' }}>{item}.</li>
              ))
            ) : (
              <li style={{ margin: '3px 0' }}>{'{{yeu_cau_1}}'}.</li>
            )}
          </ul>
        </div>

        <hr style={{ margin: '20px 0', border: '0.5px solid #000' }} />

        {/* 2. Cấu trúc website */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>2. CẤU TRÚC WEBSITE</div>
          <p style={{ margin: '8px 0', fontSize: '12px', fontStyle: 'italic' }}>
            (Cấu trúc phía dưới là cấu trúc trang cơ bản, một vài trang có chứa các trang con khác)
          </p>
          
          <p style={{ margin: '10px 0', fontWeight: 'bold' }}>a. Người dùng</p>
          <ul style={listStyle}>
            {data.user.length > 0 ? (
              data.user.map((item, index) => (
                <li key={index} style={{ margin: '3px 0' }}>{item}.</li>
              ))
            ) : (
              <li style={{ margin: '3px 0' }}>{'{{user_1}}'}.</li>
            )}
          </ul>

          <p style={{ margin: '10px 0', fontWeight: 'bold' }}>b. Quản trị viên (Admin Panel)</p>
          <ul style={listStyle}>
            {data.admin.length > 0 ? (
              data.admin.map((item, index) => (
                <li key={index} style={{ margin: '3px 0' }}>{item}.</li>
              ))
            ) : (
              <li style={{ margin: '3px 0' }}>{'{{admin_1}}'}.</li>
            )}
          </ul>
        </div>

        <hr style={{ margin: '20px 0', border: '0.5px solid #000' }} />

        {/* 3. Thời gian triển khai */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>3. THỜI GIAN TRIỂN KHAI</div>
          <p style={{ margin: '8px 0' }}>Dự kiến: {data.thoi_gian_du_kien || '{{thoi_gian}}'}</p>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Giai đoạn</th>
                <th style={thStyle}>Nội dung công việc</th>
                <th style={thStyle}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdCenterStyle}>GĐ1</td>
                <td style={tdStyle}>Phân tích yêu cầu, thiết kế giao diện (UI/UX)</td>
                <td style={tdCenterStyle}>{data.gd1_time || '{{khoang_time_1}}'}</td>
              </tr>
              <tr>
                <td style={tdCenterStyle}>GĐ2</td>
                <td style={tdStyle}>Lập trình Frontend, giao diện người dùng</td>
                <td style={tdCenterStyle}>{data.gd2_time || '{{khoang_time_2}}'}</td>
              </tr>
              <tr>
                <td style={tdCenterStyle}>GĐ3</td>
                <td style={tdStyle}>Xây dựng Backend, API, ...</td>
                <td style={tdCenterStyle}>{data.gd3_time || '{{khoang_time_3}}'}</td>
              </tr>
              <tr>
                <td style={tdCenterStyle}>GĐ4</td>
                <td style={tdStyle}>Kiểm thử – tối ưu – cài đặt hosting – bàn giao</td>
                <td style={tdCenterStyle}>{data.gd4_time || '{{khoang_time_4}}'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Chi phí dự kiến */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>4. CHI PHÍ DỰ KIẾN</div>
          <p style={{ margin: '8px 0' }}>Tổng chi phí: <span style={redTextStyle}>{formatCurrency(data.chi_phi) || '{{chi_phi}}'}</span></p>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Đợt</th>
                <th style={thStyle}>Nội dung</th>
                <th style={thStyle}>Tỷ lệ</th>
                <th style={thStyle}>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdCenterStyle}>Đợt 1</td>
                <td style={tdStyle}>Khi bắt đầu dự án, sau khi duyệt giao diện cơ bản</td>
                <td style={tdCenterStyle}>{data.dot1_percent}%</td>
                <td style={tdCenterStyle}>
                  <span style={redTextStyle}>{formatCurrency(calculateAmount(data.dot1_percent))} đ</span>
                </td>
              </tr>
              <tr>
                <td style={tdCenterStyle}>Đợt 2</td>
                <td style={tdStyle}>Sau khi hoàn thiện frontend và phần backend của user</td>
                <td style={tdCenterStyle}>{data.dot2_percent}%</td>
                <td style={tdCenterStyle}>
                  <span style={redTextStyle}>{formatCurrency(calculateAmount(data.dot2_percent))} đ</span>
                </td>
              </tr>
              <tr>
                <td style={tdCenterStyle}>Đợt 3</td>
                <td style={tdStyle}>Sau khi hoàn thiện frontend và phần backend của admin, hoàn thiện, bàn giao</td>
                <td style={tdCenterStyle}>{data.dot3_percent}%</td>
                <td style={tdCenterStyle}>
                  <span style={redTextStyle}>{formatCurrency(calculateAmount(data.dot3_percent))} đ</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '15px' }}>
            <p style={{ ...redTextStyle, margin: '5px 0' }}>Thanh toán:</p>
            <ul style={{ ...redTextStyle, margin: '5px 0', paddingLeft: '20px' }}>
              <li style={{ margin: '2px 0' }}>Ngân hàng: MB BANK</li>
              <li style={{ margin: '2px 0' }}>STK: 0914960029006</li>
              <li style={{ margin: '2px 0' }}>Tên: LE VU BAO NHAT</li>
            </ul>
          </div>
        </div>

        {/* 5. Bàn giao */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>5. BÀN GIAO</div>
          <ul style={listStyle}>
            <li style={{ margin: '3px 0' }}>Source code đầy đủ (FE + BE + Admin).</li>
            <li style={{ margin: '3px 0' }}>File database + hướng dẫn cài đặt.</li>
            <li style={{ margin: '3px 0' }}>Tài liệu quản trị website.</li>
            <li style={{ margin: '3px 0' }}>Bảo hành {data.bao_hanh || '{{bao_hanh}}'} sau triển khai.</li>
          </ul>
        </div>

        {/* 6. Chi chú & cam kết */}
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>6. CHI CHÚ & CAM KẾT</div>
          <ul style={listStyle}>
            <li style={{ margin: '3px 0' }}>Website responsive, bảo mật cơ bản, tối ưu tốc độ.</li>
            <li style={{ margin: '3px 0' }}>Nội dung do khách hàng cung cấp.</li>
            <li style={{ margin: '3px 0' }}>Hỗ trợ bảo trì trong thời gian bảo hành, sửa lỗi phát sinh nếu có.</li>
            <li style={{ margin: '3px 0' }}>Có thể mở rộng chức năng sau này.</li>
          </ul>
          <p style={{ textAlign: 'center', color: '#d32f2f', fontStyle: 'italic', marginTop: '15px', fontSize: '14px' }}>
            <strong>Xin cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuotePreview