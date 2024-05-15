import React from 'react'
import ContactForm from './ContactForm'
import Question from './Question'
import './contact.css'

function Contact() {
  return (
    <div className='contact-section' id='contact'>
        <div className="avantage-section-header">
            <h4>Contactez-nous</h4>
            <h1>Pour plus d'information contactez-nous</h1>
        </div>
        <div className="contact-section-main">
            <Question/>
            <ContactForm/>
        </div>
    </div>
  )
}

export default Contact