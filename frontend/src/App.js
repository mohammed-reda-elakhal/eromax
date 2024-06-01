import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import HomeDashboard from "./scene/dashboard/HomeDashboard";
import { ThemeProvider as CustomThemeProvider } from "./scene/ThemeContext";

function App() {
  return (
    <CustomThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard/home" element={<HomeDashboard />} />
        </Routes>
    </CustomThemeProvider>
  );
}

export default App;