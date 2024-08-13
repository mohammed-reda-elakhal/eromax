import React from 'react';
import not from "../../../../data/NotGlobale.json";

function Notification({theme}) {
  return (
    <div className='list_notification_home'>
      {not.map((notification) => (
        <div 
          className='notification_home' 
          key={notification.id}
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
        }}
        >
          {notification.desc}
        </div>
      ))}
    </div>
  );
}

export default Notification;
