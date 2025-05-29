import { Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "@/assets/logo-trg.png";
const Register = () => {
    return (
        <div className="flex justify-center items-center min-h-screen w-full bg-[#F5E6D3] fixed inset-0">
            <div className="text-center max-w-md w-full px-4">
                <img
                    src={logo}
                    alt="BDU Logo"
                    className="mx-auto mb-4 w-32 h-32"
                />
                <h1 className="text-3xl font-bold text-orange-600">BÁO CÁO THÔNG MINH BDU</h1>
                <p className="text-gray-600">Hệ thống quản lý báo cáo Trường Đại học Bình Dương</p>

                <div className="bg-white p-8 rounded-lg shadow-lg mt-6">
                    <h2 className="text-2xl font-semibold mb-6">Đăng ký</h2>

                    <div className="relative mb-4">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FaUser />
                        </span>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            className="w-full border p-2 pl-10 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <div className="relative mb-6">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FaLock />
                        </span>
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full border p-2 pl-10 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors">
                        Đăng ký
                    </button>

                    <p className="mt-4">
                        Đã có tài khoản? <Link to="/" className="text-orange-600 hover:text-orange-700">Đăng nhập!</Link>
                    </p>
                </div>
                <p className="mt-3 text-sm">
                    © 2025 Trường Đại học Bình Dương. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Register;
