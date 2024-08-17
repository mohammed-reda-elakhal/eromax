import React, { useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import { Button, Switch, Drawer, Form, Input, Space } from 'antd';
import not from "../../../../data/NotGlobale.json";
import { FaPenToSquare } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function NotificationGlobale({ theme }) {
    const [notifications, setNotifications] = useState(not);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [form] = Form.useForm(); // Create a form instance

    const handleToggleVisibility = (id) => {
        const updatedNotifications = notifications.map(notification => {
            if (notification.id === id) {
                return { ...notification, visible: !notification.visible };
            }
            return notification;
        });
        setNotifications(updatedNotifications);
    };

    const handleAddNotification = () => {
        setEditingNotification(null); // Clear editing state
        form.resetFields(); // Clear the form fields
        setDrawerVisible(true); // Open drawer for adding new notification
    };

    const handleEditNotification = (notification) => {
        setEditingNotification(notification); // Load selected notification into form
        setDrawerVisible(true);
        // Set form fields with existing values, after the drawer is fully opened
        setTimeout(() => {
            form.setFieldsValue(notification);
        }, 0);
    };

    const handleDeleteNotification = (id) => {
        const updatedNotifications = notifications.filter(notification => notification.id !== id);
        setNotifications(updatedNotifications);
    };

    const handleFormSubmit = (values) => {
        if (editingNotification) {
            // Update existing notification
            const updatedNotifications = notifications.map(notification =>
                notification.id === editingNotification.id
                    ? { ...notification, ...values }
                    : notification
            );
            setNotifications(updatedNotifications);
        } else {
            // Add new notification
            const newNotification = {
                id: notifications.length + 1,
                ...values
            };
            setNotifications([...notifications, newNotification]);
        }
        setDrawerVisible(false);
        form.resetFields(); // Clear the form after submission
    };

    const handleCloseDrawer = () => {
        setDrawerVisible(false);
        form.resetFields(); // Clear the form when drawer is closed
    };

    const columns = [
        {
            title: 'Ref',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: 'Notification',
            dataIndex: 'desc',
            key: 'desc'
        },
        {
            title: 'Visibility',
            dataIndex: 'visible',
            key: 'visible',
            render: (text, record) => (
                <Switch
                    checked={record.visible}
                    onChange={() => handleToggleVisibility(record.id)}
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
                        onClick={() => handleDeleteNotification(record.id)}
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
            >   
                Ajouter Notification
            </Button>
            <TableDashboard theme={theme} id="id" column={columns} data={notifications} />

            <Drawer
                title={editingNotification ? 'Edit Notification' : 'Add Notification'}
                width={320}
                onClose={handleCloseDrawer}
                visible={drawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    form={form} // Connect the form instance
                    initialValues={{ desc: '', visible: true }} // Set initial values to empty for new notification
                >
                    <Form.Item
                        name="desc"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <Input placeholder="Enter notification description" />
                    </Form.Item>
                    <Form.Item
                        name="visible"
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
