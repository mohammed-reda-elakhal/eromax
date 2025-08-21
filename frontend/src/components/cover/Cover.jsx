import React from 'react'
import './cover.css'
import { Link } from 'react-router-dom'
import { FaHandPointLeft, FaTruck, FaBoxOpen, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import {TruckFilled } from '@ant-design/icons'

function Cover() {
  return (
    <section className='cover' id="home" dir="rtl">
        <div className="cover-decor" aria-hidden="true">
            <FaTruck className="decor-icon decor-truck" />
            <FaBoxOpen className="decor-icon decor-box" />
            <FaMapMarkerAlt className="decor-icon decor-marker" />
            <FaClock className="decor-icon decor-clock" />
        </div>
        <div className="cover-info">
            <p><TruckFilled className="cover-icon" />   التوصيل السريع</p>
            <h1>شريكك الموثوق لتوصيل طلبات متجرك في كل مدن المغرب</h1>
            <h4>حلول شحن احترافية مع الدفع عند الاستلام، تتبّع فوري، وخدمة عملاء سريعة — بأسعار تنافسية تدعم نمو تجارتك.</h4>
            <Link to='/register' className='cover-link'>
                <FaHandPointLeft className='cover-link-icon' />
                ابدأ الآن
            </Link>
        </div>
        <div className="cover-img">
            <img src="/image/gift.gif" alt="خدمات التوصيل السريع" />
        </div>
    </section>
  )
}

export default Cover