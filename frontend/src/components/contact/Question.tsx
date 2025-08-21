import React from 'react'
import type { CollapseProps } from 'antd';
import { Collapse } from 'antd';



const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'كيف أبدأ العمل مع EROMAX؟',
      children: <p>سجّل حسابك مجاناً عبر صفحة التسجيل، سنتواصل معك لتفعيل الحساب والبدء في استلام طلبياتك بسرعة.</p>,
    },
    {
      key: '2',
      label: 'متى أتلقى أموالي؟',
      children: <p>نقوم بإرجاع الأموال خلال 48 ساعة عمل مع تحويلات منتظمة وتقارير مفصلة.</p>,
    },
    {
      key: '3',
      label: 'هل يمكن تتبع الطرود؟',
      children: <p>نعم، نوفر تتبعاً كاملاً لكل طرد مع إشعارات حالة التسليم وإعادة البرمجة عند الحاجة.</p>,
    },
  ];
  
function Question() {
    const onChange = (key: string | string[]) => {
        console.log(key);
      };
  return (
    <div className='question-section' dir='rtl'>
        <Collapse items={items} defaultActiveKey={['1']} onChange={onChange} />
    </div>
  )
}

export default Question