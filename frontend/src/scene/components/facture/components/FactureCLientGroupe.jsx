import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Avatar, Card, Row, Col, Spin, Alert, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getFactureGroupeByUser } from '../../../../redux/apiCalls/factureApiCalls';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaBoxes, FaCheck } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";
import { ImFolderOpen } from "react-icons/im";
import debounce from 'lodash.debounce';
import { MdOutlineCancel } from 'react-icons/md';

const { Meta } = Card;
const { Search } = Input;

function FactureClientGroupe() {
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
                await dispatch(getFactureGroupeByUser('client'));
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
                navigate(`/dashboard/facture/client/${store?._id}`); // Redirect non-admin users
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
            f.storeName.toLowerCase().includes(lowerSearch) ||
            f.tele.includes(searchTerm)
        );
    }, [facture, searchTerm]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!facture || facture.length === 0) {
        return (
            <Alert
                message="No Factures Found"
                description="There are no factures to display."
                type="info"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            {/* Search Input */}
            <Search
                placeholder="Search by store name or phone number"
                allowClear
                enterButton="Search"
                size="large"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: '20px', maxWidth: '400px' }}
            />

            {/* Display filtered factures */}
            <Row gutter={[16, 16]}>
                {filteredFactures.length > 0 ? (
                    filteredFactures.map((storeFacture) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={storeFacture.storeName}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                                        <img
                                            alt={storeFacture.storeName}
                                            src={storeFacture.image?.url}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                }
                                actions={[
                                    <ImFolderOpen key="setting" />,
                                ]}
                                onClick={()=>navigate(`/dashboard/facture/client/${storeFacture?._id}`)} 
                            >
                                <Meta
                                    title={storeFacture.storeName}
                                    description={
                                        <>
                                            <p><FaPhoneAlt color='black' /> {storeFacture.tele}</p>
                                            <p><GrDocumentText color='yellow' /> {storeFacture.factureCount} Factures</p>
                                            <p><FaBoxes color='blue' /> {storeFacture.totalColis} Colis</p>
                                            <p><MdOutlineCancel color='red' /> {storeFacture.nonPayerCount}  --  <FaCheck color='green' /> {storeFacture.factureCount-storeFacture.nonPayerCount}</p>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <Alert
                            message="No Results Found"
                            description="No stores match your search criteria."
                            type="warning"
                            showIcon
                        />
                    </Col>
                )}
            </Row>
        </div>
    );
}

export default FactureClientGroupe;
