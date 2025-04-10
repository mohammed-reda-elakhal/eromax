import React from 'react'
import { FloatButton } from 'antd';
import Header from '../components/header/Header'
import Cover from '../components/cover/Cover'
import Track from '../components/track/Track'
import Service from '../components/service/Service';
import About from '../components/about us/About';
import Avantage from '../components/avantage/Avantage';
import Contact from '../components/contact/Contact';
import Tarif from '../components/tarif/Tarif';
import Footer from '../components/footer/Footer';
import Map from './../components/map/Map';
import SEO from '../components/SEO/SEO';

function Home() {
  // Structured data for the homepage (Organization)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Eromax",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo192.png`,
    "description": "Eromax provides reliable delivery and logistics services for businesses and individuals.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+212-XXXXXXXX", // Replace with actual phone number
      "contactType": "customer service"
    }
  };

  return (
    <div className='home'>
        <SEO
          title="Home"
          description="Eromax provides reliable delivery and logistics services for businesses and individuals. Track your packages, learn about our services, and contact us for more information."
          keywords="delivery, logistics, shipping, courier, packages, tracking, morocco, express delivery"
          structuredData={structuredData}
        />
        <Header/>
        <Cover/>
        <Track/>
        <FloatButton.BackTop />
        <div id="about">
          <About />
        </div>
        <div id="service">
          <Service />
        </div>
        <Avantage />
        <div id="contact">
          <Contact />
        </div>
        <div id="tarif">
          <Tarif />
        </div>
        <Map/>
        <Footer/>
    </div>
  )
}

export default Home