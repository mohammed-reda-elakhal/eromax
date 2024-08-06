import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;

const ImportFileColis = ({ theme }) => {
  const [fileList, setFileList] = useState([]);

  const handleFileChange = (info) => {
    const { status, name } = info.file;

    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }

    if (status === 'done') {
      message.success(`${name} file uploaded successfully.`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData);
        // You can now send jsonData to your backend for storage
      };
      reader.readAsArrayBuffer(info.file.originFileObj);
    } else if (status === 'error') {
      message.error(`${name} file upload failed.`);
    }

    setFileList(info.fileList);
  };

  const handleDrop = (e) => {
    console.log('Dropped files', e.dataTransfer.files);
  };

  return (
    <Dragger
      name="file"
      multiple={false}
      accept=".xlsx, .xls"
      fileList={fileList}
      onChange={handleFileChange}
      onDrop={handleDrop}
      style={theme === 'dark' ? {
        backgroundColor: '#1e1e1e',
        borderColor: '#444',
        color: 'white',
      } : {}}
    >
      <p className="ant-upload-drag-icon" style={theme === 'dark' ? { color: 'white' } : {}}>
        <InboxOutlined />
      </p>
      <p className="ant-upload-text" style={theme === 'dark' ? { color: 'white' } : {}}>
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint" style={theme === 'dark' ? { color: 'rgba(255, 255, 255, 0.65)' } : {}}>
        Support for single Excel file upload. Strictly prohibited from uploading company data or other banned files.
      </p>
    </Dragger>
  );
};

export default ImportFileColis;
