import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ReportForm from "./pages/ReportForm";
import ReportList from "./pages/ReportList";
import DepartmentHead from "./pages/departmenthead";
import SmartReportsDashboard from "./pages/statistical";
import Notification from "./pages/Notification";

import ReportTemplate from "./pages/ReportTemplate";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/register" element={<Register />} />

        <Route path="/create-report/:maBaoCao/:maDonVi" element={<ReportForm />} />
        <Route path="/reports" element={<ReportList />} />
        <Route path="/departmenthead" element={<DepartmentHead />} />
        <Route path="/statistical" element={<SmartReportsDashboard />} />
        <Route path="/ReportTemplate" element={<ReportTemplate />} />
       
      </Routes>
    </Router>
  </React.StrictMode>
);
