import React, { useEffect } from 'react'
import { DownOutlined , UserOutlined } from '@ant-design/icons';
import { Menu, Divider, Dropdown, Space, Avatar } from 'antd';
import { useDispatch , useSelector } from 'react-redux';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';
function StoreDown({theme , collapsed}) {
  const {user , store} = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const storeData = useSelector((state) => state.profile.store);

  useEffect(() => {
    if (user?.role === "client") {
      dispatch(getStoreById(store?._id));
    }
  }, [dispatch, user, store]);

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
                src={storeData?.image?.url}
            />
            {collapsed ? '' : <p>{storeData?.storeName} </p>}
        </div>
        
    </div>
  )
}

export default StoreDown