import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Button, Form, Typography, message, Alert, List } from "antd";
import { UploadOutlined, ExclamationCircleOutlined, FileOutlined } from "@ant-design/icons";
import Menubar from "../../../global/Menubar";
import Topbar from "../../../global/Topbar";
import Title from "../../../global/Title";
import { ThemeContext } from "../../../ThemeContext";
import { fetchUserDocuments, fetchUserFiles, uploadFiles } from "../../../../redux/apiCalls/docApiCalls";
import "../profile.css";

const { Title: AntTitle } = Typography;

function DocumentProfile() {
  const [fileList, setFileList] = useState([]);
  const [userFiles, setUserFiles] = useState(null); // State for existing user files
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { theme } = useContext(ThemeContext);

  // Fetch user files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const files = await fetchUserDocuments(user.role, user._id); // API call to fetch files
        setUserFiles(files); // Update state with fetched files
      } catch (error) {
        message.error("Error fetching user files.");
      }
    };
    fetchFiles();
  }, [user.role, user._id]);

  const handleUpload = () => {
    if (fileList.length === 0) {
      return message.warning("Please select files to upload.");
    }

    const formData = new FormData();
    fileList.forEach((file, index) => {
      if (index === 0) {
        formData.append("cinRecto", file); // Use cinRecto for front side
      } else if (index === 1) {
        formData.append("cinVerso", file); // Use cinVerso for back side
      }
    });

    dispatch(uploadFiles(user.role, user._id, formData))
      .then(() => {
        message.success("Files are being uploaded!");
        setFileList([]);
        setUserFiles(["cinRecto", "cinVerso"]); // Update state to simulate uploaded files
      })
      .catch(() => {
        message.error("An error occurred during file upload.");
      });
  };

  const props = {
    onRemove: (file) => {
      setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList((prevList) => {
        const isDuplicate = prevList.some((item) => item.uid === file.uid);
        if (isDuplicate) {
          message.warning("This file is already added.");
          return prevList;
        }
        return [...prevList, file];
      });
      return false; // Prevent auto-upload
    },
    fileList,
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
              backgroundColor: theme === "dark" ? "#001529" : "#fff",
            }}
          >
            {userFiles && userFiles.length > 0 ? (
              <div>
                <AntTitle level={3}>Vos Documents Téléchargés</AntTitle>
                <List
                  dataSource={userFiles}
                  renderItem={(file) => (
                    <List.Item>
                      <FileOutlined /> {file}
                      <Button
                        type="link"
                        href={`/path-to-files/${file}`}
                        target="_blank"
                        style={{ marginLeft: "auto" }}
                      >
                        Télécharger
                      </Button>
                    </List.Item>
                  )}
                  style={{ marginTop: "20px" }}
                />
              </div>
            ) : (
              <div>
                <h4>Importer Vos Documents</h4>
                <Alert
                  message="Important"
                  description="Veuillez vous assurer que vous téléchargez à la fois le recto et le verso de votre CIN pour la vérification."
                  type="warning"
                  icon={<ExclamationCircleOutlined />}
                  showIcon
                  style={{ marginBottom: "20px" }}
                />
                <div
                  className="container-profile"
                  style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}
                >
                  <AntTitle level={3} style={{ textAlign: "center" }}>
                    Select Files to Upload
                  </AntTitle>
                  <Form layout="vertical">
                    <Form.Item label="Select Files">
                      <Upload {...props} multiple>
                        <Button icon={<UploadOutlined />}>Select Files</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={fileList.length < 2}
                        block
                      >
                        Upload
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentProfile;
