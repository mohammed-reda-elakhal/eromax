import React from 'react'
import './avantage.css'
import { TbTruckDelivery } from "react-icons/tb";
import { MdOutlineTask, MdOutlineTaskAlt } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { AiOutlineControl , AiOutlineFileProtect } from "react-icons/ai";
import AvantageItem from './AvantageItem';
import HeaderSection from '../header/HeaderSection';

const avantages = [
    {
        id: 1,
        icon: <FaHome />,
        title: 'إدارة متعددة القنوات',
        desc: 'إدارة الطلبيات من جميع قنوات البيع الخاصة بك مثل Shopify وWooCommerce بسهولة وفي منصة واحدة.'
    }, {
        id: 2,
        icon: <FaBoxesPacking />,
        title: 'تغليف احترافي',
        desc: 'عناية خاصة بتجهيز الطرود لضمان وصولها في حالة ممتازة وتعزيز تجربة زبائنك.'
    }, {
        id: 3,
        icon: <AiOutlineControl />,
        title: 'تحكم وتتبع كامل',
        desc: 'تتبع حالة كل طرد، إعادة البرمجة، وإدارة محاولات التسليم من لوحة تحكم بسيطة.'
    }, {
        id: 4,
        icon: <AiOutlineFileProtect />,
        title: 'حماية وأمان البيانات',
        desc: 'نحمي بياناتك وبيانات زبنائك بنسبة 100% ولا نشاركها مع أي طرف ثالث.'
    }, {
        id: 5,
        icon: <MdOutlineTaskAlt />,
        title: 'دقة واحترافية',
        desc: 'فريق محترف يضمن جودة الخدمة وسرعة التنفيذ.'
    }, {
        id: 6,
        icon: <TbTruckDelivery />,
        title: 'تنفيذ سريع وتغطية واسعة',
        desc: 'خدمة سريعة مع تغطية لمدن مغربية متعددة للوصول إلى زبنائك أينما كانوا.'
    },
]

function Avantage() {
  return (
    <section className='avantage' dir='rtl'>
        <HeaderSection
            nom={`مميزاتنا`}
            title={`لماذا تختار EROMAX ؟`}
            desc={`أفضل المزايا التي نقدمها لتطوير تجارتك الإلكترونية`}
        />
        <div className="avantage-main">
        {
                avantages.map(avantage=>(
                    <AvantageItem
                        key={avantage.id}
                        icon={avantage.icon}
                        title={avantage.title}
                        desc={avantage.desc}
                    />
                ))
            }
        </div>
    </section>
  )
}

export default Avantage