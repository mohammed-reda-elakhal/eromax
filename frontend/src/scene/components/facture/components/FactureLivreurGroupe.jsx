import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Spin, Alert, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getFactureGroupeByUser } from '../../../../redux/apiCalls/factureApiCalls';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaBoxes } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";
import { ImFolderOpen } from "react-icons/im";
import debounce from 'lodash.debounce';
import { ThemeContext } from '../../../ThemeContext';

const { Meta } = Card;
const { Search } = Input;

function FactureLivreurGroupe() {
    const { theme } = useContext(ThemeContext);
    const { facture, user, store } = useSelector((state) => ({
        facture: state.facture.factureGroupe,
        user: state.auth.user,
        store: state.auth.store,
    }));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            if (user) {
                await dispatch(getFactureGroupeByUser('livreur'));
            }
        } catch (error) {
            // Error handling is managed in API calls
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Role Verification
        if (user) {
            if (user.role !== 'admin') {
                navigate(`/dashboard/facture/livreur/${user?._id}`); // Redirect non-admin users
            } else {
                fetchData(); // Fetch data only if user is admin
            }
        }
        window.scrollTo(0, 0);
    }, [dispatch, user, store, navigate]);

    // Debounced search handler
    const handleSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
        }, 300),
        []
    );

    // Memoize filtered factures for performance
    const filteredFactures = useMemo(() => {
        if (!searchTerm) return facture;
        const lowerSearch = searchTerm.toLowerCase();
        return facture.filter(f =>
            f.nom.toLowerCase().includes(lowerSearch) ||
            f.tele.includes(searchTerm)
        );
    }, [facture, searchTerm]);

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '50px',
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#262626'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!facture || facture.length === 0) {
        return (
            <div style={{
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                padding: '20px',
                minHeight: '100vh'
            }}>
                <Alert
                    message="No Factures Found"
                    description="There are no factures to display."
                    type="info"
                    showIcon
                    style={{
                        margin: '20px',
                        backgroundColor: theme === 'dark' ? '#262626' : '#e6f7ff',
                        borderColor: theme === 'dark' ? '#434343' : '#91d5ff',
                        color: theme === 'dark' ? '#fff' : '#262626'
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            minHeight: '100vh'
        }}>
            {/* Search Input */}
            <Search
                placeholder="Search by livreur name or phone number"
                allowClear
                enterButton="Search"
                size="large"
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                    marginBottom: '20px',
                    maxWidth: '400px',
                    backgroundColor: theme === 'dark' ? '#262626' : '#fff'
                }}
                styles={{
                    input: {
                        backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                        borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                        color: theme === 'dark' ? '#fff' : '#262626'
                    }
                }}
            />

            {/* Display filtered factures */}
            <Row gutter={[16, 16]}>
                {filteredFactures.length > 0 ? (
                    filteredFactures.map((storeFacture) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={storeFacture.nom}>
                            <Card
                                hoverable
                                style={{
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                    borderRadius: '12px',
                                    boxShadow: theme === 'dark'
                                        ? '0 2px 8px rgba(0,0,0,0.3)'
                                        : '0 2px 8px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                styles={{
                                    body: {
                                        backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#262626'
                                    },
                                    actions: {
                                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
                                        borderTop: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                    }
                                }}
                                cover={
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: '16px',
                                        backgroundColor: theme === 'dark' ? '#262626' : '#fff'
                                    }}>
                                        <img
                                            alt={storeFacture.nom}
                                            src={storeFacture?.profile?.url}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                border: `3px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                            }}
                                        />
                                    </div>
                                }
                                actions={[
                                    <ImFolderOpen
                                        key="setting"
                                        style={{
                                            color: theme === 'dark' ? '#1890ff' : '#1890ff',
                                            fontSize: '18px'
                                        }}
                                    />,
                                ]}
                                onClick={()=>navigate(`/dashboard/facture/livreur/${storeFacture?._id}`)}
                            >
                                <Meta
                                    title={
                                        <div style={{
                                            color: theme === 'dark' ? '#fff' : '#262626',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            marginBottom: '8px'
                                        }}>
                                            {storeFacture.nom}
                                        </div>
                                    }
                                    description={
                                        <div style={{ color: theme === 'dark' ? '#8c8c8c' : '#666' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '6px',
                                                fontSize: '13px'
                                            }}>
                                                <FaPhoneAlt
                                                    style={{
                                                        color: theme === 'dark' ? '#52c41a' : '#52c41a',
                                                        marginRight: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                {storeFacture.tele}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '6px',
                                                fontSize: '13px'
                                            }}>
                                                <GrDocumentText
                                                    style={{
                                                        color: theme === 'dark' ? '#ff4d4f' : '#ff4d4f',
                                                        marginRight: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                {storeFacture.factureCount} Factures
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '6px',
                                                fontSize: '13px'
                                            }}>
                                                <FaBoxes
                                                    style={{
                                                        color: theme === 'dark' ? '#1890ff' : '#1890ff',
                                                        marginRight: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                {storeFacture.totalColis} Colis
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <Alert
                            message="No Results Found"
                            description="No livreurs match your search criteria."
                            type="warning"
                            showIcon
                            style={{
                                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fffbe6',
                                borderColor: theme === 'dark' ? '#434343' : '#ffe58f',
                                color: theme === 'dark' ? '#fff' : '#262626'
                            }}
                        />
                    </Col>
                )}
            </Row>

            {/* Theme-aware styling */}
            <style jsx>{`
                .ant-card:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: ${theme === 'dark'
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.15)'} !important;
                }

                .ant-input-search .ant-input-group .ant-input-affix-wrapper {
                    background-color: ${theme === 'dark' ? '#262626' : '#fff'} !important;
                    border-color: ${theme === 'dark' ? '#434343' : '#d9d9d9'} !important;
                    color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                }

                .ant-input-search .ant-input-group .ant-input-affix-wrapper input {
                    background-color: ${theme === 'dark' ? '#262626' : '#fff'} !important;
                    color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                }

                .ant-input-search .ant-input-group .ant-input-affix-wrapper input::placeholder {
                    color: ${theme === 'dark' ? '#8c8c8c' : '#bfbfbf'} !important;
                }

                .ant-input-search .ant-btn {
                    background-color: #1890ff !important;
                    border-color: #1890ff !important;
                    color: #fff !important;
                }

                .ant-input-search .ant-btn:hover {
                    background-color: #40a9ff !important;
                    border-color: #40a9ff !important;
                }

                .ant-card-actions {
                    background-color: ${theme === 'dark' ? '#1f1f1f' : '#fafafa'} !important;
                    border-top: 1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'} !important;
                }

                .ant-card-actions > li {
                    color: ${theme === 'dark' ? '#1890ff' : '#1890ff'} !important;
                }

                .ant-card-actions > li:hover {
                    background-color: ${theme === 'dark' ? '#262626' : '#f0f0f0'} !important;
                }
            `}</style>
        </div>
    );
}

export default FactureLivreurGroupe;


