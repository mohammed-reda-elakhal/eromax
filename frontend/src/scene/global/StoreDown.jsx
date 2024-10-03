import React from 'react'
import { DownOutlined , UserOutlined } from '@ant-design/icons';
import { Menu, Divider, Dropdown, Space, Avatar } from 'antd';
import { useDispatch , useSelector } from 'react-redux';
function StoreDown({theme , collapsed}) {
  const {store} = useSelector(state => state.auth)

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        color: theme === 'dark' ? '#fff' : '#000',
        backgroundColor: theme === 'dark' ? '#333' : '#fff',
      };
    
    
  return (
    <div
        className="store-menu"
        style={{
        color: theme === 'dark' ? '#fff' : '#002242',
        }}
    >
        <div className="store-open">
            <Avatar
                style={{
                    backgroundColor: '#f56a00',
                    marginRight: 8,
                }}
                icon={<UserOutlined />}
            />
            {collapsed ? '' : <p>{store.storeName} </p>}
        </div>
        
    </div>
  )
}

export default StoreDown