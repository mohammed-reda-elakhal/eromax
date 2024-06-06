import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import HomeDashboard from "./scene/dashboard/HomeDashboard";
import { ThemeProvider as CustomThemeProvider } from "./scene/ThemeContext";
import ColisList from "./scene/components/colis/pages/ColisList";
import ColisPourRamassage from "./scene/components/colis/pages/ColisPourRamassage";
import AjouterColis from "./scene/components/colis/pages/AjouterColis";
import ColisImport from "./scene/components/colis/pages/ColisImport";

function App() {
  return (
    <CustomThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route path='dashboard'>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="list-colis" element={<ColisList />} />
            <Route path="colis-ar" element={<ColisPourRamassage />} />
            <Route path="ajouter-colis" element={<AjouterColis />} />
            <Route path="import-colis" element={<ColisImport />} />
          </Route>
        </Routes>
    </CustomThemeProvider>
  );
}

export default App;