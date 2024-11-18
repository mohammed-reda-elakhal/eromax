import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import uploadFiles from "../../../../redux/apiCalls/docApiCalls";
import { Upload, Button, Form, Typography, message, Alert } from "antd";
import { UploadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Menubar from "../../../global/Menubar";
import Topbar from "../../../global/Topbar";
import Title from "../../../global/Title";
import { ThemeContext } from "../../../ThemeContext";
import '../profile.css';

const { Title: AntTitle } = Typography;

function DocumentProfile() {
  const [fileList, setFileList] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { theme } = useContext(ThemeContext);

  const handleUpload = () => {
    if (fileList.length === 0) {
      return message.warning("Please select files to upload.");
    }


    const formData = new FormData();

    // Append files to FormData with correct field names
    fileList.forEach((file, index) => {
      // Append the first file to cinRecto, the second to cinVerso
      if (index === 0) {
        formData.append("cinRecto", file); // Use cinRecto for front side
      } else if (index === 1) {
        formData.append("cinVerso", file); // Use cinVerso for back side
      }
    });

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      //console.log(pair[0], pair[1]);
    }

    // Dispatch formData directly to API
    dispatch(uploadFiles(user.role, user._id, formData))
      .then(() => {
        message.success("Files are being uploaded!");
        setFileList([]); // Clear file list after successful submission
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

      // Prevent adding duplicate files to fileList
      setFileList((prevList) => {
        const isDuplicate = prevList.some((item) => item.uid === file.uid);
        if (isDuplicate) {
          message.warning("This file is already added.");
          return prevList;
        }
        return [...prevList, file]; // Add new file to list
      });

      return false; // Prevent auto-upload
    },
    fileList,
  };

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
            color: theme === 'dark' ? '#fff' : '#002242',
          }}
        >
          <div className="page-content-header">
            <Title nom='Documents' />
          </div>
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }}
          >
            <h4>Importer Vos Documents</h4>
            {/* Afficher le message avec l'icône en français */}
            <Alert
              message="Important"
              description="Veuillez vous assurer que vous téléchargez à la fois le recto et le verso de votre CIN pour la vérification."
              type="warning"
              icon={<ExclamationCircleOutlined />}
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <div className="container-profile" style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
              <AntTitle level={3} style={{ textAlign: "center" }}>Select Files to Upload</AntTitle>
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
                    disabled={fileList.length < 2} // Disable button if less than 2 files are selected
                    block
                  >
                    Upload
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentProfile;
