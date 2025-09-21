import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch , useSelector } from 'react-redux';
import { registerUser } from '../redux/apiCalls/authApiCalls';
import { getAllVilles } from '../redux/apiCalls/villeApiCalls';
import SEO from '../components/SEO/SEO';
import Header2 from '../components/header/Header2';
import './Register.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { villes } = useSelector((state) => state.ville);

  const [showCustomStartDate, setShowCustomStartDate] = useState(false);
  const [showCustomNumberColis, setShowCustomNumberColis] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [numberColis, setNumberColis] = useState('');

  useEffect(() => {
    if (villes.length === 0) {
      dispatch(getAllVilles());
    }
    window.scrollTo(0, 0);
  }, [dispatch, villes.length]);

  const handlePhoneChange = (e) => {
    let val = (e.target.value || '').replace(/\D/g, '');
    if (val && !val.startsWith('0')) val = '0' + val;
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    setShowCustomStartDate(value === 'More');
  };

  const handleNumberColisChange = (e) => {
    const value = e.target.value;
    setNumberColis(value);
    setShowCustomNumberColis(value === 'More');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const values = Object.fromEntries(data.entries());

    if (password !== confirmPassword) {
      setPwdError('كلمتا المرور غير متطابقتين');
      return;
    }
    setPwdError('');

    const formData = {
      nom: values.nom,
      prenom: values.prenom,
      email: (values.email || '').trim().toLowerCase(),
      tele: phone || values.tele,
      ville: values.ville,
      password: password,
      start_date: (values.start_date === 'More') ? values.start_date_custom : values.start_date,
      number_colis: (values.number_colis === 'More') ? values.number_colis_custom : values.number_colis,
      storeName: values.storeName
    };

    dispatch(registerUser('client', formData));
    navigate('/login');
  };

  return (
    <div className="register-section" dir="rtl">
      <SEO
        title="إنشاء حساب"
        description="أنشئ حسابك على EROMAX لبدء شحن الطرود وتتبع التسليم وإدارة لوجستيك متجرك بسهولة."
        keywords="تسجيل, إنشاء حساب, ايرومكس, EROMAX, توصيل, شحن"
      />
      <Header2 />
      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="register-logo">
            <img src="/image/logo-light.png" alt="EROMAX" />
          </Link>
        </div>

        <div className="register-card">
          <div className="register-title">
            <p>أنشئ حسابك على EROMAX</p>
          </div>

          <form className="reg-form" onSubmit={handleSubmit}>
            <div className="reg-field">
              <label htmlFor="nom">الاسم <span className="req">*</span></label>
              <input id="nom" name="nom" className="reg-input" placeholder="الاسم" required />
            </div>

            <div className="reg-field">
              <label htmlFor="prenom">النسب <span className="req">*</span></label>
              <input id="prenom" name="prenom" className="reg-input" placeholder="النسب" required />
            </div>

            <div className="reg-field reg-col-span-2">
              <label htmlFor="storeName">اسم المتجر <span className="req">*</span></label>
              <input id="storeName" name="storeName" className="reg-input" placeholder="اسم المتجر" required />
            </div>

            <div className="reg-field">
              <label htmlFor="email">البريد الإلكتروني <span className="req">*</span></label>
              <input id="email" name="email" type="email" className="reg-input" placeholder="example@email.com" required />
            </div>

            <div className="reg-field">
              <label htmlFor="tele">الهاتف <span className="req">*</span></label>
              <input
                id="tele"
                name="tele"
                className="reg-input"
                placeholder="06XXXXXXXX"
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="يجب إدخال 10 أرقام"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
              <div className="reg-hint">أدخل رقمًا مغربيًا صحيحًا (10 أرقام يبدأ بـ 0)</div>
            </div>

            <div className="reg-field reg-col-span-2">
              <label htmlFor="ville">المدينة</label>
              <select id="ville" name="ville" className="reg-select" defaultValue="">
                <option value="" disabled>اختر مدينتك (اختياري)</option>
                {villes.map((v) => (
                  <option key={v._id} value={v.nom}>{v.nom}</option>
                ))}
              </select>
            </div>

            <div className="reg-field">
              <label htmlFor="password">كلمة المرور <span className="req">*</span></label>
              <div className="reg-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`reg-input has-toggle${pwdError ? ' invalid' : ''}`}
                  placeholder="••••••"
                  minLength={5}
                  value={password}
                  onChange={(e)=>{ setPassword(e.target.value); if (pwdError && e.target.value === confirmPassword) setPwdError(''); }}
                  required
                />
                <button type="button" className="reg-toggle" aria-label={showPwd ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={()=>setShowPwd(v=>!v)}>
                  {showPwd ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
                </button>
              </div>
            </div>

            <div className="reg-field">
              <label htmlFor="confirm_password">تأكيد كلمة المرور <span className="req">*</span></label>
              <div className="reg-input-wrap">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPwd2 ? 'text' : 'password'}
                  className={`reg-input has-toggle${pwdError ? ' invalid' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                  minLength={5}
                  value={confirmPassword}
                  onChange={(e)=>{ setConfirmPassword(e.target.value); if (pwdError && password === e.target.value) setPwdError(''); }}
                  required
                />
                <button type="button" className="reg-toggle" aria-label={showPwd2 ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={()=>setShowPwd2(v=>!v)}>
                  {showPwd2 ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
                </button>
              </div>
              {pwdError && <div className="reg-error">{pwdError}</div>}
            </div>

            <div className="reg-field reg-col-span-2">
              <label>تاريخ البدء</label>
              <div className="reg-radio-group" onChange={handleStartDateChange}>
                <label className="reg-radio"><input type="radio" name="start_date" value="Maintenant" required /> الآن</label>
                <label className="reg-radio"><input type="radio" name="start_date" value="Après Semaine" /> بعد أسبوع</label>
                <label className="reg-radio"><input type="radio" name="start_date" value="Après Mois" /> بعد شهر</label>
                <label className="reg-radio"><input type="radio" name="start_date" value="More" /> أخرى...</label>
              </div>
            </div>

            {showCustomStartDate && (
              <div className="reg-field reg-col-span-2">
                <label htmlFor="start_date_custom">حدد تاريخ البدء</label>
                <input id="start_date_custom" name="start_date_custom" className="reg-input" placeholder="حدد تاريخ البدء" />
              </div>
            )}

            <div className="reg-field reg-col-span-2">
              <label>عدد الطرود يومياً</label>
              <div className="reg-radio-group" onChange={handleNumberColisChange}>
                <label className="reg-radio"><input type="radio" name="number_colis" value="1-5" required /> 1-5</label>
                <label className="reg-radio"><input type="radio" name="number_colis" value="5-10" /> 5-10</label>
                <label className="reg-radio"><input type="radio" name="number_colis" value="10-50" /> 10-50</label>
                <label className="reg-radio"><input type="radio" name="number_colis" value="More" /> أخرى...</label>
              </div>
            </div>

            {showCustomNumberColis && (
              <div className="reg-field reg-col-span-2">
                <label htmlFor="number_colis_custom">حدد عدد الطرود</label>
                <input id="number_colis_custom" name="number_colis_custom" className="reg-input" placeholder="حدد عدد الطرود" />
              </div>
            )}

            <div className="reg-actions reg-col-span-2">
              <button type="submit" className="reg-submit">إنشاء حساب</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
