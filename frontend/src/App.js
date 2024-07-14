import { Route, Routes } from "react-router-dom";
import Home from "./Vitrine page/Home";
import Login from './Vitrine page/Login';
import Register from './Vitrine page/Register';
import HomeDashboard from "./scene/components/home/pages/HomeDashboard";
import { ThemeProvider as CustomThemeProvider } from "./scene/ThemeContext";
import ColisList from "./scene/components/colis/pages/ColisList";
import ColisPourRamassage from "./scene/components/colis/pages/ColisPourRamassage";
import AjouterColis from "./scene/components/colis/pages/AjouterColis";
import ColisImport from "./scene/components/colis/pages/ColisImport";
import ProduitList from "./scene/components/stock/pages/ProduitList";
import AjouterProduit from "./scene/components/stock/pages/AjouterProduit";
import ProduitColis from "./scene/components/stock/pages/ProduitColis";
import ColisStock from "./scene/components/stock/pages/ColisStock";
import Portfeuille from "./scene/components/portfeuille/page/Portfeuille";


function App() {
  return (
    <CustomThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route path='dashboard'>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="portfeuille" element={<Portfeuille />} />

            <Route path="list-colis" element={<ColisList />} />
            <Route path="colis-ar" element={<ColisPourRamassage />} />
            <Route path="ajouter-colis/:type" element={<AjouterColis />} />
            <Route path="import-colis" element={<ColisImport />} />

            <Route path="list-produit" element={<ProduitList />} />
            <Route path="ajouter-produit" element={<AjouterProduit />} />
            <Route path="ajouter-produit-colis" element={<ProduitColis />} />
            <Route path="colis-stock" element={<ColisStock />} />
            
          </Route>
        </Routes>
    </CustomThemeProvider>
  );
}

export default App;