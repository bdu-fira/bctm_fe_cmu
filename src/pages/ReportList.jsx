import React from 'react';
import { useNavigate } from 'react-router-dom';

function ReportList({ reports, userId }) {
  const navigate = useNavigate();
  const userReports = reports.filter(r => r.userId === userId);

  return (
    <div style={{ padding: 20 }}>
      <h3>Danh sách báo cáo đã gửi</h3>
      <div style={{ display: 'flex', gap: 20 }}>
        {userReports.map((report) => (
          <div
            key={report.id}
            style={{
              border: '1px solid #ccc',
              padding: 10,
              width: 200,
              borderRadius: 4
            }}
          >
            <h4>{report.title}</h4>
            <p>Ngày tạo: {report.createdAt}</p>
            <p>
              <strong>Trạng thái: {report.status}</strong>
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate('/')}>Quay lại giao diện chính</button>
      </div>
    </div>
  );
}

export default ReportList;
