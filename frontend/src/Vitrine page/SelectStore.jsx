import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Select } from 'antd';
import { authActions } from '../redux/slices/authSlice';

const SelectStore = () => {
    const [selectedStore, setSelectedStore] = useState(null);
    const { stores, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleStoreSelection = () => {
        if (selectedStore) {
            const selected = stores.find(store => store.id === selectedStore);
            dispatch(authActions.selectStore(selected));
            navigate('/dashboard/home');
        }
    };

    return (
        <div className="select-store">
            <h2>Select a Store</h2>
            <Select
                placeholder="Select a store"
                style={{ width: '100%', marginBottom: '20px' }}
                onChange={(value) => setSelectedStore(value)}
            >
                {stores.map(store => (
                    <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                ))}
            </Select>
            <Button type="primary" onClick={handleStoreSelection} disabled={!selectedStore}>
                Proceed to Dashboard
            </Button>
        </div>
    );
};

export default SelectStore;
