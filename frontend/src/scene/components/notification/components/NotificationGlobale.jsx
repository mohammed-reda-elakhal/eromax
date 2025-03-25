// NotificationGlobale.jsx

import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { Button, Switch, Drawer, Form, Input, Space, Modal, Select, Tag } from 'antd';
import { FaPenToSquare, FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { getNotification, createNotification, updateNotification, deleteNotification } from '../../../../redux/apiCalls/notificationApiCalls';
import { notificationActions } from '../../../../redux/slices/notificationSlice';

function NotificationGlobale({ theme }) {
    const dispatch = useDispatch();
    const { notification } = useSelector((state) => state.notification);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(getNotification());
        window.scrollTo(0, 0);
    }, [dispatch]);

    const handleToggleVisibility = (id) => {
        const notif = notification.find(n => n._id === id);
        if (notif) {
            dispatch(updateNotification(id, { visibility: !notif.visibility }));
        }
    };

    const handleAddNotification = () => {
        setEditingNotification(null);
        form.resetFields();
        setDrawerVisible(true);
    };

    const handleEditNotification = (notification) => {
        setEditingNotification(notification);
        setDrawerVisible(true);
        setTimeout(() => {
            form.setFieldsValue({ 
                message: notification.message, 
                visibility: notification.visibility,
                type: notification.type,
                priority: notification.priority,
                link: notification.link
            });
        }, 0);
    };

    const handleDeleteNotification = (id) => {
        // Optimistically remove the notification from the state
        const updatedNotifications = notification.filter(notif => notif._id !== id);
        dispatch(notificationActions.setNotification(updatedNotifications)); // Update state locally

        // Call the delete action
        dispatch(deleteNotification(id));
    };

    const handleFormSubmit = (values) => {
        if (editingNotification) {
            // Update existing notification
            dispatch(updateNotification(editingNotification._id, { 
                message: values.message, 
                visibility: values.visibility,
                type: values.type,
                priority: values.priority,
                link: values.link
            }));
        } else {
            // Add new notification
            dispatch(createNotification({ 
                message: values.message, 
                visibility: values.visibility,
                type: values.type,
                priority: values.priority,
                link: values.link
            }));
        }
        setDrawerVisible(false);
        form.resetFields();
    };

    const handleCloseDrawer = () => {
        setDrawerVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Notification',
            dataIndex: 'message',
            key: 'message'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={
                    type === 'success' ? 'green' :
                    type === 'error' ? 'red' :
                    type === 'warning' ? 'orange' :
                    'blue'
                }>
                    {type.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={
                    priority === 1 ? 'red' :
                    priority === 2 ? 'orange' :
                    'green'
                }>
                    {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                </Tag>
            ),
            sorter: (a, b) => a.priority - b.priority
        },
        {
            title: 'Visibility',
            dataIndex: 'visibility',
            key: 'visibility',
            render: (text, record) => (
                <Switch
                    checked={record.visibility}
                    onChange={() => handleToggleVisibility(record._id)}
                />
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        type='primary'
                        icon={<FaPenToSquare />}
                        onClick={() => handleEditNotification(record)}
                    />
                    <Button 
                        type='primary'
                        danger
                        icon={<MdDelete />}
                        onClick={() => handleDeleteNotification(record._id)}
                    />
                </div>
            )
        }
    ];

    return (
        <>
            <Button 
                type='primary'
                icon={<FaPlus />}
                onClick={handleAddNotification}
                style={{ marginBottom: '20px' }} // Ajout d'un espacement
            >   
                Ajouter Notification
            </Button>
            <TableDashboard theme={theme} id="_id" column={columns} data={notification} />

            <Drawer
                title={editingNotification ? 'Edit Notification' : 'Add Notification'}
                width={480} // Ajustement de la largeur pour le TextArea
                onClose={handleCloseDrawer}
                visible={drawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    form={form}
                    initialValues={{ 
                        message: '', 
                        visibility: true,
                        type: 'info',
                        priority: 3
                    }}
                >
                    <Form.Item
                        name="message"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <Input.TextArea 
                            placeholder="Enter notification description" 
                            rows={4} // Nombre de lignes visibles
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="info">Info</Select.Option>
                            <Select.Option value="warning">Warning</Select.Option>
                            <Select.Option value="success">Success</Select.Option>
                            <Select.Option value="error">Error</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value={1}>High</Select.Option>
                            <Select.Option value={2}>Medium</Select.Option>
                            <Select.Option value={3}>Low</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="link"
                        label="Link (Optional)"
                    >
                        <Input.Group compact>
                            <Form.Item name={['link', 'text']} noStyle>
                                <Input placeholder="Link Text" style={{ width: '50%' }} />
                            </Form.Item>
                            <Form.Item name={['link', 'url']} noStyle>
                                <Input placeholder="URL" style={{ width: '50%' }} />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        name="visibility"
                        label="Visibility"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Space>
                        <Button onClick={handleCloseDrawer}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            {editingNotification ? 'Update' : 'Add'}
                        </Button>
                    </Space>
                </Form>
            </Drawer>
        </>
    );
}

export default NotificationGlobale;
