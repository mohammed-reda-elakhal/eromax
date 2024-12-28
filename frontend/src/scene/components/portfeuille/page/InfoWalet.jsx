import React from 'react';
import { message, Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

function InfoWalet() {
  // useMessage gives us a message API (messageApi) 
  // plus a contextHolder that must be rendered in the JSX.
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()

  // Function to show the info message
  const showInfoMessage = () => {
    // You can customize the content, duration, etc.
    messageApi.info({
      content: ' نعتد عن هدا العطل . لطلب الاموال يمكن الاعتماد على الفواتير الخاصة بك . سيتم تشغيل نضام طلب الدفع التلقائي في اقرب وقت ', 
      duration: 3, // seconds
    });
  };

  return (
    <Result
        status="500"
        title="جاري عملية الصيانة"
        subTitle= ' نعتد عن هدا العطل . لطلب الاموال يمكن الاعتماد على الفواتير الخاصة بك . سيتم تشغيل نضام طلب الدفع التلقائي في اقرب وقت '
        extra={<Button type="primary" onClick={()=>navigate('/dashboard/home')}>العودة الى الصفحة الرئيسية</Button>}
    />
  );
}

export default InfoWalet;
