import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-100 text-red-800 rounded-lg max-w-3xl mx-auto mt-4">
          <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
          <p>{this.state.error?.message || 'Không thể tải báo cáo. Vui lòng thử lại sau.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;