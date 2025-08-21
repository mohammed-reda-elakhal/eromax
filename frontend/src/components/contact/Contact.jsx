import React from 'react'
import ContactForm from './ContactForm'
import Question from './Question'
import './contact.css'
import HeaderSection from '../header/HeaderSection'

function Contact() {
  return (
    <div className='contact-section' id='contact' dir='rtl'>
        <HeaderSection
          nom={`اتصل بنا`}
          title={`هل لديك سؤال؟ نحن هنا لمساعدتك`}
          desc={`لأي استفسار أو شراكة، تواصل معنا وسنرد عليك بسرعة.`}
        />
        <div className="contact-section-main">
            <Question/>
            <ContactForm/>
        </div>
    </div>
  )
}

export default Contact