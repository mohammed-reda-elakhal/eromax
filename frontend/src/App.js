import React from "react";
import { Route , Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import DashboardHome from "./dashboard/dashboard pages/DashboardHome";

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          <Route path="/dashboard" element={<DashboardHome/>} />
        </Routes>
    </div>
  );
}

export default App;
