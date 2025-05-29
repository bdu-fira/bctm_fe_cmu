import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineController,
} from 'chart.js';
import {
  FaTimes,
  FaSearch,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaPlus,
} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/logo-trg.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, LineController);


class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Đã xảy ra lỗi khi hiển thị thống kê.</p>
          <p>Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = {
  PENDING: 'pending-reports',
  APPROVED: 'approved-reports',
  REJECTED: 'rejected-reports',
  STATS: 'department-stats',
};


const getWeekRange = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const firstDayOfYear = new Date(year, 0, 1);
  const days = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);

  const startOfWeek = new Date(date);
  startOfWeek.setDate(day - date.getDay() + (date.getDay() === 0 ? -6 : 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatViDate = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  return {
    year,
    weekNumber,
    range: `Tuần ${weekNumber}: ${formatViDate(startOfWeek)} - ${formatViDate(endOfWeek)}`,
    key: `${year}-W${weekNumber}`,
    startDate: startOfWeek,
  };
};


const Sidebar = ({ activeTab, setActiveTab, stats, isOpen, toggleSidebar }) => (
  <div
    className={`w-72 bg-white shadow-xl h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out md:static fixed top-0 left-0 z-30`}
  >
    <div className="p-5 bg-orange-500 flex items-center space-x-3">
      <img src={logo} alt="BDU Logo" className="w-10 h-10 rounded-full" />
      <h2 className="text-xl font-semibold text-white">BDU Smart Reports</h2>
    </div>
    <nav className="mt-4">
      {[
        { id: TABS.PENDING, label: 'Báo cáo chờ duyệt', count: stats.pending },
        { id: TABS.APPROVED, label: 'Báo cáo đã duyệt', count: stats.approved },
        { id: TABS.REJECTED, label: 'Báo cáo từ chối', count: stats.rejected },
        { id: TABS.STATS, label: 'Thống kê đơn vị', count: null },
      ].map((tab) => (
        <button
          key={tab.id}
          className={`w-full text-left py-3 px-6 flex items-center justify-between text-sm font-medium ${activeTab === tab.id
              ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            } transition-all duration-200`}
          onClick={() => {
            setActiveTab(tab.id);
            toggleSidebar();
          }}
        >
          <span>{tab.label}</span>
          {tab.count > 0 && (
            <span className="bg-orange-500 text-white py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
          )}
        </button>
      ))}
    </nav>
  </div>
);

// Header Component
const Header = ({ userInfo, openUserModal, handleLogout, toggleSidebar }) => (
  <header className="bg-orange-500 text-white p-5 flex justify-between items-center shadow-lg sticky top-0 z-20">
    <div className="flex items-center space-x-3">
      <button onClick={toggleSidebar} className="md:hidden text-white focus:outline-none">
        <FaBars className="w-6 h-6" />
      </button>
    </div>
    <div className="flex items-center space-x-3">
      <button
        onClick={openUserModal}
        className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
      >
        <FaUser className="mr-2 h-5 w-5" />
        {userInfo.tenGiangVien || 'Không xác định'}
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
      >
        <FiLogOut className="mr-2 h-5 w-5" />
        Đăng xuất
      </button>
    </div>
  </header>
);

// UserModal Component
const UserModal = ({ isOpen, closeModal, userInfo }) =>
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 hover:text-orange-500 transition-all duration-300"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold text-orange-500 mb-6">Thông tin người dùng</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-semibold text-orange-500">Họ và tên:</span> {userInfo.tenGiangVien}
          </p>
          <p>
            <span className="font-semibold text-orange-500">Chức vụ:</span> {userInfo.chucVu}
          </p>
          <p>
            <span className="font-semibold text-orange-500">Đơn vị:</span> {userInfo.tenDonVi}
          </p>
          <p>
            <span className="font-semibold text-orange-500">Vai trò:</span> {userInfo.vaiTro}
          </p>
        </div>
        <button
          onClick={closeModal}
          className="mt-6 w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition-all duration-300"
        >
          Đóng
        </button>
      </div>
    </div>
  );

// ReportList Component
const ReportList = ({ reports, activeTab, handleViewReport, handleApproveReport, handleRejectReport }) => {
  const statusConfig = {
    [TABS.PENDING]: { label: 'Chờ duyệt', bg: 'bg-orange-100', text: 'text-orange-800' },
    [TABS.APPROVED]: { label: 'Đã duyệt', bg: 'bg-green-100', text: 'text-green-800' },
    [TABS.REJECTED]: { label: 'Từ chối', bg: 'bg-red-100', text: 'text-red-800' },
  };

  const [expandedWeeks, setExpandedWeeks] = useState({});
  const groupedReports = reports.reduce((acc, report) => {
    const { key, range } = getWeekRange(report.date);
    if (!acc[key]) {
      acc[key] = { range, reports: [] };
    }
    acc[key].reports.push(report);
    return acc;
  }, {});

  const toggleWeek = (weekKey) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">{statusConfig[activeTab].label}</h3>
      <div className="space-y-6">
        {Object.keys(groupedReports).length > 0 ? (
          Object.entries(groupedReports)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([weekKey, { range, reports }]) => (
              <div key={weekKey} className="bg-white rounded-xl shadow-sm border border-orange-100">
                <button
                  className="w-full flex justify-between items-center p-4 text-left bg-orange-50 hover:bg-orange-100 transition-all duration-300"
                  onClick={() => toggleWeek(weekKey)}
                >
                  <h4 className="text-lg font-semibold text-orange-600">
                    {range} ({reports.length} báo cáo)
                  </h4>
                  {expandedWeeks[weekKey] ? (
                    <FaChevronUp className="text-orange-500" />
                  ) : (
                    <FaChevronDown className="text-orange-500" />
                  )}
                </button>
                {expandedWeeks[weekKey] && (
                  <div className="p-4 space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-orange-100 flex flex-col md:flex-row justify-between items-start"
                      >
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {report.title} (Mã: {report.id})
                          </h4>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Ngày gửi: {report.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                          <span
                            className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${statusConfig[activeTab].bg} ${statusConfig[activeTab].text}`}
                          >
                            {statusConfig[activeTab].label}
                          </span>
                          <button
                            onClick={() => handleViewReport(report)}
                            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300"
                          >
                            Xem chi tiết
                          </button>
                          {activeTab === TABS.PENDING && (
                            <>
                              <button
                                onClick={() => handleApproveReport(report.id)}
                                className="px-4 py-2 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => handleRejectReport(report.id)}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            Không có báo cáo nào {statusConfig[activeTab].label.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
};

// StatsChart Component
const StatsChart = ({ stats, reports }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const today = new Date();
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);

    const weeklyData = reports.reduce((acc, report) => {
      const { key, range, startDate } = getWeekRange(report.date);
      if (startDate >= fourWeeksAgo && startDate <= today) {
        if (!acc[key]) {
          acc[key] = {
            range,
            pending: 0,
            approved: 0,
            rejected: 0,
          };
        }
        acc[key][report.status]++;
      }
      return acc;
    }, {});

    const weeks = Object.entries(weeklyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4);

    const labels = weeks.map(([_, data]) => data.range);
    const pendingData = weeks.map(([_, data]) => data.pending);
    const approvedData = weeks.map(([_, data]) => data.approved);
    const rejectedData = weeks.map(([_, data]) => data.rejected);

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [
          {
            label: 'Chờ duyệt',
            data: labels.length ? pendingData : [0],
            borderColor: '#F97316',
            backgroundColor: '#F97316',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Đã duyệt',
            data: labels.length ? approvedData : [0],
            borderColor: '#10B981',
            backgroundColor: '#10B981',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Từ chối',
            data: labels.length ? rejectedData : [0],
            borderColor: '#EF4444',
            backgroundColor: '#EF4444',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            title: { display: true, text: 'Tuần' },
          },
          y: {
            title: { display: true, text: 'Số lượng báo cáo' },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [reports]);

  return (
    <ErrorBoundary>
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Thống kê đơn vị</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Tổng số báo cáo', value: stats.total, color: 'text-gray-900' },
            { label: 'Báo cáo đã duyệt', value: stats.approved, color: 'text-green-600' },
            { label: 'Báo cáo từ chối', value: stats.rejected, color: 'text-red-600' },
            { label: 'Báo cáo chờ duyệt', value: stats.pending, color: 'text-orange-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-orange-100"
            >
              <h4 className="text-sm font-medium text-gray-500">{stat.label}</h4>
              <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ báo cáo theo tuần</h4>
          <div className="h-96">
            <canvas id="reportsChart" ref={canvasRef}></canvas>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// ReportModal Component
const ReportModal = ({
  isOpen,
  closeModal,
  report,
  categories,
  handleApproveReport,
  handleRejectReport,
  handleEditReport,
  editMode,
  handleSaveEdit,
  handleCancelEdit,
  handleCategoryChange,
  handleContentChange,
  addNewCategory,
  removeCategory,
}) => {
  if (!isOpen || !report) return null;

  const allCategories = [
    ...categories,
    ...report.categories
      .filter(
        (cat) =>
          !categories.some((predefined) => predefined.maDanhMuc === cat.maDanhMuc) &&
          cat.tenDanhMuc.toLowerCase() !== 'khác'
      )
      .map((cat) => ({
        maDanhMuc: cat.maDanhMuc,
        tenDanhMuc: cat.tenDanhMuc,
      })),
  ];

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeModal}
        ></div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl transform transition-all sm:max-w-4xl sm:w-full">
          <div className="p-6 pb-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                {report.title} (Mã: {report.id})
              </h3>
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-orange-500 transition-all duration-300"
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="mb-6">
              <span
                className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${report.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : report.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
              >
                {report.status === 'pending'
                  ? 'Chờ duyệt'
                  : report.status === 'approved'
                    ? 'Đã duyệt'
                    : 'Từ chối'}
              </span>
            </div>
            {report.categories?.map((cat, index) => (
              <div
                key={index}
                className="mb-6 border border-orange-500 p-6 rounded-xl relative min-h-[400px]"
              >
                {editMode && (
                  <button
                    onClick={() => removeCategory(index)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-all duration-300 p-1"
                    style={{ zIndex: 10 }}
                  >
                    <FaTimes size={20} />
                  </button>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Chọn danh mục</label>
                  <select
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${editMode ? '' : 'bg-gray-500'}`}
                    value={cat.maDanhMuc}
                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                    disabled={!editMode}
                  >
                    {allCategories.map((category) => (
                      <option key={category.maDanhMuc} value={category.maDanhMuc}>
                        {category.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'I. Kết quả đạt được trong tuần *', field: 'ketQua' },
                    { label: 'II. Nội dung tuần sau', field: 'noiDungTuanSau' },
                    { label: 'III. Đề xuất, kiến nghị', field: 'deXuatKienNghi' },
                  ].map((item) => (
                    <div key={item.field}>
                      <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                      {cat.noiDung[item.field]?.length > 0 ? (
                        cat.noiDung[item.field].map((entry, idx) => (
                          <textarea
                            key={idx}
                            className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${editMode ? '' : 'bg-gray-100'} mt-2`}
                            rows="4"
                            value={entry.noiDung || ''}
                            onChange={(e) =>
                              handleContentChange(index, item.field, idx, e.target.value)
                            }
                            readOnly={!editMode}
                          />
                        ))
                      ) : (
                        <textarea
                          className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${editMode ? '' : 'bg-gray-100'}`}
                          rows="4"
                          value=""
                          onChange={(e) =>
                            handleContentChange(index, item.field, 0, e.target.value)
                          }
                          readOnly={!editMode}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {editMode && (
              <button
                onClick={addNewCategory}
                className="flex items-center text-orange-500 hover:text-orange-600 transition-all duration-300"
              >
                <FaPlus className="h-5 w-5 mr-2" />
                Thêm danh mục
              </button>
            )}
          </div>
          <div className="bg-orange-50 px-6 py-4 flex flex-row-reverse">
            {editMode ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 ml-3"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-all duration-300"
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveReport(report.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300 ml-3"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleRejectReport(report.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 ml-3"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={handleEditReport}
                      className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 ml-3"
                    >
                      Chỉnh sửa
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-all duration-300"
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const DepartmentHeadDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.PENDING);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userInfo, setUserInfo] = useState({});
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const stableNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  const checkToken = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      stableNavigate('/');
      return false;
    }
    return token;
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const tenGiangVien = localStorage.getItem('tenGiangVien') || sessionStorage.getItem('tenGiangVien');
    const chucVu = localStorage.getItem('chucVu') || sessionStorage.getItem('chucVu');
    const tenDonVi = localStorage.getItem('tenDonVi') || sessionStorage.getItem('tenDonVi');

    if (!role || !token) {
      if (location.pathname !== '/') {
        stableNavigate('/');
      }
      return;
    }

    setUserRole(role);
    setUserInfo({
      tenGiangVien: tenGiangVien || 'Không xác định',
      chucVu: chucVu || 'Không xác định',
      tenDonVi: tenDonVi || 'Không xác định',
      vaiTro: role || 'Không xác định',
    });
  }, [stableNavigate, location.pathname]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const token = checkToken();
        if (!token) return;

        const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/danhmucbaocao/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            stableNavigate('/');
            return;
          }
          const err = await response.json();
          throw new Error(err.message || 'Lấy danh mục thất bại');
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(`Lỗi: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [stableNavigate]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const token = checkToken();
        if (!token) return;

        const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/laybaocaotuan/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            stableNavigate('/');
            return;
          }
          const err = await response.json();
          throw new Error(err.message || 'Lấy danh sách báo cáo thất bại');
        }

        const data = await response.json();
        const formattedReports = data.map((report) => ({
          id: report.maBaoCao,
          title: `Báo cáo tuần ${report.ngayTao}`,
          status:
            report.trangThai.toLowerCase() === 'đang thực hiện'
              ? 'pending'
              : report.trangThai.toLowerCase() === 'hoàn thành'
                ? 'approved'
                : report.trangThai.toLowerCase() === 'từ chối'
                  ? 'rejected'
                  : report.trangThai.toLowerCase() === 'chờ duyệt'
                    ? 'pending'
                    : 'unknown',
          author: localStorage.getItem('tenGiangVien') || 'Không xác định',
          date: report.ngayTao,
          content: '',
          proposal: '',
        }));

        setReports(formattedReports);

        const total = formattedReports.length;
        const approved = formattedReports.filter((r) => r.status === 'approved').length;
        const rejected = formattedReports.filter((r) => r.status === 'rejected').length;
        const pending = formattedReports.filter((r) => r.status === 'pending').length;

        setStats({ total, approved, rejected, pending });
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error(`Lỗi: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [stableNavigate]);

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        if (activeTab === TABS.PENDING) return report.status === 'pending';
        if (activeTab === TABS.APPROVED) return report.status === 'approved';
        if (activeTab === TABS.REJECTED) return report.status === 'rejected';
        return true;
      })
      .filter(
        (report) =>
          report.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [reports, activeTab, searchTerm]);

  const handleLogout = async () => {
    try {
      const token = checkToken();
      if (!token) return;

      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      } else {
        console.error('Logout failed:', await response.json());
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const handleViewReport = async (report) => {
  try {
    if (report.fullContent) {
      setSelectedReport({ ...report, categories: report.fullContent });
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    const token = checkToken();
    if (!token) return;

    const response = await fetch(
      `https://cds.bdu.edu.vn/bctm_bdu/api/chitietbaocao/${report.id}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        stableNavigate('/');
        return;
      }
      const err = await response.json();
      throw new Error(err.message || 'Lấy chi tiết báo cáo thất bại');
    }

    const data = await response.json();

    const formattedCategories = data.danhMuc.map((dm) => {
      const noiDungMap = dm.noiDung.reduce(
        (acc, nd) => {
          let contentArray = [nd]; // Mặc định là mảng chứa đối tượng hiện tại
          // Nếu noiDung là chuỗi JSON, chuyển đổi nó thành mảng
          if (typeof nd.noiDung === 'string' && nd.noiDung.startsWith('[')) {
            try {
              const parsedContent = JSON.parse(nd.noiDung.replace(/'/g, '"'));
              contentArray = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
            } catch (e) {
              console.warn('Failed to parse noiDung JSON:', nd.noiDung, e);
              contentArray = [{ noiDung: nd.noiDung }]; // Fallback nếu parse thất bại
            }
          }

          if (!acc[nd.maLoaiNoiDung]) acc[nd.maLoaiNoiDung] = [];
          acc[nd.maLoaiNoiDung].push(...contentArray.map((item) => ({
            maNoiDung: item.maNoiDung || nd.maNoiDung,
            noiDung: item.noiDung || nd.noiDung,
          })));
          return acc;
        },
        { 1: [], 2: [], 3: [] }
      );

      return {
        maDanhMuc: dm.maDanhMuc,
        tenDanhMuc: dm.tenDanhMuc || 'Không xác định',
        maDMBC: dm.maDMBC || null,
        noiDung: {
          ketQua: noiDungMap[1],
          noiDungTuanSau: noiDungMap[2],
          deXuatKienNghi: noiDungMap[3],
        },
      };
    });

    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id ? { ...r, fullContent: formattedCategories } : r
      )
    );

    setSelectedReport({
      ...report,
      status:
        data.trangThai.toLowerCase() === 'đang thực hiện'
          ? 'pending'
          : data.trangThai.toLowerCase() === 'hoàn thành'
            ? 'approved'
            : data.trangThai.toLowerCase() === 'từ chối'
              ? 'rejected'
              : data.trangThai.toLowerCase() === 'chờ duyệt'
                ? 'pending'
                : 'unknown',
      categories: formattedCategories,
    });

    setShowModal(true);
  } catch (error) {
    console.error('Error fetching report details:', error);
    toast.error(`Lỗi: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
  const handleApproveReport = async (reportId) => {
  try {
    setIsLoading(true);
    const token = checkToken();
    if (!token) return;
    if (!selectedReport || !selectedReport.categories || !Array.isArray(selectedReport.categories)) {
      throw new Error('Dữ liệu báo cáo không hợp lệ');
    }

    const requestBody = {
      danhMuc: selectedReport.categories.map((cat) => {
        const categoryData = {
          maDanhMuc: cat.maDanhMuc,
          ...(cat.maDMBC && { maDMBC: cat.maDMBC }),
          ...(cat.tenDanhMuc && cat.tenDanhMuc.toLowerCase() === 'khác' && { tenDanhMuc: cat.tenDanhMuc }),
          noiDung: [
            ...(cat.noiDung.ketQua || []).map((entry) => ({
              noiDung: entry.noiDung || '',
              maLoaiNoiDung: 1,
              ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
            })),
            ...(cat.noiDung.noiDungTuanSau || []).map((entry) => ({
              noiDung: entry.noiDung || '',
              maLoaiNoiDung: 2,
              ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
            })),
            ...(cat.noiDung.deXuatKienNghi || []).map((entry) => ({
              noiDung: entry.noiDung || '',
              maLoaiNoiDung: 3,
              ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
            })),
          ].filter(item => item.noiDung), // Loại bỏ các mục trống
        };

        return categoryData;
      }),
    };

    const response = await fetch(
      `https://cds.bdu.edu.vn/bctm_bdu/api/pheduyetbaocao/${reportId}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        stableNavigate('/');
        return;
      }
      const err = await response.json();
      throw new Error(err.message || 'Duyệt báo cáo thất bại');
    }

    const data = await response.json();
    toast.success(data.message || 'Duyệt báo cáo thành công!');

    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? { ...report, status: 'approved', fullContent: selectedReport.categories }
          : report
      )
    );

    setStats((prev) => ({
      ...prev,
      approved: prev.approved + 1,
      pending: prev.pending - 1,
    }));

    setShowModal(false);
  } catch (error) {
    console.error('Error approving report:', error);
    toast.error(`Lỗi: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleRejectReport = async (reportId) => {
    try {
      setIsLoading(true);
      const token = checkToken();
      if (!token) return;

      const response = await fetch(
        `https://cds.bdu.edu.vn/bctm_bdu/api/tuchoibaocao/${reportId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          stableNavigate('/');
          return;
        }
        const err = await response.json();
        throw new Error(err.message || 'Từ chối báo cáo thất bại');
      }

      const data = await response.json();
      toast.success(data.message || 'Từ chối báo cáo thành công!');

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: 'rejected' } : report
        )
      );

      setStats((prev) => ({
        ...prev,
        rejected: prev.rejected + 1,
        pending: prev.pending - 1,
      }));

      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = () => setEditMode(true);

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      const token = checkToken();
      if (!token) return;
      if (!selectedReport || !selectedReport.categories || !Array.isArray(selectedReport.categories)) {
        throw new Error('Dữ liệu báo cáo không hợp lệ');
      }

      const predefinedCategories = categories.map((cat) => cat.maDanhMuc);

      const requestBody = {
        danhMuc: selectedReport.categories.map((cat) => {
          const categoryData = {
            maDanhMuc: cat.maDanhMuc,
            noiDung: [
              ...(cat.noiDung.ketQua || []).map((entry) => ({
                noiDung: entry.noiDung || '',
                maLoaiNoiDung: 1,
                ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
              })),
              ...(cat.noiDung.noiDungTuanSau || []).map((entry) => ({
                noiDung: entry.noiDung || '',
                maLoaiNoiDung: 2,
                ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
              })),
              ...(cat.noiDung.deXuatKienNghi || []).map((entry) => ({
                noiDung: entry.noiDung || '',
                maLoaiNoiDung: 3,
                ...(entry.maNoiDung && { maNoiDung: entry.maNoiDung }),
              })),
            ],
          };

          if (cat.maDMBC) {
            categoryData.maDMBC = cat.maDMBC;
          }
          if (!predefinedCategories.includes(cat.maDanhMuc)) {
            categoryData.tenDanhMuc = cat.tenDanhMuc;
          }

          return categoryData;
        }),
      };

      const response = await fetch(
        `https://cds.bdu.edu.vn/bctm_bdu/api/pheduyetbaocao/${selectedReport.id}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          stableNavigate('/');
          return;
        }
        const err = await response.json();
        throw new Error(err.message || 'Lưu và phê duyệt báo cáo thất bại');
      }

      const data = await response.json();
      toast.success(data.message || 'Lưu và phê duyệt báo cáo thành công!');

      setReports((prev) =>
        prev.map((report) =>
          report.id === selectedReport.id
            ? { ...report, status: 'approved', fullContent: selectedReport.categories }
            : report
        )
      );

      setSelectedReport((prev) => ({
        ...prev,
        status: 'approved',
        categories: prev.categories,
      }));

      setStats((prev) => ({
        ...prev,
        approved: prev.approved + 1,
        pending: prev.pending - 1,
      }));

      setEditMode(false);
    } catch (error) {
      console.error('Error saving and approving report:', error);
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => setEditMode(false);

  const handleCategoryChange = (index, value) => {
    const updatedCategories = [...selectedReport.categories];
    const selectedCategory = allCategories.find((cat) => cat.maDanhMuc === parseInt(value));

    updatedCategories[index] = {
      ...updatedCategories[index],
      maDanhMuc: selectedCategory.maDanhMuc,
      tenDanhMuc: selectedCategory.tenDanhMuc,
    };
    setSelectedReport({ ...selectedReport, categories: updatedCategories });
  };

  const handleContentChange = (index, field, entryIndex, value) => {
    const updatedCategories = [...selectedReport.categories];
    const fieldEntries = updatedCategories[index].noiDung[field] || [];

    if (!fieldEntries[entryIndex]) {
      fieldEntries[entryIndex] = { noiDung: '' };
    }

    fieldEntries[entryIndex].noiDung = value;

    updatedCategories[index] = {
      ...updatedCategories[index],
      noiDung: {
        ...updatedCategories[index].noiDung,
        [field]: fieldEntries,
      },
    };
    setSelectedReport({ ...selectedReport, categories: updatedCategories });
  };

  const addNewCategory = () => {
    const newCategory = {
      maDanhMuc: categories[0]?.maDanhMuc || 1,
      tenDanhMuc: categories[0]?.tenDanhMuc || 'Không xác định',
      noiDung: {
        ketQua: '',
        noiDungTuanSau: '',
        deXuatKienNghi: '',
      },
    };
    setSelectedReport({
      ...selectedReport,
      categories: [...selectedReport.categories, newCategory],
    });
  };

  const removeCategory = (index) => {
    const updatedCategories = selectedReport.categories.filter((_, i) => i !== index);
    setSelectedReport({ ...selectedReport, categories: updatedCategories });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex font-sans fixed inset-0">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        className="mt-16"
        toastClassName="bg-white shadow-xl rounded-lg border border-orange-100"
        progressClassName="bg-orange-400"
      />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        <Header
          userInfo={userInfo}
          openUserModal={() => setIsUserModalOpen(true)}
          handleLogout={handleLogout}
          toggleSidebar={toggleSidebar}
        />
        <UserModal
          isOpen={isUserModalOpen}
          closeModal={() => setIsUserModalOpen(false)}
          userInfo={userInfo}
        />
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-500 hover:scrollbar-thumb-orange-600">
          <div className="mb-6 sticky top-0 bg-orange-50 py-4 z-10">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã báo cáo hoặc tiêu đề..."
                className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-orange-50">
              <svg
                className="animate-spin h-12 w-12 mx-auto text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-4">Đang tải...</p>
            </div>
          ) : activeTab === TABS.STATS ? (
            <StatsChart stats={stats} reports={reports} />
          ) : (
            <ReportList
              reports={filteredReports}
              activeTab={activeTab}
              handleViewReport={handleViewReport}
              handleApproveReport={handleApproveReport}
              handleRejectReport={handleRejectReport}
            />
          )}
        </div>
        <ReportModal
          isOpen={showModal}
          closeModal={() => setShowModal(false)}
          report={selectedReport}
          categories={categories}
          handleApproveReport={handleApproveReport}
          handleRejectReport={handleRejectReport}
          handleEditReport={handleEditReport}
          editMode={editMode}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          handleCategoryChange={handleCategoryChange}
          handleContentChange={handleContentChange}
          addNewCategory={addNewCategory}
          removeCategory={removeCategory}
        />
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;