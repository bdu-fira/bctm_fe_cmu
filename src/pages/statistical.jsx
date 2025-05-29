import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Eye, LogOut, User } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import logo from '@/assets/logo-trg.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import ReportTemplate from './ReportTemplate';
import { renderDraggableItem } from '../utils/renderDraggableItem.jsx';
import ErrorBoundary from './ErrorBoundary';

const SmartReportsDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [sourceItems, setSourceItems] = useState([]);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [unitId, setUnitId] = useState(null);
  const [contentTypes, setContentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [detailedReports, setDetailedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, approvedReports: 0, pendingReports: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userInfo, setUserInfo] = useState({ tenGiangVien: 'Thư ký', chucVu: 'Thư ký Hiệu trưởng' });
  const [previewContent, setPreviewContent] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [arrangedContent, setArrangedContent] = useState({
    noidung1: [],
    noidung2: [],
    noidung3: [],
  });
  const [modalReports, setModalReports] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!showExportModal && modalReports.length > 0) {
      const initialSourceItems = modalReports.flatMap(report => 
        (report.danhMuc || []).flatMap(dm =>
          (dm.noiDung || []).map(nd => ({
            ...nd,
            isChecked: selectedContentTypes.includes(nd.loaiNoiDung),
            phanLoai: dm.phanLoai,
            danhMuc: [{ ...dm, noiDung: [nd] }],
            reportId: report.maBaoCao,
          }))
        )
      );
      setSourceItems(initialSourceItems);
    }
  }, [modalReports, selectedCategories, selectedContentTypes, showExportModal]);

  const checkToken = async (token) => {
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/token/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      toast.error(`Lỗi xác thực: ${error.message}`);
      return false;
    }
  };

  const fetchStats = async (token) => {
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/laybaocaotuan/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch weekly reports for stats');
      const data = await response.json();
      const totalReports = data.length;
      const approvedReports = data.filter(report => report.trangThai === 'Hoàn thành').length;
      const pendingReports = data.filter(report => report.trangThai === 'Chờ duyệt' || report.trangThai === 'Đang thực hiện').length;
      setStats({ totalReports, approvedReports, pendingReports });
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const fetchDepartments = async (token) => {
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/donvi/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) throw new Error('Unauthorized: Invalid token');
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/');
      }
    }
  };

  const fetchContentTypes = async (token) => {
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/loainoidung/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) throw new Error('Unauthorized: Invalid token');
      if (!response.ok) throw new Error('Failed to fetch content types');
      const data = await response.json();
      setContentTypes(data);
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/');
      }
    }
  };

  const fetchCategories = async (token) => {
  try {
    const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/danhmucbaocao/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.status === 401) throw new Error('Unauthorized: Invalid token');
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();

 
    const predefinedCategories = Array.isArray(data) ? data.map(cat => ({
      maDanhMuc: cat.maDanhMuc,
      tenDanhMuc: cat.tenDanhMuc || 'Không xác định',
    })) : [];

    return predefinedCategories;
  } catch (error) {
    toast.error(`Lỗi: ${error.message}`);
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      navigate('/');
    }
    return []; 
  }
};

useEffect(() => {
  const initialize = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/');
      return;
    }

    const isValid = await checkToken(token);
    if (!isValid) {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      navigate('/');
      return;
    }

    const reports = await fetchWeeklyReports(token);
    if (reports.length > 0) {
      const detailedReportsPromises = reports.map(async (report) => {
        const detailedReport = await fetchReportDetails(token, report.maBaoCao);
        if (detailedReport) {
          return { ...detailedReport, maDonVi: report.maDonVi, ngayTao: report.ngayTao, trangThai: report.trangThai };
        }
        return null;
      });
      const detailedReportsData = await Promise.all(detailedReportsPromises);
      const validDetailedReports = detailedReportsData.filter(report => report !== null);
      setDetailedReports(validDetailedReports);
      setFilteredReports(validDetailedReports);
    }

  
    const predefinedCategories = await fetchCategories(token);
    console.log('Categories from API:', predefinedCategories);

    setCategories(predefinedCategories);

    await Promise.all([
      fetchStats(token),
      fetchDepartments(token),
      fetchContentTypes(token),
    ]);
  };

  initialize();
}, [navigate]);

  const fetchWeeklyReports = async (token) => {
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/laybaocaotuan/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) throw new Error('Unauthorized: Invalid token');
      if (!response.ok) throw new Error('Failed to fetch weekly reports');
      const data = await response.json();
      const weeklyStats = data.reduce((acc, report) => {
        const week = getWeek(new Date(report.ngayTao));
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {});
      const weeklyChartData = Object.keys(weeklyStats).map(week => ({ week: `Tuần ${week}`, value: weeklyStats[week] }));
      setWeeklyData(weeklyChartData);
      setWeeklyReports(data);
      return data;
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/');
      }
      return [];
    }
  };

  const fetchReportDetails = async (token, maBaoCao) => {
    try {
      const response = await fetch(`https://cds.bdu.edu.vn/bctm_bdu/api/chitietbaocao/${maBaoCao}/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) throw new Error('Unauthorized: Invalid token');
      if (!response.ok) throw new Error('Failed to fetch report details');
      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
      if (error.message.includes('Unauthorized')) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/');
      }
      return null;
    }
  };

  useEffect(() => {
  const initialize = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/');
      return;
    }

    const isValid = await checkToken(token);
    if (!isValid) {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      navigate('/');
      return;
    }

    const reports = await fetchWeeklyReports(token);
    if (reports.length > 0) {
      const detailedReportsPromises = reports.map(async (report) => {
        const detailedReport = await fetchReportDetails(token, report.maBaoCao);
        if (detailedReport) {
          return { ...detailedReport, maDonVi: report.maDonVi, ngayTao: report.ngayTao, trangThai: report.trangThai };
        }
        return null;
      });
      const detailedReportsData = await Promise.all(detailedReportsPromises);
      const validDetailedReports = detailedReportsData.filter(report => report !== null);
      setDetailedReports(validDetailedReports);
      setFilteredReports(validDetailedReports);
    }


    const predefinedCategories = await fetchCategories(token);
    console.log('Categories from API:', predefinedCategories);

 
    setCategories(predefinedCategories);

    await Promise.all([
      fetchStats(token),
      fetchDepartments(token),
      fetchContentTypes(token),
    ]);
  };

  initialize();
}, [navigate]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...detailedReports];

      if (selectedDepartments.length > 0) {
        filtered = filtered.filter(item => selectedDepartments.includes(item.maDonVi));
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter(report => {
          const danhMuc = report.danhMuc || [];
          return danhMuc.some(dm => selectedCategories.includes(dm.maDanhMuc));
        });
      }

      if (selectedContentTypes.length > 0) {
        filtered = filtered.filter(report => {
          const danhMuc = report.danhMuc || [];
          return danhMuc.some(dm =>
            (dm.noiDung || []).some(nd => selectedContentTypes.includes(nd.maLoaiNoiDung))
          );
        });
      }

      if (searchTerm) {
        filtered = filtered.filter(item =>
          departments.find(dept => dept.maDonVi === item.maDonVi)?.tenDonVi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.maBaoCao.toString().includes(searchTerm)
        );
      }

      setFilteredReports(filtered);
    };

    applyFilters();
  }, [selectedDepartments, selectedContentTypes, selectedCategories, searchTerm, detailedReports, departments]);

  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const response = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/logout/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        toast.success('Đăng xuất thành công');
        navigate('/');
      } else throw new Error('Đăng xuất thất bại');
    } catch (error) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleViewReport = (maBaoCao) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để xem chi tiết báo cáo');
      navigate('/');
      return;
    }
    fetchReportDetails(token, maBaoCao).then(data => {
      if (data) {
        const weeklyReport = weeklyReports.find(report => report.maBaoCao === maBaoCao);
        const weekNumber = getWeek(new Date(weeklyReport?.ngayTao));
        const reportData = { ...data, maDonVi: weeklyReport?.maDonVi, ngayTao: weeklyReport?.ngayTao, trangThai: weeklyReport?.trangThai };

   
        setSelectedReports(prev => {
          const isAlreadySelected = prev.some(report => report.maBaoCao === reportData.maBaoCao);
          if (isAlreadySelected) {
            return prev;
          }
          const updatedReports = [...prev, reportData];
          updatePreviewContent(updatedReports);
          return updatedReports;
        });
      }
    });
  };

  const handleSelectReport = (report) => {
    setSelectedReports(prev => {
      const isAlreadySelected = prev.some(r => r.maBaoCao === report.maBaoCao);
      let updatedReports;
      if (isAlreadySelected) {
        updatedReports = prev.filter(r => r.maBaoCao !== report.maBaoCao);
      } else {
        updatedReports = [...prev, report];
      }
      updatePreviewContent(updatedReports);
      return updatedReports;
    });
  };

  const updatePreviewContent = (reports) => {
    if (reports.length === 0) {
      setPreviewContent('');
      return;
    }
  
    let previewContent = '';
    reports.forEach((data, index) => {
      const weeklyReport = weeklyReports.find(report => report.maBaoCao === data.maBaoCao);
      const weekNumber = getWeek(new Date(weeklyReport?.ngayTao));
      const filteredDanhMuc = (data.danhMuc || []).filter(dm =>
        selectedCategories.length === 0 || selectedCategories.includes(dm.maDanhMuc)
      );
  
      previewContent += `Báo cáo ${index + 1}:\n` +
        `Mã báo cáo: ${data.maBaoCao}\n` +
        `Đơn vị: ${departments.find(d => d.maDonVi === weeklyReport?.maDonVi)?.tenDonVi || 'Không xác định'}\n` +
        `Ngày tạo: ${new Date(weeklyReport?.ngayTao).toLocaleDateString('vi-VN')}\n` +
        `Tuần: ${weekNumber}\n` +
        `Trạng thái: ${weeklyReport?.trangThai}\n\n`;
  
      filteredDanhMuc.forEach((dm, dmIndex) => {
        const noiDungByType = dm.noiDung.reduce((acc, nd) => {
          const type = contentTypes.find(ct => ct.maLoaiNoiDung === nd.maLoaiNoiDung)?.tenLoaiNoiDung || 'Unknown';
          acc[type] = acc[type] || [];
          acc[type].push(nd.noiDung || ' ');
          return acc;
        }, {});
  
        const maLoaiNoiDung1 = contentTypes.find(ct => ct.maLoaiNoiDung === 1)?.tenLoaiNoiDung || 'Kết quả đạt được trong tuần';
        const maLoaiNoiDung2 = contentTypes.find(ct => ct.maLoaiNoiDung === 2)?.tenLoaiNoiDung || 'Nội dung tuần sau';
        const maLoaiNoiDung3 = contentTypes.find(ct => ct.maLoaiNoiDung === 3)?.tenLoaiNoiDung || 'Đề xuất, kiến nghị';
  
        previewContent += `Danh mục: ${dm.tenDanhMuc}\n`;
        if (selectedContentTypes.length === 0 || selectedContentTypes.includes(1)) {
          previewContent += `I. ${maLoaiNoiDung1}\n${(noiDungByType[maLoaiNoiDung1] || []).join('\n') || ' '}\n\n`;
        }
        if (selectedContentTypes.length === 0 || selectedContentTypes.includes(2)) {
          previewContent += `II. ${maLoaiNoiDung2}\n${(noiDungByType[maLoaiNoiDung2] || []).join('\n') || ' '}\n\n`;
        }
        if (selectedContentTypes.length === 0 || selectedContentTypes.includes(3)) {
          previewContent += `III. ${maLoaiNoiDung3}\n${(noiDungByType[maLoaiNoiDung3] || []).join('\n') || ' '}\n\n`;
        }
        if (dmIndex < filteredDanhMuc.length - 1) {
          previewContent += '------------------------\n\n';
        }
      });
  
      if (index < reports.length - 1) {
        previewContent += '------------------------\n\n';
      }
    });
  
    setPreviewContent(previewContent.trim());
  };

  const openExportModal = () => {
    if (selectedReports.length === 0) {
      toast.error('Vui lòng chọn ít nhất một báo cáo để xuất!');
      return;
    }

    const updatedArrangedContent = {
      noidung1: [],
      noidung2: [],
      noidung3: [],
    };

    const newSourceItems = [];

    selectedReports.forEach(report => {
      const filteredDanhMuc = (report.danhMuc || [])
        .filter(dm => selectedCategories.length === 0 || selectedCategories.includes(dm.maDanhMuc))
        .filter(dm => dm && dm.noiDung && Array.isArray(dm.noiDung));

      [1, 2, 3].forEach(typeId => {
        if (selectedContentTypes.length === 0 || selectedContentTypes.includes(typeId)) {
          const contentTypeName = contentTypes.find(ct => ct.maLoaiNoiDung === typeId)?.tenLoaiNoiDung ||
            (typeId === 1 ? 'Kết quả đạt được trong tuần' :
             typeId === 2 ? 'Nội dung tuần sau' : 'Đề xuất, kiến nghị');
          const sectionLabel = typeId === 1 ? 'I' : typeId === 2 ? 'II' : 'III';

          filteredDanhMuc.forEach(dm => {
            const relevantContent = (dm.noiDung || [])
              .filter(nd => nd?.maLoaiNoiDung === typeId && nd?.noiDung)
              .map(nd => ({
                ...report,
                danhMuc: [{ ...dm, noiDung: [{ ...nd }] }],
                section: sectionLabel,
                contentTypeName: contentTypeName,
                maLoaiNoiDung: typeId,
              }));
            newSourceItems.push(...relevantContent);
          });
        }
      });
    });

    if (newSourceItems.length === 0) {
      toast.warn('Không có nội dung báo cáo phù hợp với bộ lọc đã chọn!');
      return;
    }

    setSourceItems(newSourceItems);
    setModalReports(selectedReports);
    setArrangedContent(updatedArrangedContent);
    setShowExportModal(true);
  };
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    const validateItem = (item) => {
      if (!item || !item.danhMuc || !Array.isArray(item.danhMuc) || item.danhMuc.length === 0) {
        console.warn('Invalid item detected during drag-and-drop:', item);
        return false;
      }
      return true;
    };

    // Xử lý kéo thả trong cùng một vùng
    if (sourceDroppableId === destDroppableId) {
      const items = sourceDroppableId.startsWith('source') 
        ? Array.from(sourceItems)
        : Array.from(arrangedContent[sourceDroppableId] || []);
      
      const [movedItem] = items.splice(source.index, 1);
      if (!validateItem(movedItem)) {
        toast.error('Không thể di chuyển: Dữ liệu không hợp lệ!');
        return;
      }
      items.splice(destination.index, 0, movedItem);
      
      if (sourceDroppableId.startsWith('source')) {
        setSourceItems(items);
      } else {
        setArrangedContent({
          ...arrangedContent,
          [sourceDroppableId]: items,
        });
      }
      return;
    }

 
    if (sourceDroppableId.startsWith('source') && !destDroppableId.startsWith('source')) {
      const newSourceItems = Array.from(sourceItems);
      const [movedItem] = newSourceItems.splice(source.index, 1);
      if (!validateItem(movedItem)) {
        toast.error('Không thể di chuyển: Dữ liệu không hợp lệ!');
        return;
      }
      setSourceItems(newSourceItems);

      const destList = Array.from(arrangedContent[destDroppableId] || []);
      destList.splice(destination.index, 0, movedItem);
      setArrangedContent({
        ...arrangedContent,
        [destDroppableId]: destList,
      });
      return;
    }


    if (!sourceDroppableId.startsWith('source') && destDroppableId.startsWith('source')) {
      const sourceList = Array.from(arrangedContent[sourceDroppableId] || []);
      const [movedItem] = sourceList.splice(source.index, 1);
      if (!validateItem(movedItem)) {
        toast.error('Không thể di chuyển: Dữ liệu không hợp lệ!');
        return;
      }
      setArrangedContent({
        ...arrangedContent,
        [sourceDroppableId]: sourceList,
      });

      const newSourceItems = Array.from(sourceItems);
      newSourceItems.splice(destination.index, 0, movedItem);
      setSourceItems(newSourceItems);
      return;
    }


    if (!sourceDroppableId.startsWith('source') && !destDroppableId.startsWith('source')) {
      const sourceList = Array.from(arrangedContent[sourceDroppableId] || []);
      const destList = Array.from(arrangedContent[destDroppableId] || []);
      const [movedItem] = sourceList.splice(source.index, 1);
      if (!validateItem(movedItem)) {
        toast.error('Không thể di chuyển: Dữ liệu không hợp lệ!');
        return;
      }
      destList.splice(destination.index, 0, movedItem);

      setArrangedContent({
        ...arrangedContent,
        [sourceDroppableId]: sourceList,
        [destDroppableId]: destList,
      });
      return;
    }
  };

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
    setUnitId(donVi && !isNaN(parseInt(donVi, 10)) ? parseInt(donVi, 10) : null);
    setUserInfo({
      tenGiangVien: tenGiangVien || 'Không xác định',
      chucVu: chucVu || 'Không xác định',
      tenDonVi: tenDonVi || 'Không xác định',
      vaiTro: role || 'Không xác định',
    });
  }, [navigate]);

  const toggleSelection = (item, selectedItems, setSelectedItems) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const pieChartData = [
    { name: 'Tổng số báo cáo', value: stats.totalReports || 1, color: '#F97319' },
    { name: 'Đã duyệt', value: stats.approvedReports || 1, color: '#FDBA74' },
    { name: 'Chờ/Đang thực hiện', value: stats.pendingReports || 1, color: '#FF8C00' },
  ].filter(item => item.value > 0);

  const statusClasses = {
    'Hoàn thành': 'bg-green-100 text-green-800',
    'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
    'Từ chối': 'bg-red-100 text-red-800',
    'Đang thực hiện': 'bg-blue-100 text-blue-800',
    'Chưa nộp': 'bg-gray-100 text-gray-800',
  };

  const getWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#FFF3E6] w-full fixed inset-0">
        <ToastContainer position="top-right" autoClose={3000} limit={3} />
        <header className="bg-gradient-to-r from-orange-600 to-orange-600 text-white p-6 flex justify-between items-center shadow-xl sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="BDU Logo" className="w-12 h-12 rounded-full shadow-md" />
            <span className="text-2xl font-bold tracking-wide">BDU Smart Reports</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
            >
              <User className="mr-2 h-5 w-5" />
              {userName}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
            >
              <LogOut classAND="mr-2 h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Modal thông tin người dùng */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-orange-600 mb-4">Thông tin người dùng</h2>
              <div className="space-y-3 text-gray-600">
                <p><span className="font-semibold">Họ và tên:</span> {userInfo.tenGiangVien}</p>
                <p><span className="font-semibold">Chức vụ:</span> {userInfo.chucVu}</p>
                <p><span className="font-semibold">Đơn vị:</span> {userInfo.tenDonVi}</p>
                <p><span className="font-semibold">Vai trò:</span> {userInfo.vaiTro}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-orange-700">Tổng Hợp & Thống Kê Báo Cáo</h2>
              <p className="text-lg text-gray-600 mt-2">Quản lý và phân tích báo cáo toàn trường</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-300">
                <p className="text-sm text-gray-500">Tổng số báo cáo</p>
                <p className="text-3xl font-bold text-orange-700">{stats.totalReports}</p>
                <FileText className="w-10 h-10 text-orange-500 mt-2" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-300">
                <p className="text-sm text-gray-500">Đã duyệt</p>
                <p className="text-3xl font-bold text-orange-700">{stats.approvedReports}</p>
                <CheckCircle className="w-10 h-10 text-orange-500 mt-2" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-300">
                <p className="text-sm text-gray-500">Đang thực hiện</p>
                <p className="text-3xl font-bold text-orange-700">{stats.pendingReports}</p>
                <Clock className="w-10 h-10 text-orange-500 mt-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-orange-700 mb-4">Thống kê theo tuần</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#F97316' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#F97316' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={3} dot={{ stroke: '#F97316', strokeWidth: 2, r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-orange-700 mb-4">Phân bố dữ liệu</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold text-orange-700">Trạng Thái Nộp Báo Cáo</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="border rounded-xl p-4 bg-gray-50 h-[600px] overflow-y-auto">
                  <h4 className="text-base font-medium text-gray-700 mb-3">Lọc theo đơn vị</h4>
                  <div className="space-y-2 mb-6">
                    {departments.length > 0 ? (
                      departments.map(dept => (
                        <label key={dept.maDonVi} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dept.maDonVi)}
                            onChange={() => toggleSelection(dept.maDonVi, selectedDepartments, setSelectedDepartments)}
                            className="form-checkbox h-5 w-5 text-orange-600"
                          />
                          <span className="text-gray-800">{dept.tenDonVi}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có đơn vị nào</p>
                    )}
                  </div>

                  <h4 className="text-base font-medium text-gray-700 mb-3">Lọc theo nội dung</h4>
                  <div className="space-y-2 mb-6">
                    {contentTypes.length > 0 ? (
                      contentTypes.map(ct => (
                        <label key={ct.maLoaiNoiDung} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedContentTypes.includes(ct.maLoaiNoiDung)}
                            onChange={() => toggleSelection(ct.maLoaiNoiDung, selectedContentTypes, setSelectedContentTypes)}
                            className="form-checkbox h-5 w-5 text-orange-600"
                          />
                          <span className="text-gray-800">{ct.tenLoaiNoiDung || 'Không xác định'}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có loại nội dung nào</p>
                    )}
                  </div>

                  <h4 className="text-base font-medium text-gray-700 mb-3">Lọc theo danh mục</h4>
                  <div className="space-y-2">
                    {categories.length > 0 ? (
                    categories
                      .filter(cat => 
                        cat && 
                        cat.maDanhMuc && 
                        cat.tenDanhMuc && 
                        cat.tenDanhMuc !== 'Khác' && 
                        !cat.tenDanhMuc.includes('<Tên Danh Mục>') 
                      )
                      .map(cat => (
                        <label key={cat.maDanhMuc} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.maDanhMuc)}
                            onChange={() => toggleSelection(cat.maDanhMuc, selectedCategories, setSelectedCategories)}
                            className="form-checkbox h-5 w-5 text-orange-600"
                          />
                          <span className="text-gray-800">{cat.tenDanhMuc}</span>
                        </label>
                      ))
                  ) : (
                    <p className="text-gray-500">Không có danh mục nào</p>
                  )}
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-gray-50 h-[600px] flex flex-col">
                  <h3 className="text-xl font-semibold text-orange-700 mb-4">Danh sách báo cáo</h3>
                  <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-orange-100 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Chọn</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Mã báo cáo</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Phòng ban</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Tuần</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Trạng thái</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-orange-700 border-b">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.length > 0 ? (
                          filteredReports.map(report => {
                            const weekNumber = getWeek(new Date(report.ngayTao));
                            const departmentName = departments.find(d => d.maDonVi === report.maDonVi)?.tenDonVi || 'Không xác định';
                            return (
                              <tr key={report.maBaoCao} className="border-b hover:bg-orange-50 transition-all duration-200">
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedReports.some(r => r.maBaoCao === report.maBaoCao)}
                                    onChange={() => handleSelectReport(report)}
                                    className="form-checkbox h-5 w-5 text-orange-600"
                                  />
                                </td>
                                <td className="py-3 px-4 text-gray-800">#{report.maBaoCao}</td>
                                <td className="py-3 px-4 text-gray-800">{departmentName}</td>
                                <td className="py-3 px-4 text-gray-800">Tuần {weekNumber}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusClasses[report.trangThai] || 'bg-gray-100 text-gray-800'}`}>
                                    {report.trangThai || 'Chưa nộp'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleViewReport(report.maBaoCao)}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200"
                                  >
                                    Xem
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-3 px-4 text-center text-gray-500">
                              Không có báo cáo nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-gray-50 h-[600px] flex flex-col">
                  <h3 className="text-xl font-semibold text-orange-700 mb-4">Nội dung chi tiết</h3>
                  <textarea
                    value={previewContent}
                    readOnly
                    placeholder="Nội dung chi tiết sẽ hiển thị ở đây..."
                    className="flex-1 p-3 bg-white rounded-lg resize-none overflow-y-auto border-2 border-gray-900"
                  />
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={openExportModal}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md"
                    >
                      Tạo báo cáo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <DragDropContext onDragEnd={onDragEnd}>
          {showExportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[85vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-orange-700 mb-4">Sắp xếp và xuất báo cáo</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-[70vh] overflow-y-auto">
                    <ReportTemplate
                      arrangedContent={arrangedContent}
                      departments={departments}
                      contentTypes={contentTypes}
                      selectedContentTypes={selectedContentTypes}
                      userInfo={userInfo}
                      modalReports={modalReports}
                      selectedReport={null} 
                      previewContent={previewContent}
                      getWeek={getWeek}
                      onExport={() => setShowExportModal(false)}
                    />
                  </div>
                  <div className="h-[70vh] overflow-y-auto">
                    <h4 className="text-base font-bold">Danh sách nội dung báo cáo</h4>
                    {[1, 2, 3].map(typeId => {
                      if (selectedContentTypes.length > 0 && !selectedContentTypes.includes(typeId)) {
                        return null;
                      }

                      const typeItems = sourceItems.filter(item =>
                        item.maLoaiNoiDung === typeId ||
                        (item.danhMuc && item.danhMuc[0]?.noiDung && item.danhMuc[0]?.noiDung[0]?.maLoaiNoiDung === typeId)
                      );

                      const typeName = contentTypes.find(ct => ct.maLoaiNoiDung === typeId)?.tenLoaiNoiDung ||
                        (typeId === 1 ? 'Kết quả đạt được trong tuần' :
                         typeId === 2 ? 'Nội dung tuần sau' : 'Đề xuất, kiến nghị');

                      return (
                        <div key={`content-type-${typeId}`} className="mt-4">
                          <h5 className="text-sm font-semibold bg-orange-100 p-2 rounded-t-lg">{typeId === 1 ? 'I' : typeId === 2 ? 'II' : 'III'}. {typeName}</h5>
                          <Droppable droppableId={`source-type-${typeId}`}>
                            {(provided) => (
                              <div
                                className="bg-gray-200 p-3 rounded-b-lg max-h-[400px] overflow-y-auto"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {typeItems.length > 0 ? (
                                  typeItems.map((item, index) => (
                                    <React.Fragment key={`type-${typeId}-${index}`}>
                                      {renderDraggableItem(
                                        item,
                                        index,
                                        `source-type-${typeId}`,
                                        departments,
                                        contentTypes,
                                        selectedContentTypes,
                                        getWeek
                                      )}
                                    </React.Fragment>
                                  ))
                                ) : (
                                  <p className="text-gray-500 text-sm p-2">Kéo thả nội dung vào đây</p>
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                    {sourceItems.length === 0 && (
                      <div className="mt-4 bg-red-50 p-3 rounded text-red-500">
                        Không có nội dung báo cáo nào phù hợp với bộ lọc đã chọn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DragDropContext>
      </div>
    </ErrorBoundary>
  );
};

export default SmartReportsDashboard;