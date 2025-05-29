import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Bell, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Loader, ChevronDown, ChevronUp, X } from 'lucide-react';
import logo from '@/assets/logo-trg.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BDUSmartReports() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [unitId, setUnitId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('Đang thực hiện');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const donVi = localStorage.getItem('maDonVi') || sessionStorage.getItem('maDonVi');
    const tenGiangVien = localStorage.getItem('tenGiangVien') || sessionStorage.getItem('tenGiangVien');
    const chucVu = localStorage.getItem('chucVu') || sessionStorage.getItem('chucVu');
    const tenDonVi = localStorage.getItem('tenDonVi') || sessionStorage.getItem('tenDonVi');

    if (!role || !token) {
      navigate('/');
      return;
    }

    setUserRole(role);
    setUserName(tenGiangVien || 'Người dùng');
    setUnitId(parseInt(donVi, 10) || null);
    setUserInfo({
      tenGiangVien: tenGiangVien || 'Không xác định',
      chucVu: chucVu || 'Không xác định',
      tenDonVi: tenDonVi || 'Không xác định',
      vaiTro: role || 'Không xác định',
    });

  
    if (location.state?.refresh) {
      setRefresh(true);
    }
  }, [navigate, location]);

  const checkToken = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      navigate('/');
      return false;
    }
    return token;
  };

  useEffect(() => {
    if (!unitId) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = checkToken();
        if (!token) return;

        const donVi = parseInt(localStorage.getItem('maDonVi') || sessionStorage.getItem('maDonVi'), 10);
        const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/laybaocaotuan/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            navigate('/');
            return;
          }
          throw new Error('Không thể tải danh sách báo cáo');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const filteredData = data.filter(n => n.maDonVi === donVi);
          setNotifications(filteredData);
          console.log('Fetched Notifications:', filteredData); // Debugging
        } else {
          setNotifications([]);
        }
      } catch (err) {
        toast.error('Lỗi không cập nhật được thông báo: ' + err.message);
        setNotifications([]);
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    };

    fetchNotifications();
  }, [unitId, navigate, refresh]); 

  const handleLogout = async () => {
    const token = checkToken();
    if (!token) return;

    try {
      await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/logout/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const formatTime = (t) => {
    if (!t) return '';
    return t.slice(0, 5);
  };

  const getWeekRange = (date) => {
    const reportDate = new Date(date);
   
    const day = reportDate.getDay();
    const diff = reportDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(reportDate);
    startOfWeek.setDate(diff);
 
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

  
    const tempDate = new Date(startOfWeek);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    const weekNumber = 1 + Math.round(((tempDate - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);

    return {
      start: startOfWeek.toLocaleDateString('vi-VN'),
      end: endOfWeek.toLocaleDateString('vi-VN'),
      key: startOfWeek.toISOString().split('T')[0],
      weekNumber,
    };
  };

  const grouped = {
    'Hoàn thành': [],
    'Đang thực hiện': [],
    'Chờ duyệt': [],
    'Từ chối': [],
  };

  notifications.forEach(n => {
    const status = n.trangThai || 'Không xác định';
    if (grouped[status]) {
      grouped[status].push(n);
    }
  });

  const sortByDateDesc = (a, b) => new Date(b.ngayTao) - new Date(a.ngayTao);

  const groupedByWeek = {};
  grouped[currentTab].sort(sortByDateDesc).forEach(n => {
    const weekRange = getWeekRange(n.ngayTao);
    if (!groupedByWeek[weekRange.key]) {
      groupedByWeek[weekRange.key] = { range: weekRange, reports: [] };
    }
    groupedByWeek[weekRange.key].reports.push(n);
  });

  const toggleWeek = (weekKey) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-orange-50 font-sans fixed inset-0">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="bg-white shadow-xl rounded-lg border border-orange-100"
        progressClassName="bg-orange-400"
      />
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="BDU Logo" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-semibold">BDU Smart Reports</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openModal}
            className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
          >
            <User className="mr-2 h-5 w-5" />
            {userName}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-orange-500 transition-all duration-300"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-orange-500 mb-6">Thông tin người dùng</h2>
            <div className="space-y-4 text-gray-700">
              <p><span className="font-semibold text-orange-500">Họ và tên:</span> {userInfo.tenGiangVien}</p>
              <p><span className="font-semibold text-orange-500">Chức vụ:</span> {userInfo.chucVu}</p>
              <p><span className="font-semibold text-orange-500">Đơn vị:</span> {userInfo.tenDonVi}</p>
              <p><span className="font-semibold text-orange-500">Vai trò:</span> {userInfo.vaiTro}</p>
            </div>
            <button
              onClick={closeModal}
              className="mt-6 w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition-all duration-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {Object.keys(grouped).map(status => (
              <button
                key={status}
                onClick={() => setCurrentTab(status)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  currentTab === status
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                }`}
              >
                {status} ({grouped[status].length})
              </button>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Bell className="mr-2 text-orange-500 h-6 w-6" />
            Danh sách thông báo
          </h2>

          {/* Scrollable List */}
          <div className="max-h-[calc(100vh-300px)] overflow-auto scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-500 hover:scrollbar-thumb-orange-600 space-y-6">
            {loading ? (
              <div className="text-center text-gray-500 py-20">
                <Loader className="w-12 h-12 mx-auto animate-spin text-orange-500" />
                <p className="mt-4">Đang tải thông báo...</p>
              </div>
            ) : Object.keys(groupedByWeek).length > 0 ? (
              Object.entries(groupedByWeek)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([weekKey, { range, reports }]) => (
                  <div key={weekKey} className="border-b border-orange-100 pb-4">
                    <button
                      onClick={() => toggleWeek(weekKey)}
                      className="flex justify-between items-center w-full text-left py-3 px-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-300"
                    >
                      <span className="text-lg font-semibold text-gray-800">
                        Tuần {range.weekNumber}: {range.start} - {range.end} ({reports.length} báo cáo)
                      </span>
                      {expandedWeeks[weekKey] ? (
                        <ChevronUp className="text-orange-500" />
                      ) : (
                        <ChevronDown className="text-orange-500" />
                      )}
                    </button>
                    {expandedWeeks[weekKey] && (
                      <div className="mt-4 space-y-4">
                        {reports.map(item => (
                          <div
                            key={item.maBaoCao}
                            className="bg-white p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="bg-orange-50 p-3 rounded-full">
                                  {item.trangThai === 'Hoàn thành' && <CheckCircle className="text-green-500 h-6 w-6" />}
                                  {item.trangThai === 'Đang thực hiện' && <Clock className="text-blue-500 h-6 w-6" />}
                                  {item.trangThai === 'Chờ duyệt' && <AlertCircle className="text-yellow-500 h-6 w-6" />}
                                  {item.trangThai === 'Từ chối' && <XCircle className="text-red-500 h-6 w-6" />}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800">Báo cáo #{item.maBaoCao}</h4>
                                  <p className="text-sm text-gray-600">Đơn vị: {item.maDonVi}</p>
                                </div>
                              </div>
                              <span
                                className={`px-4 py-1 rounded-full text-sm font-medium ${
                                  item.trangThai === 'Hoàn thành'
                                    ? 'bg-green-100 text-green-800'
                                    : item.trangThai === 'Đang thực hiện'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.trangThai === 'Từ chối'
                                    ? 'bg-red-100 text-red-800'
                                    : item.trangThai === 'Chờ duyệt'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {item.trangThai}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="mr-2 text-orange-500 h-5 w-5" />
                                Ngày tạo:{' '}
                                <span className="font-medium ml-1">
                                  {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-2 text-orange-500 h-5 w-5" />
                                Bắt đầu: <span className="font-medium ml-1">{formatTime(item.gioBatDau)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-2 text-orange-500 h-5 w-5" />
                                Kết thúc: <span className="font-medium ml-1">{formatTime(item.gioKetThuc)}</span>
                              </div>
                            </div>
                            <div className="mt-4 text-right">
                              <button
                                onClick={() => {
                                  console.log(`Navigating to report: maBaoCao=${item.maBaoCao}, maDonVi=${item.maDonVi}`); // Debugging
                                  navigate(`/create-report/${item.maBaoCao}/${item.maDonVi}`, { state: { refresh: true } });
                                }}
                                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500 py-20">
                <Bell className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <p className="text-lg font-medium">Không có thông báo</p>
                <p className="text-sm">Vui lòng quay lại sau</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}