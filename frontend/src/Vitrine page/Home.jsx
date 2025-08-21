import React, { useEffect, useMemo, useRef, useState } from 'react'
import Header2 from '../components/header/Header2'
import Footer from '../components/footer/Footer';
import './home.css'
import SEO from '../components/SEO/SEO';
import { FiTruck, FiMapPin, FiClock, FiCheckCircle, FiPackage, FiShield, FiDollarSign, FiCrosshair, FiGlobe, FiMail, FiPhone } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getAllVilles } from '../redux/apiCalls/villeApiCalls';

function Home() {
  const [trackCode, setTrackCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Pricing/villes state
  const dispatch = useDispatch();
  const { villes, loading: villesLoading } = useSelector((s) => s.ville || { villes: [], loading: false });
  const [searchVille, setSearchVille] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const BASE_URL = import.meta.env.VITE_BASE_URL || '';

  const sortedUpdates = useMemo(() => {
    if (!result?.status_updates) return [];
    // ensure ascending by date
    return [...result.status_updates].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [result]);

  // Fetch villes once
  useEffect(() => {
    dispatch(getAllVilles());
  }, [dispatch]);

  // Filter, sort, paginate villes
  const filteredVilles = useMemo(() => {
    let list = Array.isArray(villes) ? villes : [];
    // name filter
    if (searchVille.trim()) {
      const q = searchVille.trim().toLowerCase();
      list = list.filter(v => (v.nom || '').toLowerCase().includes(q));
    }
    // price filter
    const min = minPrice !== '' ? Number(minPrice) : null;
    const max = maxPrice !== '' ? Number(maxPrice) : null;
    if (min !== null) list = list.filter(v => Number(v.tarif || 0) >= min);
    if (max !== null) list = list.filter(v => Number(v.tarif || 0) <= max);
    // ensure ascending by tarif
    list = [...list].sort((a, b) => Number(a.tarif || 0) - Number(b.tarif || 0));
    return list;
  }, [villes, searchVille, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredVilles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedVilles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVilles.slice(start, start + pageSize);
  }, [filteredVilles, currentPage]);

  const resetFilters = () => {
    setSearchVille('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  // Smoothly scroll to pricing section on page change
  useEffect(() => {
    const el = document.getElementById('tarif');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  // Build compact page numbers with ellipses
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (p) => pages.push(p);
    add(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) add('...L');
    for (let i = start; i <= end; i++) add(i);
    if (end < totalPages - 1) add('...R');
    add(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const formatDateTime = (d) => {
    try {
      const dt = new Date(d);
      return new Intl.DateTimeFormat('ar-MA', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(dt);
    } catch {
      return d;
    }
  };

  const handleTrack = async () => {
    if (!trackCode.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/colis/truck/${encodeURIComponent(trackCode.trim())}`);
      // Expecting { id_colis, code_suivi, status_updates: [{status, date, livreur?}] }
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'تعذر جلب بيانات التتبع. حاول مرة أخرى.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetTracking = () => {
    setTrackCode('');
    setResult(null);
    setError('');
    setLoading(false);
  };

  // Testimonials data (fake users, tailored to delivery service)
  const testimonials = useMemo(() => ([
    { name: 'أمين - متجر إلكتروني للموضة', role: 'صاحب متجر', quote: 'منذ بدأنا العمل مع إيروماكس، ارتفعت نسبة التسليم في الوقت المحدد بشكل كبير، وخدمة العملاء ممتازة.' },
    { name: 'سارة - بالعربي كوزماتيك', role: 'مالكة مشروع', quote: 'الأسعار واضحة والتقارير الأسبوعية ساعدتني أفهم أداء الشحنات وتحسن الكاش فلو.' },
    { name: 'يوسف - إلكترونيات برو', role: 'مسؤول لوجستيك', quote: 'الدفع عند الاستلام يتم تحويله بسرعة، والتتبع سهل حتى لعملائنا على الهاتف.' },
    { name: 'خديجة - عالم الهدايا', role: 'رائدة أعمال', quote: 'الفريق يستجيب بسرعة لأي مشكلة، والاستلام اليومي وفر لي وقت كبير.' },
    { name: 'مروان - متجر الأحذية', role: 'مسير متجر', quote: 'تغطية المدن والقرى ساعدتنا نوصل لعملاء جدد خارج المدن الكبرى.' },
    { name: 'إيمان - مكياج بيوتي', role: 'صاحبة علامة', quote: 'واجهة التتبع خفيفة وسريعة، تعطي الثقة للزبائن ويقل عدد الاتصالات.' },
    { name: 'حمزة - بيت التغذية', role: 'مسؤول المبيعات', quote: 'الأسعار التنافسية والجودة في التسليم خلتنا نحافظوا على هامش ربح جيد.' },
    { name: 'نزهة - ديكور هوم', role: 'مؤسسة المشروع', quote: 'تكامل مرن وسهل مع متجري، وتجربة عميل ممتازة من الطلب حتى التسليم.' },
  ]), []);

  // Testimonials horizontal auto-scroller (infinite)
  const scrollerRef = useRef(null)
  const listRef = useRef(null)
  const [tPaused, setTPaused] = useState(false)
  useEffect(() => {
    const scroller = scrollerRef.current
    const list = listRef.current
    if (!scroller || !list) return
    let rafId
    const speed = 0.6 // px per frame
    const tick = () => {
      if (!tPaused) {
        scroller.scrollLeft += speed
        const singleWidth = list.scrollWidth / 2
        if (singleWidth > 0 && scroller.scrollLeft >= singleWidth) {
          scroller.scrollLeft -= singleWidth
        }
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [tPaused, testimonials.length])
  return (
    <div className='home' dir="rtl">
      <SEO
        title="إيروماكس | حلول التوصيل للتجارة الإلكترونية في المغرب"
        description="شريكك الموثوق لتوصيل طلبات متجرك في كل مدن المغرب. دفع عند الاستلام، تتبع فوري، وأسعار تنافسية تدعم نمو تجارتك."
        keywords="توصيل المغرب, الدفع عند الاستلام, لوجستيك, شحن, تتبع الطرود, Eromax, إيروماكس, الأثمنة"
        openGraph={{
          title: 'إيروماكس | حلول التوصيل للتجارة الإلكترونية في المغرب',
          description: 'شبكة توصيل وطنية مع دفع عند الاستلام وتتبع مباشر.',
          image: `${window.location.origin}/image/logo.png`,
          url: window.location.href,
          type: 'website',
          locale: 'ar_MA'
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Eromax',
          url: window.location.origin,
          logo: `${window.location.origin}/image/logo.png`,
          sameAs: []
        }}
      />

      <Header2/>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>شريكك الموثوق لتوصيل طلبات متجرك في كل مدن المغرب</h1>
            <p>حلول شحن احترافية مع الدفع عند الاستلام، تتبّع فوري، وخدمة عملاء سريعة — بأسعار تنافسية تدعم نمو تجارتك.</p>
            
            <div className="hero-ctas">
              <a href="#tarif" className="tracking-btn">عرض الأثمنة</a>
              <a href="#contact" className="btn btn-outline">تواصل معنا</a>
            </div>

            {/* Confidence Cards */}
            <div className="confidence-cards">
              <div className="confidence-card">
                <div className="confidence-icon">
                  <FiCheckCircle />
                </div>
                <div className="confidence-content">
                  <span className="confidence-number">+200</span>
                  <span className="confidence-label">عميل موثوق به</span>
                </div>
              </div>
              <div className="confidence-card">
                <div className="confidence-icon">
                  <FiMapPin />
                </div>
                <div className="confidence-content">
                  <span className="confidence-number">+50</span>
                  <span className="confidence-label">مدينة مغطاة</span>
                </div>
              </div>
              <div className="confidence-card">
                <div className="confidence-icon">
                  <FiPackage />
                </div>
                <div className="confidence-content">
                  <span className="confidence-number">98%</span>
                  <span className="confidence-label">توصيل ناجح</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/image/gift.gif" alt="توصيل سريع" className="hero-img" />
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section className="tracking-section">
        <div className="container">
          <div className="section-title">
            <h2>تتبع شحنتك بكل سهولة</h2>
            <p>أدخل رقم التتبع الخاص بشحنتك لمتابعة حالتها لحظة بلحظة</p>
          </div>
          <div className="tracking-widget">
            <div className="tracking-input-group">
              <input 
                type="text" 
                placeholder="أدخل رقم التتبع"
                className="tracking-input"
                dir="rtl"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTrack(); }}
                disabled={loading}
              />
              <button className="tracking-btn" onClick={handleTrack} disabled={loading || !trackCode.trim()}>
                <FiTruck className="tracking-icon" />
                {loading ? 'جاري التتبع...' : 'تتبع الشحنة'}
              </button>
            </div>

            {error && (
              <div className="tracking-error" role="alert">{error}</div>
            )}

            {result && (
              <div className="tracking-result" dir="rtl">
                <div className="tracking-result-header">
                  <div>
                    <h3>تتبع الشحنة</h3>
                    <p className="code">الكود: <strong>{result.code_suivi}</strong></p>
                  </div>
                  <button className="tracking-clear" onClick={resetTracking}>تم</button>
                </div>
                <div className="timeline">
                  {sortedUpdates.length === 0 && (
                    <p className="muted">لا توجد تحديثات حالة بعد.</p>
                  )}
                  {sortedUpdates.map((u, idx) => (
                    <div className="timeline-item" key={`${u.status}-${u.date}-${idx}`}>
                      <div className="dot" />
                      <div className="content">
                        <div className="row">
                          <span className="status">{u.status}</span>
                          <span className="date">{u.date ? formatDateTime(u.date) : ''}</span>
                        </div>
                        {u.livreur && (
                          <div className="livreur">
                            <span>المكلف بالتسليم: {u.livreur.nom || u.livreur.NAME || ''}</span>
                            {u.livreur.tele && <span className="tele"> | الهاتف: {u.livreur.tele}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

       {/* About Section */}
       <section id="about" className="about">
        <div className="about-inner">
          <div className="about-media">
            <img src="/image/about.png" alt="عن إيروماكس" />
          </div>
          <div className="about-content">
            <h2>لماذا التجار يختارون إيروماكس؟</h2>
            <p>نحن نقدم حلول لوجستية مصممة للتجارة الإلكترونية في المغرب مع دعم حقيقي لنمو متجرك: مصاريف واضحة، فريق دعم سريع، وتقارير أداء تساعدك على اتخاذ القرار.</p>
            <ul className="about-list">
              <li><FiCheckCircle className='i'/> تحصيل آمن وسريع للدفع عند الاستلام</li>
              <li><FiCheckCircle className='i'/> واجهة تتبع بسيطة لعملائك</li>
              <li><FiCheckCircle className='i'/> استلام يومي وتغطية المدن والقرى</li>
              <li><FiCheckCircle className='i'/> تكامل مرن مع متاجرك الرقمية</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="service" className="services">
        <div className="section-title">
          <span className="badge">خدماتنا</span>
          <h2>مصممة خصيصًا لنمو تجارتك</h2>
          <p>نحن نقدم مجموعة متكاملة من الحلول اللوجستية لضمان وصول شحناتك بسرعة وأمان.</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FiDollarSign />
            </div>
            <h3>الدفع عند الاستلام (COD)</h3>
            <p>تحصيل آمن وموثوق لأموالك من العملاء في جميع أنحاء المغرب مع تحويلات سريعة ومنتظمة.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FiCrosshair />
            </div>
            <h3>تتبع مباشر للشحنات</h3>
            <p>لوحة تحكم سهلة لك ولعملائك لمتابعة حالة الشحنة لحظة بلحظة من الاستلام حتى التسليم.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FiGlobe />
            </div>
            <h3>تغطية وطنية شاملة</h3>
            <p>نصل إلى كل المدن والقرى في المغرب، مما يضمن توسع أعمالك التجارية في كل مكان.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarif" className="pricing">
        <div className="section-title">
          <span className="badge">الأثمنة</span>
          <h2>أسعار المدن حسب التوصيل</h2>
          <p>ابحث عن المدينة أو صَفِ حسب السعر، مع صفحات لتصفح كل النتائج بسهولة.</p>
        </div>

        <div className="pricing-controls" dir="rtl">
          <div className="row-controls">
            <input
              type="text"
              placeholder="ابحث عن مدينة..."
              value={searchVille}
              onChange={(e) => { setSearchVille(e.target.value); setPage(1); }}
              className="input control"
            />
            <input
              type="number"
              placeholder="السعر الأدنى"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              className="input control"
              min="0"
            />
            <input
              type="number"
              placeholder="السعر الأقصى"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              className="input control"
              min="0"
            />
            <button className="btn btn-outline" onClick={resetFilters}>إعادة التعيين</button>
          </div>
          <div className="meta">
            <span>إجمالي النتائج: {filteredVilles.length}</span>
          </div>
        </div>

        <div className="pricing-table-container">
          {villesLoading ? (
            <div className="loading">جاري تحميل المدن...</div>
          ) : (
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>المدينة</th>
                  <th>السعر (درهم)</th>
                  <th>المنطقة</th>
                </tr>
              </thead>
              <tbody>
                {pagedVilles.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>لا توجد نتائج مطابقة</td>
                  </tr>
                ) : (
                  pagedVilles.map((v) => (
                    <tr key={v._id || v.ref}>
                      <td>{v.nom}</td>
                      <td>{Number(v.tarif || 0)} درهم</td>
                      <td>{v?.region?.name || v?.region?.nom || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination" role="navigation" aria-label="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >السابق</button>
          {pageNumbers.map((p, idx) => (
            typeof p === 'number' ? (
              <button
                key={`p-${p}`}
                className={`page-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ) : (
              <span key={`e-${idx}`} className="page-info">…</span>
            )
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >التالي</button>
        </div>

        <div className="pricing-cta">
          <a href="#contact" className="btn btn-primary">اطلب عرض أسعار مخصص</a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="section-title">
          <span className="badge">تواصل معنا</span>
          <h2>هل لديك أي استفسار؟</h2>
          <p>فريقنا جاهز للإجابة على جميع أسئلتك وتقديم الدعم اللازم لك.</p>
        </div>
        <div className="contact-container">
          <div className="contact-info">
            <h3>معلومات الاتصال</h3>
            <p>لا تتردد في التواصل معنا عبر القنوات التالية. نحن هنا لمساعدتك.</p>
            <ul>
              <li><FiMail className='i'/> support@eromax.com</li>
              <li><FiPhone className='i'/><span dir="ltr"> +212 5 06 63 32 25</span></li>
              <li><FiClock className='i'/> الإثنين - الجمعة | 9h - 18h</li>
            </ul>
            <div className="social-links">
              <a href="https://web.facebook.com/profile.php?id=61561358108705" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-link"><FaFacebookF /></a>
              <a href="https://www.instagram.com/eromax.ma/profilecard/?igsh=MTg0bDQ5ZmlpZDVraw==" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link"><FaInstagram /></a>
              <a href="https://www.tiktok.com/@eromax.ma?_t=8sBRoCXyCCz&_r=1" target="_blank" rel="noreferrer" aria-label="TikTok" className="social-link"><FaTiktok /></a>
            </div>
          </div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">الاسم الكامل</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">رسالتك</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">إرسال الرسالة</button>
          </form>
        </div>
      </section>

     
      {/* Testimonials Section (Horizontal Scroll) */}
      <section id="testimonials" className="testimonials" dir="rtl">
        <div className="section-title">
          <span className="badge">آراء عملائنا</span>
          <h2>ثقة التجار في إيروماكس</h2>
          <p>آراء حقيقية من شركائنا في النجاح من مختلف المجالات والمتاجر الإلكترونية.</p>
        </div>
        <div className="t-scroller" dir="ltr" aria-label="قائمة الشهادات" role="region" ref={scrollerRef} onMouseEnter={() => setTPaused(true)} onMouseLeave={() => setTPaused(false)}>
          <div className="t-list" ref={listRef}>
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div className="testimonial-card t-item" key={`${t.name}-${idx}`} aria-hidden={idx >= testimonials.length}>
                <div className="avatar" aria-hidden="true">{t.name.charAt(0)}</div>
                <blockquote>“{t.quote}”</blockquote>
                <div className="author">
                  <strong>{t.name}</strong>
                  <span className="role">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}

export default Home