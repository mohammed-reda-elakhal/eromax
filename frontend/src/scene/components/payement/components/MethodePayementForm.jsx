import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMethodePayement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';

function MethodePayementForm({ initialValues = {}, onSubmit, isUpdate = false }) {
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (initialValues.image && initialValues.image.url) {
            setFileList([
                {
                    uid: '-1',
                    name: 'current-image.jpg',
                    status: 'done',
                    url: initialValues.image.url,
                },
            ]);
        }
    }, [initialValues]);

    const handleFileChange = ({ fileList }) => {
        setFileList(fileList.slice(-1)); // Keep only the last file
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('image', fileList[0].originFileObj); // Append the selected image file
        }

        if (values.bank) {
            formData.append('bank', values.bank); // Append the bank name
        }

        try {
            setIsLoading(true);
            if (isUpdate) {
                await dispatch(updateMethPayement(initialValues._id, formData));
                message.success('Payment method updated successfully');
            } else {
                await dispatch(createMethodePayement(formData));
                message.success('Payment method created successfully');
            }
            if (onSubmit) onSubmit();
        } catch (error) {
            console.error(error);
            message.error('Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '100%', padding: '20px' }}>
            <Form onFinish={handleSubmit} layout="vertical" initialValues={{ bank: initialValues.Bank }}>
                {/* Upload Image */}
                {!isUpdate && (
                    <Form.Item
                        label="Upload Bank Image"
                        rules={[{ required: !isUpdate, message: 'Please upload the bank image!' }]}
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
                )}

                {/* If updating and optionally allow image change */}
                {isUpdate && (
                    <Form.Item
                        label="Change Bank Image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                    >
                        <Upload
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={handleFileChange}
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </Form.Item>
                )}

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
                        {isUpdate ? 'Update Payment Method' : 'Create Payment Method'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MethodePayementForm;
