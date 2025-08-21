import React from 'react'
import HeaderSection from '../header/HeaderSection'
import './about.css'
import { Link } from 'react-router-dom';
import { FaHandPointLeft } from "react-icons/fa";

function About() {
     // Enhanced Arabic description highlighting company strengths
     const about_text = `إيروماكس هي الحل الرائد والمبتكر لإدارة خدمات التوصيل الإلكترونية في المغرب، نتخصص في تسيير التدفقات اللوجستية للمنتجات حتى الوجهة النهائية مع ضمان أعلى جودة خدمة في أقصر الآجال وبأسعار تنافسية لا مثيل لها.
     
     منصتنا المتطورة تضمن الشحن، الجمع، الوصول، التوصيل، إرجاع الأموال، التأكيد، إدارة المخزون والتسيير الوثائقي الشامل. نقدم لكل عميل سواء كان محترفاً أو فرداً خدمة شاملة ومتنوعة ومثلى بفضل خبرتنا الغنية والمهنية في السوق الوطنية للرسائل والشحن.
     
     نفخر بكوننا الشريك الموثوق لآلاف التجار الإلكترونيين في المملكة، مع تغطية شاملة لجميع المدن والقرى، وفريق عمل محترف يعمل على مدار الساعة لضمان رضاكم التام.`;
 
     // Split the text into paragraphs based on the newline character (\n)
     const paragraphs = about_text.split('\n');
  return (
    <section className='about' dir="rtl">
        <HeaderSection
            nom={`من نحن`}
            title={`إيروماكس - شريكك الموثوق في التوصيل`}
            desc={`كيف نعمل من أجل نجاحك؟`}
        />
        <div className="about-main">
            
            <div className="about-info">
                {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                <Link to='/register' className='cover-link'>
                    <FaHandPointLeft className='cover-link-icon' />
                    انضم إلى عائلة إيروماكس
                </Link>
            </div>
            <div className="about-img">
                <img src="/image/about.png" alt="خدمات إيروماكس للتوصيل" />
            </div>
        </div>
    </section>
  )
}

export default About