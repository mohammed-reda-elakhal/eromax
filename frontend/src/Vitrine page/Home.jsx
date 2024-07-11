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

function Home() {
  return (
    <div className='home'>
        <Header/>
        <Cover/>
        <Track/>
        <FloatButton.BackTop />
        <Service/>
        <About/>
        <Avantage/>
        <Contact/>
        <Tarif/>
        <Map/>
        <Footer/>
    </div>  
  )
}

export default Home