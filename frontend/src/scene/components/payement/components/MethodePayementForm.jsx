import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography } from 'antd';
import { UploadOutlined, BankOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMethodePayement, updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { ThemeContext } from '../../../ThemeContext';

const { Title } = Typography;

function MethodePayementForm({ initialValues = {}, onSubmit, isUpdate = false, theme: propTheme }) {
    const { theme: contextTheme } = useContext(ThemeContext);
    const theme = propTheme || contextTheme;
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
        <Card
            style={{
                border: 'none',
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                boxShadow: 'none'
            }}
            styles={{
                body: {
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    padding: '0'
                }
            }}
        >
            <Title
                level={4}
                style={{
                    marginBottom: '24px',
                    textAlign: 'center',
                    color: theme === 'dark' ? '#fff' : '#262626',
                    fontWeight: '600'
                }}
            >
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
                    label={
                        <span style={{
                            color: theme === 'dark' ? '#fff' : '#262626',
                            fontWeight: '500'
                        }}>
                            Bank Name
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter the bank name!' },
                        { min: 2, message: 'Bank name must be at least 2 characters!' },
                        { max: 50, message: 'Bank name must not exceed 50 characters!' }
                    ]}
                >
                    <Input
                        prefix={
                            <BankOutlined
                                style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }}
                            />
                        }
                        placeholder="Enter Bank Name"
                        size="large"
                        style={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                            color: theme === 'dark' ? '#fff' : '#262626'
                        }}
                    />
                </Form.Item>

                {/* Image Upload */}
                <Form.Item
                    label={
                        <span style={{
                            color: theme === 'dark' ? '#fff' : '#262626',
                            fontWeight: '500'
                        }}>
                            {isUpdate ? "Change Bank Image" : "Upload Bank Image"}
                        </span>
                    }
                    required={!isUpdate}
                >
                    <Upload
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={handleFileChange}
                        listType="picture"
                        maxCount={1}
                        accept="image/*"
                        className={theme === 'dark' ? 'dark-upload' : ''}
                    >
                        <Button
                            icon={
                                <UploadOutlined
                                    style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }}
                                />
                            }
                            size="large"
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                color: theme === 'dark' ? '#fff' : '#262626',
                                borderStyle: 'dashed'
                            }}
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
                        style={{
                            backgroundColor: '#1890ff',
                            borderColor: '#1890ff',
                            fontWeight: '500',
                            height: '48px',
                            borderRadius: '8px'
                        }}
                    >
                        {isUpdate ? 'Update Payment Method' : 'Create Payment Method'}
                    </Button>
                </Form.Item>
            </Form>

            {/* Theme-aware styling */}
            <style jsx>{`
                .dark-upload .ant-upload-list {
                    background-color: ${theme === 'dark' ? '#262626' : '#fff'} !important;
                }

                .dark-upload .ant-upload-list-item {
                    background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                    border-color: ${theme === 'dark' ? '#434343' : '#d9d9d9'} !important;
                    color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                }

                .dark-upload .ant-upload-list-item-name {
                    color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                }

                .dark-upload .ant-upload-list-item-actions {
                    background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                }

                .dark-upload .ant-upload-list-item-actions .anticon {
                    color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                }
            `}</style>
        </Card>
    );
}

export default MethodePayementForm;
