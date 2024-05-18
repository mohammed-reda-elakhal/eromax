import React from "react";
import { Route , Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
    </div>
  );
}

export default App;
