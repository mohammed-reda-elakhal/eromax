import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Button, Typography, message, Divider } from "antd";
import { SaveOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import Menubar from "../../../global/Menubar";
import Topbar from "../../../global/Topbar";
import Title from "../../../global/Title";
import { ThemeContext } from "../../../ThemeContext";
import { uploadFiles } from "../../../../redux/apiCalls/docApiCalls";
import "../DocumentProfile.css";

const { Title: AntTitle } = Typography;

function DocumentProfile() {
  const [fileListRecto, setFileListRecto] = useState([]); // Liste des fichiers pour CIN Recto
  const [fileListVerso, setFileListVerso] = useState([]); // Liste des fichiers pour CIN Verso
  const [isSubmitting, setIsSubmitting] = useState(false); // Nouvel état

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Données utilisateur
  const { theme } = useContext(ThemeContext);

  // Fonction pour gérer la soumission des fichiers
  const handleUpload = () => {
    if (fileListRecto.length === 0 || fileListVerso.length === 0) {
      return message.warning("Veuillez ajouter les deux fichiers avant de soumettre.");
    }
    setIsSubmitting(true); // Début de la soumission
    const formData = new FormData();
    fileListRecto.forEach((file) => formData.append("cinRecto", file));
    fileListVerso.forEach((file) => formData.append("cinVerso", file));
    setIsSubmitting(false); // Fin de la soumission


    dispatch(uploadFiles(user.role, user._id, formData))
      .then(() => {
        message.success("Documents soumis avec succès !");
        setFileListRecto([]);
        setFileListVerso([]);
      })
      .catch(() => {
        message.error("Erreur lors de la soumission des documents.");
      });
  };

  // Configuration pour le composant Upload (CIN Recto)
  const uploadPropsRecto = {
    onRemove: (file) => {
      setFileListRecto((prevList) => prevList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileListRecto((prevList) => [...prevList, file]);
      return false;
    },
    fileList: fileListRecto,
  };

  // Configuration pour le composant Upload (CIN Verso)
  const uploadPropsVerso = {
    onRemove: (file) => {
      setFileListVerso((prevList) => prevList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileListVerso((prevList) => [...prevList, file]);
      return false;
    },
    fileList: fileListVerso,
  };

  return (
    <div className="page-dashboard">
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === "dark" ? "#002242" : "var(--gray1)",
            color: theme === "dark" ? "#fff" : "#002242",
          }}
        >
          <div className="page-content-header">
            <Title nom="Documents" />
          </div>
          <div className="profile-container">
            {/* Section de profil */}
            <div className="profile-sidebar">
              <img
                src={user.profile?.url || "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"}
                alt="Profile"
                className="profile-avatar"
              />
              <h3>{user.username || "Username"}</h3>
              <p>{user.email || "ennouaranass@gmail.com"}</p>
              <p>{user.tele || "0618480821"}</p>
              <div className="profile-info">
                <p><strong>Nom Complet :</strong> {user.nom || "Nom"} {user.prenom}</p>
                <p><strong>C.I.N :</strong> <span className="cin-highlight">{user.cin || "EE348643"}</span></p>
                <p><strong> email :</strong> {user.email || "ennouaranass@gmail.com"}</p>
                <p><strong>Téléphone :</strong> {user.tele || "11111111111"}</p>
                <p><strong>Ville :</strong> {user.ville || "Ville"}</p>
                <p><strong>Adresse :</strong> {user.adresse || "Adresse"}</p>
              </div>
            </div>

            {/* Section Documents */}
            <div className="profile-documents">
              <div className="document-upload-section">
                <AntTitle level={4}>C.I.N - Recto</AntTitle>
                <Upload {...uploadPropsRecto}>
                  <Button className="button-importer" icon={<UploadOutlined />}>
                    Importer
                  </Button>
                </Upload>

              </div>
              <div className="document-upload-section">
                <AntTitle level={4}>C.I.N - Verso</AntTitle>
                <Upload {...uploadPropsVerso}>
                  <Button className="button-importer" icon={<UploadOutlined />}>
                    Importer
                  </Button>            
                </Upload>
              </div>
              <div className="submit-section">
                <Button
                  type="primary"
                  className={isSubmitting ? "submitting" : ""}
                  style={{ marginTop: "20px", width: "100%" }}
                  onClick={handleUpload}
                  disabled={isSubmitting || fileListRecto.length === 0 || fileListVerso.length === 0}
                  icon={<SendOutlined />}
                >
          {isSubmitting ? "Soumission en cours..." : "Soumettre les documents"}
          </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentProfile;
