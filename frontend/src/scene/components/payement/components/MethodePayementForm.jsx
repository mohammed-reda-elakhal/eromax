import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography } from 'antd';
import { UploadOutlined, BankOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMethodePayement, updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';

const { Title } = Typography;

function MethodePayementForm({ initialValues = {}, onSubmit, isUpdate = false }) {
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
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
        form.setFieldsValue({
            bank: initialValues.Bank
        });
    }, [initialValues, form]);

    const handleFileChange = ({ fileList }) => {
        setFileList(fileList.slice(-1)); // Keep only the last file
    };

    const handleSubmit = async (values) => {
        try {
            setIsLoading(true);
            const formData = new FormData();

            // Add bank name
            formData.append('bank', values.bank);

            // Add image if it's a new file
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

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
            message.error(error.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card style={{ border: 'none' }}>
            <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>
                {isUpdate ? 'Update Payment Method' : 'Add New Payment Method'}
            </Title>
            
            <Form 
                form={form}
                onFinish={handleSubmit} 
                layout="vertical"
                initialValues={{ bank: initialValues.Bank }}
            >
                {/* Bank Name */}
                <Form.Item
                    name="bank"
                    label="Bank Name"
                    rules={[
                        { required: true, message: 'Please enter the bank name!' },
                        { min: 2, message: 'Bank name must be at least 2 characters!' },
                        { max: 50, message: 'Bank name must not exceed 50 characters!' }
                    ]}
                >
                    <Input 
                        prefix={<BankOutlined />}
                        placeholder="Enter Bank Name"
                        size="large"
                    />
                </Form.Item>

                {/* Image Upload */}
                <Form.Item
                    label={isUpdate ? "Change Bank Image" : "Upload Bank Image"}
                    required={!isUpdate}
                >
                    <Upload
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        listType="picture"
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button 
                            icon={<UploadOutlined />}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            Click to Upload
                        </Button>
                    </Upload>
                </Form.Item>

                {/* Submit Button */}
                <Form.Item style={{ marginTop: '32px' }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isLoading}
                        size="large"
                        block
                    >
                        {isUpdate ? 'Update Payment Method' : 'Create Payment Method'}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default MethodePayementForm;
