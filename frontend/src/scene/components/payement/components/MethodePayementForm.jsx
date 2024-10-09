import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import request from '../../../../utils/request';

function MethodePayementForm() {
  const [fileList, setFileList] = useState([]); // State to store the selected image file
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the last file
  };

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error('Please upload an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', fileList[0].originFileObj); // Append the selected image file
    formData.append('bank', values.bank); // Append the bank name

    try {
      setIsLoading(true);

      // Send the POST request to your backend with axios
      const response = await request.post('/api/meth', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set correct content type for file upload
        },
      });

      // Handle the successful response
      message.success('Payment method created successfully');
      console.log(response.data); // Log the response for debugging

      // Redirect to /dashboard/payement/list after successful creation
      navigate('/dashboard/payement/list'); // Redirect user after success

    } catch (error) {
      // Handle errors
      console.error(error.response?.data || error.message);
      message.error('Failed to create payment method');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Test Create Payment Method</h2>
      <Form onFinish={handleSubmit} layout="vertical">
        {/* Upload Image */}
        <Form.Item
          label="Upload Bank Image"
          rules={[{ required: true, message: 'Please upload the bank image!' }]}
        >
          <Upload
            fileList={fileList}
            beforeUpload={() => false} // Prevent automatic upload
            onChange={handleFileChange} // Handle file changes
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        {/* Bank Name */}
        <Form.Item
          name="bank"
          label="Bank Name"
          rules={[{ required: true, message: 'Please enter the bank name!' }]}
        >
          <Input placeholder="Enter Bank Name" />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Payment Method
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default MethodePayementForm;
