import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { Card, Typography, Divider, Row, Col, Button, Space } from 'antd';
import { MailOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import '../dashboard.css';

function Contact() {
    const { theme } = useContext(ThemeContext);
    const whatsappNumber = "212630087302";
    const { Title, Text } = Typography;

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}>
                    <div className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                            padding: '2rem'
                        }}>
                        <Row gutter={[24, 24]} justify="center">
                            <Col xs={24} md={20} lg={16}>
                                <Card 
                                    className="contact-card"
                                    bordered={false}
                                    style={{
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderRadius: '15px',
                                        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                                    }}
                                >
                                    <Title level={2} className="text-center" style={{ color: theme === 'dark' ? '#fff' : '#002242' }}>
                                        <GlobalOutlined style={{ marginRight: '10px' }} />
                                        تواصل معنا
                                    </Title>
                                    <Divider style={{ borderColor: theme === 'dark' ? '#1f1f1f' : '#d9d9d9' }}/>

                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <Card className="info-card">
                                            <Title level={4} style={{ color: theme === 'dark' ? '#fff' : '#002242' }}>
                                                معلومات الشركة الأساسية
                                            </Title>
                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                <div className="info-item-modern">
                                                    <FaMapMarkerAlt className="icon-modern" />
                                                    <Text>Eromax delivery - إيروماكس ديليفري</Text>
                                                </div>
                                                <div className="info-item-modern">
                                                    <MailOutlined className="icon-modern" />
                                                    <Text>support@eromax.com</Text>
                                                </div>
                                                <div className="info-item-modern">
                                                    <FaPhone className="icon-modern" />
                                                    <Text><span dir="ltr">+212 5 06 63 32 25</span></Text>
                                                </div>
                                                <div className="info-item-modern">
                                                    <ClockCircleOutlined className="icon-modern" />
                                                    <Text>الإثنين - الجمعة | 9h - 18h</Text>
                                                </div>
                                            </Space>
                                        </Card>

                                        <Card className="social-card">
                                            <Title level={4} style={{ color: theme === 'dark' ? '#fff' : '#002242' }}>
                                                تابعنا على مواقع التواصل الاجتماعي
                                            </Title>
                                            <div className="social-links-modern">
                                                <Link to="https://web.facebook.com/profile.php?id=61561358108705" target="_blank" className="social-link-modern facebook">
                                                    <FaFacebookF />
                                                </Link>
                                                <Link to="https://www.instagram.com/eromax.ma/profilecard/?igsh=MTg0bDQ5ZmlpZDVraw==" target="_blank" className="social-link-modern instagram">
                                                    <FaInstagram />
                                                </Link>
                                                <Link to="https://www.tiktok.com/@eromax.ma?_t=8sBRoCXyCCz&_r=1" target="_blank" className="social-link-modern tiktok">
                                                    <FaTiktok />
                                                </Link>
                                            </div>
                                        </Card>

                                        <Button 
                                            type="primary" 
                                            size="large"
                                            icon={<FaWhatsapp />}
                                            className="whatsapp-button-modern"
                                            onClick={() => window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}`, '_blank')}
                                        >
                                            تواصل معنا عبر واتساب
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Contact;
