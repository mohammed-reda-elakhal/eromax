import React from 'react'
import ContactForm from './ContactForm'
import Question from './Question'
import './contact.css'
import HeaderSection from '../header/HeaderSection'

function Contact() {
  return (
    <div className='contact-section' id='contact'>
        <HeaderSection
          nom={`Contact`}
          title={`Contactez-nous`}
          desc={`Pour plus d'information contactez-nous`}
        />
        <div className="contact-section-main">
            <Question/>
            <ContactForm/>
        </div>
    </div>
  )
}

export default Contact