import React from 'react'

const QuoteTemplate = ({ data }) => {
  const {
    ten_web = '',
    khach_hang = '',
    cong_nghe = '',
    chi_phi = '',
    bao_gom = '',
    thoi_gian = '',
    cho_phep_1 = '',
    yeu_cau_1 = '',
    user_1 = '',
    admin_1 = '',
    khoang_time_1 = '',
    khoang_time_2 = '',
    khoang_time_3 = '',
    khoang_time_4 = '',
    bao_hanh = ''
  } = data

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      fontFamily: '"Times New Roman", serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#000',
      backgroundColor: '#fff'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#d32f2f',
      textTransform: 'uppercase',
      marginBottom: '20px',
      borderBottom: '2px solid #000',
      paddingBottom: '10px'
    },
    section: {
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textTransform: 'uppercase'
    },
    infoRow: {
      marginBottom: '8px'
    },
    label: {
      fontWeight: 'bold'
    },
    value: {
      color: '#d32f2f',
      fontWeight: 'bold'
    },
    list: {
      paddingLeft: '20px',
      margin: '10px 0'
    },
    listItem: {
      marginBottom: '5px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '20px'
    },
    th: {
      border: '1px solid #000',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    td: {
      border: '1px solid #000',
      padding: '10px',
      textAlign: 'left'
    },
    tdCenter: {
      border: '1px solid #000',
      padding: '10px',
      textAlign: 'center'
    },
    redText: {
      color: '#d32f2f',
      fontWeight: 'bold'
    },
    paymentInfo: {
      backgroundColor: '#f9f9f9',
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '20px'
    },
    centerText: {
      textAlign: 'center',
      color: '#d32f2f',
      fontStyle: 'italic',
      marginTop: '20px'
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>KẾ HOẠCH TRIỂN KHAI DỰ ÁN</h1>
      </div>

      {/* Project Info */}
      <div style={styles.section}>
        <div style={styles.infoRow}>
          <span style={styles.label}>Dự án:</span> Xây dựng website <span style={styles.value}>{ten_web}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Khách hàng:</span> <span style={styles.value}>{khach_hang}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Thực hiện:</span> Misty Team (Đại diện: Bảo Nhật – Zalo: 0914960029)
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Ngôn ngữ & Công nghệ sử dụng:</span> <span style={styles.value}>{cong_nghe}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Tổng chi phí ước tính:</span> <span style={styles.value}>{chi_phi}</span> (bao gồm: <span style={styles.value}>{bao_gom}</span>).
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Thời gian triển khai:</span> <span style={styles.value}>{thoi_gian}</span> (thời gian chi là tương đối, phụ thuộc vào khối lượng công việc và phát sinh).
        </div>
      </div>

      {/* Section 1: Mục tiêu dự án */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>1. MỤC TIÊU DỰ ÁN</h2>
        <p>Xây dựng website <span style={styles.value}>{ten_web}</span>, cho phép:</p>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.value}>{cho_phep_1}</span>.</li>
          <li style={styles.listItem}>...</li>
        </ul>
        <p><span style={styles.label}>Các yêu cầu chính:</span></p>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.value}>{yeu_cau_1}</span>.</li>
          <li style={styles.listItem}>...</li>
        </ul>
      </div>

      {/* Section 2: Cấu trúc website */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>2. CẤU TRÚC WEBSITE</h2>
        <p>(Cấu trúc phía dưới là cấu trúc trang cơ bản, một vài trang có chứa các trang con khác)</p>
        
        <p><span style={styles.label}>a. Người dùng</span></p>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.value}>{user_1}</span>.</li>
          <li style={styles.listItem}>...</li>
        </ul>

        <p><span style={styles.label}>b. Quản trị viên (Admin Panel)</span></p>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.value}>{admin_1}</span>.</li>
          <li style={styles.listItem}>...</li>
        </ul>
      </div>

      {/* Section 3: Thời gian triển khai */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>3. THỜI GIAN TRIỂN KHAI</h2>
        <p><span style={styles.label}>Dự kiến:</span> <span style={styles.value}>{thoi_gian}</span></p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Giai đoạn</th>
              <th style={styles.th}>Nội dung công việc</th>
              <th style={styles.th}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.tdCenter}>GĐ1</td>
              <td style={styles.td}>Phân tích yêu cầu, thiết kế giao diện (UI/UX)</td>
              <td style={styles.tdCenter}><span style={styles.value}>{khoang_time_1}</span></td>
            </tr>
            <tr>
              <td style={styles.tdCenter}>GĐ2</td>
              <td style={styles.td}>Lập trình Frontend, giao diện người dùng</td>
              <td style={styles.tdCenter}><span style={styles.value}>{khoang_time_2}</span></td>
            </tr>
            <tr>
              <td style={styles.tdCenter}>GĐ3</td>
              <td style={styles.td}>Xây dựng Backend, API, ...</td>
              <td style={styles.tdCenter}><span style={styles.value}>{khoang_time_3}</span></td>
            </tr>
            <tr>
              <td style={styles.tdCenter}>GĐ4</td>
              <td style={styles.td}>Kiểm thử – tối ưu – cài đặt hosting – bàn giao</td>
              <td style={styles.tdCenter}><span style={styles.value}>{khoang_time_4}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Chi phí dự kiến */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>4. CHI PHÍ DỰ KIẾN</h2>
        <p><span style={styles.label}>Tổng chi phí:</span> <span style={styles.value}>{chi_phi}</span></p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Đợt</th>
              <th style={styles.th}>Nội dung</th>
              <th style={styles.th}>Tỷ lệ</th>
              <th style={styles.th}>Số tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.tdCenter}>Đợt 1</td>
              <td style={styles.td}>Khi bắt đầu dự án, sau khi duyệt giao diện cơ bản</td>
              <td style={styles.tdCenter}>30%</td>
              <td style={styles.tdCenter}>
                <span style={styles.value}>{chi_phi}</span><br />
                <span style={styles.redText}>* 0.3 đ</span>
              </td>
            </tr>
            <tr>
              <td style={styles.tdCenter}>Đợt 2</td>
              <td style={styles.td}>Sau khi hoàn thiện frontend và phần backend của user</td>
              <td style={styles.tdCenter}>40%</td>
              <td style={styles.tdCenter}>
                <span style={styles.value}>{chi_phi}</span><br />
                <span style={styles.redText}>* 0.4 đ</span>
              </td>
            </tr>
            <tr>
              <td style={styles.tdCenter}>Đợt 3</td>
              <td style={styles.td}>Sau khi hoàn thiện frontend và phần backend của admin, hoàn thiện, bàn giao</td>
              <td style={styles.tdCenter}>30%</td>
              <td style={styles.tdCenter}>
                <span style={styles.value}>{chi_phi}</span><br />
                <span style={styles.redText}>* 0.3 đ</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={styles.paymentInfo}>
          <p style={styles.redText}><strong>Thanh toán:</strong></p>
          <ul style={styles.list}>
            <li style={styles.listItem}><span style={styles.redText}>Ngân hàng: MB BANK</span></li>
            <li style={styles.listItem}><span style={styles.redText}>STK: 0914960029006</span></li>
            <li style={styles.listItem}><span style={styles.redText}>Tên: LE VU BAO NHAT</span></li>
          </ul>
        </div>
      </div>

      {/* Section 5: Bàn giao */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>5. BÀN GIAO</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>Source code đầy đủ (FE + BE + Admin).</li>
          <li style={styles.listItem}>File database + hướng dẫn cài đặt.</li>
          <li style={styles.listItem}>Tài liệu quản trị website.</li>
          <li style={styles.listItem}>Bảo hành <span style={styles.value}>{bao_hanh}</span> sau triển khai.</li>
        </ul>
      </div>

      {/* Section 6: Chú ý */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>6. CHÚ Ý & CAM KẾT</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>Website responsive, bảo mật cơ bản, tối ưu tốc độ.</li>
          <li style={styles.listItem}>Nội dung do khách hàng cung cấp.</li>
          <li style={styles.listItem}>Hỗ trợ bảo trì trong thời gian bảo hành, sửa lỗi phát sinh nếu có.</li>
          <li style={styles.listItem}>Có thể mở rộng chức năng sau này.</li>
        </ul>
        
        <div style={styles.centerText}>
          <p><em>Xin cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</em></p>
        </div>
      </div>
    </div>
  )
}

export default QuoteTemplate