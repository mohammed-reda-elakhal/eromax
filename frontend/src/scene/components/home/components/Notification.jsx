import React, { useEffect } from 'react';
import not from "../../../../data/NotGlobale.json";
import { useDispatch, useSelector } from 'react-redux';
import { getNotification } from '../../../../redux/apiCalls/notificationApiCalls';


function Notification({theme}) {

  const { notification } = useSelector((state) => state.notification);
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getNotification(true));
    window.scrollTo(0, 0);
}, [dispatch]);



  return (
    <div className='list_notification_home'>
      {notification.map((notification) => (
        <div 
          className='notification_home' 
          key={notification._id}
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
        }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default Notification;
