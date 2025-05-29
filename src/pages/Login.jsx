import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "@/assets/logo-trg.png";

const Login = () => {
  const [username, setUsername] = useState(
    localStorage.getItem("rememberedUsername") || ""
  );
  const [password, setPassword] = useState(
    localStorage.getItem("rememberedPassword") || ""
  );
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true" || false
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("rememberMe", rememberMe.toString());
  }, [rememberMe]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://cds.bdu.edu.vn/bctm_bdu/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taiKhoan: username,
          matKhau: password,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        const maDonVi = data.giangVien?.maDonVi?.maDonVi || 1;
        const tenGiangVien = data.giangVien?.tenGiangVien || "";

        if (rememberMe) {
          localStorage.setItem("maDonVi", maDonVi);
          localStorage.setItem("tenGiangVien", tenGiangVien);
        } else {
          sessionStorage.setItem("maDonVi", maDonVi);
          sessionStorage.setItem("tenGiangVien", tenGiangVien);
        }

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Phản hồi API không đúng định dạng: Cần một đối tượng chứa thông tin người dùng");
        }

        const accessToken = data.access || (data.user && data.user.token) || data.token;
        const refreshToken = data.refresh || (data.user && data.user.token) || data.token;
        const userData = data.user || data;

        if (!accessToken) {
          throw new Error("Thiếu access token trong phản hồi API");
        }
        if (!userData || !userData.vaiTro) {
          throw new Error("Thiếu thông tin người dùng hoặc vai trò trong phản hồi API");
        }

        setSuccess("Đăng nhập thành công! Đang chuyển hướng...");

        const chucVu = data.giangVien?.chucVu || "";
        const tenDonVi = data.giangVien?.maDonVi?.tenDonVi || "";

        if (rememberMe) {
          localStorage.setItem("maDonVi", maDonVi);
          localStorage.setItem("tenGiangVien", tenGiangVien);
          localStorage.setItem("chucVu", chucVu);
          localStorage.setItem("tenDonVi", tenDonVi);
        } else {
          sessionStorage.setItem("maDonVi", maDonVi);
          sessionStorage.setItem("tenGiangVien", tenGiangVien);
          sessionStorage.setItem("chucVu", chucVu);
          sessionStorage.setItem("tenDonVi", tenDonVi);
        }

        if (rememberMe) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken || "");
          localStorage.setItem("userRole", userData.vaiTro);
          localStorage.setItem("rememberedUsername", username);
          localStorage.setItem("rememberedPassword", password);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken || "");
          sessionStorage.setItem("userRole", userData.vaiTro);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userRole");
        }

        setTimeout(() => {
          if (userData.vaiTro === "TDV") {
            navigate("/departmenthead");
          } else if (userData.vaiTro === "TKDV") {
            navigate("/notification");
          } else if (userData.vaiTro === "GV") {
            navigate("/notification");
          } else if (userData.vaiTro === "TKHT") {
            navigate("/statistical");
          } else {
            setError(data.detail || "Tài khoản chưa được cấp quyền truy cập hệ thống.");
            navigate("/");
          }
        }, 1500);
      } else {
        setError(data.detail || "Đăng nhập thất bại.");
        setSuccess("");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError(error.message || "Không thể kết nối đến máy chủ.");
      setSuccess("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#F5E6D3] fixed inset-0">
      <div className="text-center w-full px-4 sm:px-6 lg:px-8">
        <img src={logo} alt="BDU Logo" className="mx-auto mb-4 w-32 h-32" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
          BÁO CÁO THÔNG MINH BDU
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          Hệ thống quản lý báo cáo Trường Đại học Bình Dương
        </p>

        <div className="bg-white p-8 rounded-lg shadow-md mt-4 mx-auto w-full max-w-sm">
          <h2 className="text-lg font-semibold mb-4">Đăng nhập</h2>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {success && <p className="text-green-500 mb-2">{success}</p>}
          <form onSubmit={handleLogin}>
            <div className="relative mb-3">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tên đăng nhập"
                className="w-full border p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative mb-3">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full border p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mb-3 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="text-orange-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition"
            >
              Đăng nhập
            </button>
          </form>

          <p className="mt-3 text-sm">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-orange-600 hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
        <p className="mt-3 text-sm">
          © 2025 Trường Đại học Bình Dương. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;