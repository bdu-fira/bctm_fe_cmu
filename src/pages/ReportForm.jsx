import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaMinus, FaTimes, FaRegFileAlt } from 'react-icons/fa';
import { User, LogOut, X } from 'lucide-react';
import logo from "@/assets/logo-trg.png";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ReportSection = ({
  id,
  title,
  maDanhMuc,
  danhMucList = [],
  initialRows = [{ id: 1, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' }],
  onDanhMucChange,
  onCustomDanhMucChange,
  onRemove,
  onContentChange,
  readOnly = false
}) => {
  const [sectionTitle, setSectionTitle] = useState(title);
  const [rows, setRows] = useState(initialRows);
  const [customDanhMuc, setCustomDanhMuc] = useState(maDanhMuc === 4 ? title : '');

  useEffect(() => {
    if (initialRows?.length > 0) {
      const initialIds = new Set(initialRows.map(r => r.id));
      const rowIds = new Set(rows.map(r => r.id));
      const needsUpdate = initialRows.length !== rows.length ||
        ![...initialIds].every(id => rowIds.has(id));
      if (needsUpdate) {
        setRows(initialRows);
      }
    } else if (initialRows.length === 0 && rows.length === 0) {
      setRows([{ id: 1, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' }]);
    }
  }, [initialRows]);

  useEffect(() => {
    if (title !== sectionTitle) {
      setSectionTitle(title);
    }
  }, [title]);

  const addRow = () => {
    const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow = { id: nextId, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' };
    const updated = [...rows, newRow];
    setRows(updated);
    onContentChange(id, updated);
  };

  const handleRowChange = (rowId, field, value) => {
    const updatedRows = rows.map(r =>
      r.id === rowId ? { ...r, [field]: value } : r
    );
    setRows(updatedRows);
    onContentChange(id, updatedRows);
  };

  const removeRow = rowId => {
    if (rows.length > 1) {
      const filtered = rows.filter(r => r.id !== rowId);
      setRows(filtered);
      onContentChange(id, filtered);
    }
  };

  const handleDanhMucChange = (e) => {
    const newMaDanhMuc = Number(e.target.value);
    onDanhMucChange(id, newMaDanhMuc);
    if (newMaDanhMuc === 4) {
      setCustomDanhMuc('');
      onCustomDanhMucChange(id, '');
    } else {
      const selected = danhMucList.find(dm => dm.maDanhMuc === newMaDanhMuc);
      setSectionTitle(selected?.tenDanhMuc || 'Danh mục mới');
      setCustomDanhMuc('');
    }
  };

  const handleCustomDanhMucChange = (e) => {
    const value = e.target.value;
    setCustomDanhMuc(value);
    setSectionTitle(value || 'Danh mục mới');
    onCustomDanhMucChange(id, value);
  };


  const isInDanhMucList = danhMucList.some(dm => dm.maDanhMuc === maDanhMuc);

  return (
    <div className="mb-6 border border-orange-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2 w-full">
          <FaRegFileAlt className="text-orange-400" />
          <select
            value={maDanhMuc || ''}
            onChange={handleDanhMucChange}
            className="p-2 bg-orange-100 text-orange-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-96"
            disabled={readOnly}
          >
            <option value="">Chọn danh mục</option>
            {danhMucList.map(dm => (
              <option key={dm.maDanhMuc} value={dm.maDanhMuc}>
                {dm.tenDanhMuc}
              </option>
            ))}
          
            {!danhMucList.some(dm => dm.maDanhMuc === 4) && (
              <option value="4">Khác</option>
            )}
           
            {!isInDanhMucList && maDanhMuc && maDanhMuc !== 4 && (
              <option value={maDanhMuc}>{title}</option>
            )}
          </select>
          {maDanhMuc === 4 && (
            <input
              type="text"
              value={customDanhMuc}
              onChange={handleCustomDanhMucChange}
              placeholder="Nhập tên danh mục tùy chỉnh"
              className="p-2 bg-orange-100 text-orange-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 w-96"
              disabled={readOnly}
            />
          )}
        </div>
        {!readOnly && (
          <button onClick={() => onRemove(id)} className="p-2 text-red-500 hover:text-red-600">
            <FaTimes />
          </button>
        )}
      </div>
      {rows.map(row => (
        <div key={row.id} className="grid grid-cols-3 gap-3 mb-3 text-gray-700">
          <textarea
            className="w-full p-2 bg-white border border-orange-200 rounded-md min-h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="I. Kết quả đạt được trong tuần *"
            value={row.ketQua}
            onChange={e => handleRowChange(row.id, 'ketQua', e.target.value)}
            disabled={readOnly}
          />
          <textarea
            className="w-full p-2 bg-white border border-orange-200 rounded-md min-h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="II. Nội dung tuần sau"
            value={row.noiDungTuanSau}
            onChange={e => handleRowChange(row.id, 'noiDungTuanSau', e.target.value)}
            disabled={readOnly}
          />
          <div className="relative">
            <textarea
              className="w-full p-2 bg-white border border-orange-200 rounded-md min-h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="III. Đề xuất, kiến nghị"
              value={row.deXuatKienNghi}
              onChange={e => handleRowChange(row.id, 'deXuatKienNghi', e.target.value)}
              disabled={readOnly}
            />
            {!readOnly && (
              <div className="absolute right-0 top-0 flex flex-col gap-2">
                <button type="button" onClick={addRow} className="bg-orange-100 hover:bg-orange-200 p-2 rounded-md text-orange-600">
                  <FaPlus />
                </button>
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeRow(row.id)} className="bg-orange-100 hover:bg-orange-200 p-2 rounded-md text-orange-600">
                    <FaMinus />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


export default function ReportForm() {
  const navigate = useNavigate();
  const { maBaoCao, maDonVi } = useParams();
  const reportId = Number(maBaoCao);

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [reportContent, setReportContent] = useState({});
  const [userRole, setUserRole] = useState('');
  const [unitId, setUnitId] = useState(1);
  const [danhMucList, setDanhMucList] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customDanhMucNames, setCustomDanhMucNames] = useState({});

  
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Không tìm thấy token');
  
        const res = await fetch(
          `https://cds.bdu.edu.vn/bctm_bdu/api/chitietbaocao/${reportId}/`,
          { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Lấy chi tiết báo cáo thất bại');
        }
  
        const data = await res.json();
        const isReportLocked = data.trangThai === 'Chờ duyệt' || data.trangThai === 'Hoàn thành';
        setReadOnly(isReportLocked);
        setIsSubmitted(data.trangThai === 'Chờ duyệt' || data.trangThai === 'Hoàn thành');
  
     
        const newSections = data.danhMuc.map(dm => ({
          id: dm.maDMBC,
          maDanhMuc: dm.maDanhMuc,
          title: dm.maDanhMuc === 4 ? (dm.tenDanhMuc || '') : (dm.tenDanhMuc || `Danh mục ${dm.maDanhMuc}`)
        }));
        setSections(newSections);
  
       
        const contentMap = {};
        const customNames = {};
        data.danhMuc.forEach(dm => {
        
          const rowsMap = {};
          dm.noiDung.forEach(nd => {
          
            const rowId = Math.floor((nd.maNoiDung - dm.noiDung[0].maNoiDung) / 3) + 1;
            if (!rowsMap[rowId]) {
              rowsMap[rowId] = { id: rowId, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' };
            }
            if (nd.maLoaiNoiDung === 1) rowsMap[rowId].ketQua = nd.noiDung;
            if (nd.maLoaiNoiDung === 2) rowsMap[rowId].noiDungTuanSau = nd.noiDung;
            if (nd.maLoaiNoiDung === 3) rowsMap[rowId].deXuatKienNghi = nd.noiDung;
          });
  
       
          const rows = Object.values(rowsMap).sort((a, b) => a.id - b.id);
          contentMap[dm.maDMBC] = rows.length > 0 ? rows : [{ id: 1, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' }];
  
          if (dm.maDanhMuc === 4 && dm.tenDanhMuc) {
            customNames[dm.maDMBC] = dm.tenDanhMuc;
          }
        });
        setReportContent(contentMap);
        setCustomDanhMucNames(customNames);
      } catch (error) {
        console.error('Lỗi khi load chi tiết báo cáo:', error);
        toast.error(`Lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [reportId]);


  useEffect(() => {
    const fetchDanhMuc = async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) return navigate('/');
      try {
        const res = await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/danhmucbaocao/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          toast.info('Phiên làm việc đã hết, mời đăng nhập lại.');
          return navigate('/');
        }
        if (!res.ok) throw new Error(await res.text() || 'Không thể lấy danh mục');
        const data = await res.json();
        setDanhMucList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        toast.error(`Không thể tải danh mục: ${error.message}`);
      }
    };
    fetchDanhMuc();
  }, [navigate]);


  useEffect(() => {
    const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const donVi = localStorage.getItem('maDonVi') || sessionStorage.getItem('maDonVi');
    const tenGiangVien = localStorage.getItem('tenGiangVien') || sessionStorage.getItem('tenGiangVien');
    const chucVu = localStorage.getItem('chucVu') || sessionStorage.getItem('chucVu');
    const tenDonVi = localStorage.getItem('tenDonVi') || sessionStorage.getItem('tenDonVi');

    if (!role || !token) return navigate('/');
    setUserRole(role);
    setUnitId(parseInt(donVi, 10) || 1);
    setUserInfo({
      tenGiangVien: tenGiangVien || 'Không xác định',
      chucVu: chucVu || 'Không xác định',
      tenDonVi: tenDonVi || 'Không xác định',
      vaiTro: role || 'Không xác định',
    });
  }, [navigate]);


  const handleContentChange = (sectionId, rows) => {
    setReportContent(prev => ({ ...prev, [sectionId]: rows }));
  };


  const handleDanhMucChange = (sectionId, maDanhMuc) => {
    const selected = danhMucList.find(dm => dm.maDanhMuc === maDanhMuc);
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, maDanhMuc, title: selected?.tenDanhMuc || s.title } : s
    ));
  };


  const handleCustomDanhMucChange = (sectionId, tenDanhMuc) => {
    setCustomDanhMucNames(prev => ({ ...prev, [sectionId]: tenDanhMuc }));
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, title: tenDanhMuc || 'Danh mục mới' } : s
    ));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      await fetch('https://cds.bdu.edu.vn/bctm_bdu/api/logout/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
    }
  };


  const handleSubmitReport = async () => {
    try {
      for (let sec of sections) {
        if (!sec.maDanhMuc) {
          return toast.warn(`Chưa chọn danh mục cho mục "${sec.title}"`);
        }
        if (sec.maDanhMuc === 4 && !customDanhMucNames[sec.id]) {
          return toast.warn(`Chưa nhập tên danh mục tùy chỉnh cho mục "${sec.title}"`);
        }
      }
      const payload = sections.map(sec => ({
        maDanhMuc: Number(sec.maDanhMuc),
        ...(sec.maDanhMuc === 4 && { tenDanhMuc: customDanhMucNames[sec.id] || 'Khác' }),
        noiDung: (reportContent[sec.id] || []).map(row => ({
          ketQua: row.ketQua,
          noiDungTuanSau: row.noiDungTuanSau,
          deXuatKienNghi: row.deXuatKienNghi
        }))
      })).filter(item => item.noiDung.length > 0);

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token');

      const res = await fetch(
        `https://cds.bdu.edu.vn/bctm_bdu/api/capnhatnoidungbaocao/${reportId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.message || JSON.stringify(errBody));
      }

      const data = await res.json();
      toast.success(data.message || 'Gửi báo cáo thành công!');
      setReadOnly(true);
      setIsSubmitted(true);

    } catch (error) {
      console.error('Lỗi gửi báo cáo:', error);
      toast.error(`Lỗi: ${error.message}`);
    }
  };

 
  const addSection = () => {
    const nextId = sections.length ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    setSections(prev => [...prev, { id: nextId, title: 'Danh mục mới' }]);
    setReportContent(prev => ({
      ...prev,
      [nextId]: [{ id: 1, ketQua: '', noiDungTuanSau: '', deXuatKienNghi: '' }]
    }));
  };

 
  const removeSection = id => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(s => s.id !== id));
      setReportContent(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setCustomDanhMucNames(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col h-screen bg-[#F5E6D3] fixed inset-0">
      <ToastContainer position="top-right" autoClose={5000} />
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="BDU Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold">BDU Smart Reports</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={openModal}
            className="flex items-center bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-300 transition-all duration-300"
          >
            <User className="mr-2 h-5 w-5" />
            {userInfo.tenGiangVien || userRole}
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

      {/* Modal thông tin người dùng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Thông tin người dùng</h2>
            <div className="space-y-3 text-gray-600">
              <p><span className="font-semibold">Họ và tên:</span> {userInfo.tenGiangVien}</p>
              <p><span className="font-semibold">Chức vụ:</span> {userInfo.chucVu}</p>
              <p><span className="font-semibold">Đơn vị:</span> {userInfo.tenDonVi}</p>
              <p><span className="font-semibold">Vai trò:</span> {userInfo.vaiTro}</p>
            </div>
            <button
              onClick={closeModal}
              className="mt-6 w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <main className="pt-24 pb-8 px-6 w-full">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 max-h-[80vh] overflow-y-auto border border-orange-200">
          <div className="mb-4 flex items-center space-x-2">
            <FaRegFileAlt className="text-orange-400 text-2xl" />
            <h2 className="text-xl font-semibold text-orange-600">
              {readOnly ? 'Xem Báo Cáo Tuần' : 'Tạo Báo Cáo Tuần'}
            </h2>
          </div>
          {sections.map(section => (
            <ReportSection
              key={section.id}
              id={section.id}
              title={section.title}
              maDanhMuc={section.maDanhMuc}
              danhMucList={danhMucList}
              initialRows={reportContent[section.id] || []}
              onRemove={removeSection}
              onContentChange={handleContentChange}
              onDanhMucChange={handleDanhMucChange}
              onCustomDanhMucChange={handleCustomDanhMucChange}
              readOnly={readOnly}
            />
          ))}
          <div className="flex justify-between items-center mt-6">
            {!isSubmitted && !readOnly && (
              <>
                <button
                  onClick={addSection}
                  className="bg-orange-200 text-orange-800 px-4 py-2 rounded-md hover:bg-orange-300 flex items-center"
                >
                  <FaPlus className="inline mr-2" />Thêm danh mục
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
                >
                  <FaRegFileAlt className="inline mr-2" />Gửi báo cáo
                </button>
              </>
            )}
            {(isSubmitted || readOnly) && (
              <button
                onClick={() => navigate(-1)}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
              >
                Quay lại
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}