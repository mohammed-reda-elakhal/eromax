// StoreForm.js

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createStore, updateStore } from '../../../../redux/apiCalls/storeApiCalls';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

function StoreForm({ onClose, initialValues = {}, isEdit = false }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isEdit && initialValues) {
      form.setFieldsValue({
        storeName: initialValues.storeName,
        adress: initialValues.adress,
        tele: initialValues.tele,
        Bio: initialValues.Bio,
        message: initialValues.message
      });
      if (initialValues.image && initialValues.image.url) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Image',
            status: 'done',
            url: initialValues.image.url,
          },
        ]);
      }
    }
  }, [isEdit, initialValues, form]);

  const onFinish = async (values) => {
    try {
      const { storeName, adress, tele, Bio, message } = values;

      const storeData = {
        storeName,
        adress,
        tele,
        Bio,
        message
      };

      if (isEdit) {
        // Dispatch updateStore
        await dispatch(updateStore(initialValues._id, storeData, imageFile));
      } else {
        // Dispatch createStore
        const userCookie = localStorage.getItem('user');
        const userId = userCookie ? JSON.parse(userCookie)._id : null;
        if (!userId) {
          toast.error("User not found");
          return;
        }
        await dispatch(createStore(userId, storeData, imageFile));
        toast.success("Store created successfully");
      }
      onClose();
      form.resetFields();
      setFileList([]);
      setImageFile(null);
    } catch (error) {
      toast.error("Failed to submit form");
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      setImageFile(fileList[0].originFileObj);
    } else {
      setImageFile(null);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        label="Store Name"
        name="storeName"
        rules={[{ required: true, message: 'Please enter the store name' }]}
      >
        <Input placeholder="Enter store name" />
      </Form.Item>

      <Form.Item
        label="Address"
        name="adress"
      >
        <Input placeholder="Enter address" />
      </Form.Item>

      <Form.Item
        label="Telephone"
        name="tele"
      >
        <Input placeholder="Enter telephone number" />
      </Form.Item>

      <Form.Item
        label="Bio"
        name="Bio"
      >
        <Input.TextArea placeholder="Enter bio" />
      </Form.Item>

      <Form.Item
        label="Message"
        name="message"
      >
        <Input.TextArea placeholder="Enter Message afficher sur ticket ....." />
      </Form.Item>

      <Form.Item
        label="Store Image"
        name="image"
      >
        <Upload
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleUploadChange}
          fileList={fileList}
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? "Update Store" : "Create Store"}
        </Button>
        <Button style={{ marginLeft: '10px' }} onClick={onClose}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
}

export default StoreForm;
