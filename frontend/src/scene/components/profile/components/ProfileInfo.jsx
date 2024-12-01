import { 
    Button, 
    Card, 
    Descriptions, 
    Upload, 
    Form, 
    message, 
    Typography, 
    Modal, 
    Avatar, 
    Divider,
    Input
} from 'antd';
import React, { useEffect, useState } from 'react';
import { MdVerified } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfileImage } from '../../../../redux/apiCalls/profileApiCalls';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { updateMessage, getMessage } from '../../../../redux/apiCalls/messageApiCalls'; // Actions to get and update message
import request from '../../../../utils/request';

const { Title } = Typography;

function ProfileInfo() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // To handle form submission state

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const { id } = useParams();
    const { profile, loading, error } = useSelector((state) => state.profile);
    const { message: adminMessage } = useSelector((state) => state.message);

    // Fetch profile data
    useEffect(() => {
        if (user) {
            const userId = id || user._id;
            dispatch(getProfile(userId, user.role));
        }
        if (user.role === 'admin' && user.type === 'super') {
            dispatch(getMessage(user?._id));  // Get the super admin message on component load
        }
        window.scrollTo(0, 0);
    }, [dispatch, user, id]);

    // Get profile information based on role
    const getProfileItems = (role, profile) => {
        let items = [];

        if (profile) {
            items = [
                { key: '1', label: 'Nom Complet', children: `${profile.nom} ${profile.prenom}` },
                { key: '2', label: 'Téléphone', children: profile.tele },
                { key: '3', label: 'Email', children: profile.email },
            ];

            if (role === 'client') {
                items.push({ key: '4', label: 'Ville', children: profile.ville });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse });
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });
            } else if (role === 'livreur' || role === 'team') {
                items.push({ key: '4', label: 'Ville', children: profile.ville });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse });
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });

                if (role === 'livreur' && profile.villes && profile.villes.length > 0) {
                    items.push({
                        key: '7',
                        label: 'List Villes',
                        children: profile.villes.join(' - ') || 'Aucune ville',
                    });
                }
            }
        }

        return items;
    };

    const handleModifyProfileRoute = () => {
        navigate(`/dashboard/compte/${user.role}/${id}`, { state: { from: `/dashboard/profile/${id}` } });
    };

    const profileItems = getProfileItems(user.role, profile);

    // Handler for image upload
    const handleUpload = async (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('L\'image doit être inférieure à 2MB!');
            return Upload.LIST_IGNORE;
        }
    
        const formData = new FormData();
        formData.append('image', file);
    
        dispatch(updateProfileImage(profile._id, user.role, formData));
        setIsModalVisible(false);
        return false; // Prevent default upload behavior
    };

    const handleSubmitMessage = async () => {
        if (newMessage.trim()) {
            setIsSubmitting(true); // Show loading state while submitting
    
            try {
                // Send the PATCH request to update the message
                const response = await request.patch(`/api/admin/message/${user?._id}`, {
                    message: newMessage
                });
    
                // Handle the successful response
                if (response.status === 200) {
                    message.success("Message updated successfully!");
                    setNewMessage(''); // Clear the message input field
                }
            } catch (error) {
                // Handle error response
                message.error(error.response?.data?.message || 'Failed to update message');
            } finally {
                setIsSubmitting(false); // Hide loading state after request is complete
            }
        } else {
            message.error('Le message ne peut pas être vide.');
        }
    };

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Title level={4} type="danger">Erreur: {error}</Title>
            </div>
        );
    }

    return (
        <div className='profile_information' style={{ padding: '20px' }}>
            <Card 
                title={<Title level={4}>Profil Utilisateur</Title>} 
                bordered={false}
                style={{ maxWidth: 800, margin: '0 auto' }}
            >
                <div className="profile_information_header" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <div className='profile_information_photo' style={{ position: 'relative' }}>
                        <Avatar 
                            src={profile?.profile?.url || "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"} 
                            size={150} 
                            style={{ border: '2px solid #1890ff' }}
                        />
                        <Button 
                            type="primary" 
                            shape="circle" 
                            icon={<FaRegPenToSquare />} 
                            size="small" 
                            style={{ position: 'absolute', bottom: 0, right: 0 }}
                            onClick={() => setIsModalVisible(true)}
                        />
                    </div>
                    <div style={{ marginLeft: 20 }}>
                        <Title level={3}>{`${profile?.nom} ${profile?.prenom}`}</Title>
                        {profile?.isVerified && <MdVerified color="#52c41a" size={24} />}
                    </div>
                </div>
                <Divider />

                <Descriptions 
                    title="Informations Personnelles" 
                    bordered 
                    column={{ xs: 1, sm: 1, md: 2 }}
                    layout="vertical"
                >
                    {profileItems.map(item => (
                        <Descriptions.Item key={item.key} label={item.label}>
                            {item.children}
                        </Descriptions.Item>
                    ))}
                </Descriptions>

                <div style={{ textAlign: 'right', marginTop: 20 }}>
                    <Button 
                        type='primary' 
                        icon={<FaRegPenToSquare />} 
                        onClick={handleModifyProfileRoute}
                    >
                        Modifier Profil
                    </Button>
                </div>
            </Card>

            {/* Modal for Image Upload */}
            <Modal 
                title="Modifier Photo de Profil" 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Sélectionner une image"
                        name="profileImage"
                        rules={[{ required: true, message: 'Veuillez sélectionner une image!' }]}
                    >
                        <Upload 
                            name="profileImage" 
                            listType="picture" 
                            beforeUpload={handleUpload} 
                            maxCount={1}
                            showUploadList={false} // Hide default upload list for cleaner UI
                        >
                            <Button icon={<UploadOutlined />}>Cliquez pour télécharger</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ProfileInfo;
