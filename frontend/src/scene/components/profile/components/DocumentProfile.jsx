// DocumentProfile.js

import React, { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Button, Typography, message, Spin, Image, Card, Row, Col, Modal } from "antd";
import { SendOutlined, UploadOutlined } from "@ant-design/icons";
import Menubar from "../../../global/Menubar";
import Topbar from "../../../global/Topbar";
import Title from "../../../global/Title";
import { ThemeContext } from "../../../ThemeContext";
import { uploadFiles, fetchUserDocuments } from "../../../../redux/apiCalls/docApiCalls";
import "../DocumentProfile.css";

const { Title: AntTitle } = Typography;

function DocumentProfile() {
  // State for managing single file uploads
  const [fileRecto, setFileRecto] = useState(null);
  const [fileVerso, setFileVerso] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state for viewing documents
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // User data
  const { theme } = useContext(ThemeContext);
  
  // Select documents, loading, and error from Redux state
  const { files, loading, error } = useSelector((state) => state.file);

  // Fetch user documents on component mount
  useEffect(() => {
    if (user && user.role && user._id) {
      dispatch(fetchUserDocuments(user.role, user._id))
        .catch(() => {
          // Handle fetch error if needed
        });
    }
  }, [dispatch, user]);

  // Function to handle file upload
  const handleUpload = () => {
    if (!fileRecto || !fileVerso) {
      return message.warning("Veuillez ajouter les deux fichiers avant de soumettre.");
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("cinRecto", fileRecto);
    formData.append("cinVerso", fileVerso);

    dispatch(uploadFiles(user.role, user._id, formData))
      .then(() => {
        message.success("Documents soumis avec succès !");
        setFileRecto(null);
        setFileVerso(null);
      })
      .catch(() => {
        message.error("Erreur lors de la soumission des documents.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Configuration for Upload component (CIN Recto)
  const uploadPropsRecto = {
    onRemove: () => {
      setFileRecto(null);
    },
    beforeUpload: (file) => {
      setFileRecto(file);
      return false; // Prevent automatic upload
    },
    fileList: fileRecto ? [fileRecto] : [],
  };

  // Configuration for Upload component (CIN Verso)
  const uploadPropsVerso = {
    onRemove: () => {
      setFileVerso(null);
    },
    beforeUpload: (file) => {
      setFileVerso(file);
      return false; // Prevent automatic upload
    },
    fileList: fileVerso ? [fileVerso] : [],
  };

  // Function to open the modal with selected document
  const showDocumentModal = (doc) => {
    setSelectedDocument(doc);
    setIsModalVisible(true);
  };

  // Function to close the modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDocument(null);
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
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }} 
          >
            {/* Documents Section */}
            <div className="profile-documents">
              {loading ? (
                <Spin size="large" />
              ) : (
                <>
                  {files.length > 0 ? (
                    <div>
                      <AntTitle level={4}>Vos Documents</AntTitle>
                      <Row gutter={[16, 16]}>
                        {files.map((doc) => (
                          <Col xs={24} sm={12} md={8} key={doc.id}>
                            <Card
                              hoverable
                              cover={<Image alt={`CIN Recto ${doc.id}`} src={doc.cinRecto.url} />}
                              onClick={() => showDocumentModal(doc)}
                            >
                              <Card.Meta
                                title={`${doc.type}`}
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ) : (
                    <div className="document-upload-section">
                      <AntTitle level={4}>Télécharger vos documents</AntTitle>
                      <div className="upload-forms">
                        <div className="upload-section">
                          <AntTitle level={5}>C.I.N - Recto</AntTitle>
                          <Upload {...uploadPropsRecto}>
                            <Button className="button-importer" icon={<UploadOutlined />}>
                              Importer
                            </Button>
                          </Upload>
                        </div>
                        <div className="upload-section">
                          <AntTitle level={5}>C.I.N - Verso</AntTitle>
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
                            disabled={isSubmitting || !fileRecto || !fileVerso}
                            icon={<SendOutlined />}
                          >
                            {isSubmitting ? "Envoyer en cours..." : "Envoyer"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Optional: Error message display */}
              {error && (
                <Typography.Text type="danger">{error}</Typography.Text>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Modal to display selected document */}
      <Modal
        title={selectedDocument ? `Document ID: ${selectedDocument.id}` : "Document"}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Fermer
          </Button>
        ]}
      >
        {selectedDocument && (
          <div>
            <AntTitle level={5}>CIN Recto</AntTitle>
            <Image src={selectedDocument.cinRecto.url} alt="CIN Recto" />
            <AntTitle level={5}>CIN Verso</AntTitle>
            <Image src={selectedDocument.cinVerso.url} alt="CIN Verso" />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DocumentProfile;
