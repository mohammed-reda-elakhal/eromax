import React from 'react'
import { DownOutlined , UserOutlined } from '@ant-design/icons';
import { Menu, Divider, Dropdown, Space, Avatar } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

function StoreDown({theme , collapsed}) {


    const { selectedStore, user } = useSelector((state) => state.auth);

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        color: theme === 'dark' ? '#fff' : '#000',
        backgroundColor: theme === 'dark' ? '#333' : '#fff',
      };
    
      const stores = (
        <Menu>
          <Menu.Item key="0" style={menuItemStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                style={{
                  backgroundColor: '#87d068',
                  marginRight: 8,
                }}
                icon={<UserOutlined />}
              />
              <a href="https://www.antgroup.com" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Store 1</a>
            </div>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="1" style={menuItemStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                style={{
                  backgroundColor: '#1890ff',
                  marginRight: 8,
                }}
                icon={<UserOutlined />}
              />
              <a href="https://www.aliyun.com" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Store 2</a>
            </div>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="3" style={menuItemStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                style={{
                  backgroundColor: '#f56a00',
                  marginRight: 8,
                }}
                icon={<UserOutlined />}
              />
              <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Store 3</span>
            </div>
          </Menu.Item>
        </Menu>
      );
    
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
            {collapsed ? '' : <p>{selectedStore ? selectedStore.storeName : ""}</p>}
        </div>
        {collapsed ? '' :
          <Dropdown 
              overlay={stores} 
              trigger={['click']}
              className='dropdown-store'
          >
              <a onClick={(e) => e.preventDefault()}>
              <Space>
                  Changer
                  {collapsed ? '' : <DownOutlined />}
              </Space>
              </a>
          </Dropdown>
        }
        
    </div>
  )
}

export default StoreDown