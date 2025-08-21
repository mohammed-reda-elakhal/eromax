import React from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp , FaFacebook , FaInstagram , FaTiktok } from "react-icons/fa";
import './footer.css'

function Footer() {
  return (
    <footer className='footer' dir='rtl'>
      {/* CTA Header */}
      <div className="footer-cta">
        <div className="footer-container">
          <div className="cta-text">
            <h3>الوقت المناسب لبدء شراكتك مع EROMAX وتطوير مشروعك</h3>
            <p>حلول توصيل موثوقة، دفع عند الاستلام، وتتبع لحظي يدعم نمو تجارتك.</p>
          </div>
          <div className="cta-actions">
            <a href="#tarif" className="cta-btn">عرض الأثمنة</a>
            <a href="#contact" className="cta-btn outline">تواصل معنا</a>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="footer-main">
        <div className="footer-container grid">
          <div className="col brand">
            <img src="/image/logo.png" className='footer-logo' alt="EROMAX logo" />
            <p className="muted" style={{color: '#fff'}}>
              تعمل EROMAX.MA بسرعة واحترافية لضمان توزيع سلس من البداية إلى النهاية بشغف والتزام.
            </p>
            <div className="socials">
              <Link className='social' to={`https://api.whatsapp.com/send?phone=212630087302`} aria-label="WhatsApp">
                <FaWhatsapp />
              </Link>
              <Link className='social' to={`https://web.facebook.com/profile.php?id=61561358108705`} aria-label="Facebook">
                <FaFacebook/>
              </Link>
              <Link className='social' to={`https://www.instagram.com/eromax.ma/profilecard/?igsh=MTg0bDQ5ZmlpZDVraw==`} aria-label="Instagram">
                <FaInstagram />
              </Link>
              <Link className='social' to={`https://www.tiktok.com/@eromax.ma?_t=8sBRoCXyCCz&_r=1`} aria-label="TikTok">
                <FaTiktok/>
              </Link>
            </div>
          </div>

          <div className="col links">
            <h4>روابط سريعة</h4>
            <nav className="links-list">
              <a className='link' href="#home">الرئيسية</a>
              <a className='link' href="#about">من نحن</a>
              <a className='link' href="#service">خدماتنا</a>
              <a className='link' href="#tarif">الأثمنة</a>
            </nav>
          </div>

          <div className="col links">
            <h4>ابدأ معنا</h4>
            <nav className="links-list">
              <Link className='link' to="/register">التسجيل كعميل</Link>
              <Link className='link' to="/login">مساحة العميل</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className='footer-bottom'>
        <div className="footer-container bottom-inner">
          <p>
            جميع الحقوق محفوظة — تصميم وتطوير من طرف
            <a href="https://www.mohammedreda.site/" target="_blank" rel="noopener noreferrer"> Mohammed Reda</a>
          </p>
          <p className="muted">© {new Date().getFullYear()} EROMAX</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer