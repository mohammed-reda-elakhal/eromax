import React from 'react'
import './service.css'
import { FaBoxes } from "react-icons/fa";
import { GrDeliver } from "react-icons/gr";
import { AiOutlineFieldTime } from "react-icons/ai";
import { FaHandHoldingUsd } from "react-icons/fa";
import ServiceItem from './ServiceItem';
import HeaderSection from '../header/HeaderSection';


const services = [
    {
        id: 1,
        icon: <FaBoxes />,
        title: 'الاستلام من المتجر',
        desc: 'نقوم باستلام الطلبيات من متجرك بسرعة واحترافية لتسهيل عملية الشحن وجعلها أسهل عليك.'
    },
    {
        id: 2,
        icon: <GrDeliver />,
        title: 'التوصيل إلى الزبون',
        desc: 'بفضل خبرتنا الميدانية، نوصل الطرود يداً بيد إلى زبنائك في مختلف المدن المغربية.'
    },
    {
        id: 3,
        icon: <AiOutlineFieldTime />,
        title: 'شحن سريع وموثوق',
        desc: 'فريق EROMAX يضمن إيصال الطرود في الوقت المناسب مع تتبع كامل وإشعار بالاستلام.'
    },
    {
        id: 4,
        icon: <FaHandHoldingUsd />,
        title: 'التحصيل والدفع عند الاستلام',
        desc: 'نُرجع لك أموالك خلال 48 ساعة مع تحويلات منتظمة وتقارير واضحة لعملياتك.'
    },
]

function Service() {
  return (
    <section className='service' id='service' dir='rtl'>
         <HeaderSection
            nom={`خدماتنا`}
            title={`ماذا نقدم لنجاح متجرك؟`}
            desc={`ركز على تنمية مشروعك، ودع علينا اللوجستيك والتوصيل والدفع عند الاستلام.`}
         />
         <div className="service-main">
            {
                services.map(service =>(
                    <ServiceItem
                        key={service.id}
                        icon={service.icon}
                        title={service.title}
                        desc = {service.desc}
                    />
                ))
            }
         </div>
    </section>
  )
}

export default Service