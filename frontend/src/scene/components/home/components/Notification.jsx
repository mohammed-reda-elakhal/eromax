import React, { useEffect } from 'react';
import not from "../../../../data/NotGlobale.json";
import { useDispatch, useSelector } from 'react-redux';
import { getNotification } from '../../../../redux/apiCalls/notificationApiCalls';
import { Tag } from 'antd';


function Notification({theme}) {

  const { notification } = useSelector((state) => state.notification);
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getNotification(true));
    window.scrollTo(0, 0);
}, [dispatch]);

  // Create a mutable copy of the array and sort it
  const sortedNotifications = [...notification].sort((a, b) => a.priority - b.priority);

  return (
    <div className='list_notification_home' data-theme={theme}>
      {sortedNotifications.map((notification) => (
        <div 
          className={`notification_home notification-${notification.type}`}
          key={notification._id}
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
          }}
        >
          <div className="notification-content">
            <div className="notification-message">
              {notification.message}
            </div>
            {notification.link && (
              <a 
                href={notification.link.url} 
                className="notification-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {notification.link.text}
              </a>
            )}
          </div>
         
        </div>
      ))}
    </div>
  );
}

export default Notification;
