import React, { useState } from 'react';

const ReportDetailModal = ({ report, onClose, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleSubmitComment = () => {
   
    console.log(`Submitting comment for report ${report.id}: ${comment}`);
    setShowCommentForm(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h3>Chi tiết báo cáo</h3>
        
        <div className="report-detail-content">
          <h4>{report.title}</h4>
          <p><strong>Người gửi:</strong> {report.author}</p>
          <p><strong>Ngày gửi:</strong> {report.date}</p>
          <p><strong>Trạng thái:</strong> 
            <span className={`report-status ${report.status}`}>
              {report.status === 'pending' ? 'Chờ duyệt' : 
               report.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
            </span>
          </p>
          
          <div className="report-content-section">
            <h5>Nội dung báo cáo:</h5>
            <p>{report.content}</p>
          </div>
          
          {report.proposal && (
            <div className="report-proposal-section">
              <h5>Đề xuất:</h5>
              <p>{report.proposal}</p>
            </div>
          )}
          
          {report.comments && report.comments.length > 0 && (
            <div className="report-comments-section">
              <h5>Nhận xét:</h5>
              {report.comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <p className="comment-author">{comment.author} - {comment.date}</p>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
          
          {showCommentForm && (
            <div className="comment-form">
              <h5>Thêm nhận xét:</h5>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập nhận xét của bạn..."
                rows={4}
              />
              <div className="comment-form-actions">
                <button className="btn submit-btn" onClick={handleSubmitComment}>Gửi nhận xét</button>
                <button className="btn cancel-btn" onClick={() => setShowCommentForm(false)}>Hủy</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          {report.status === 'pending' && (
            <>
              <button className="btn approve-btn" onClick={onApprove}>Duyệt báo cáo</button>
              <button className="btn reject-btn" onClick={onReject}>Từ chối</button>
            </>
          )}
          {!showCommentForm && (
            <button className="btn comment-btn" onClick={() => setShowCommentForm(true)}>
              Thêm nhận xét
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;