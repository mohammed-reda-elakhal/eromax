import React from 'react'
import Header from '../components/header/Header'
import Cover from '../components/cover/Cover'
import Track from '../components/bars/Track'
import About from '../components/about/About'
import Service from '../components/service/Service'
import Avantage from '../components/avantage/Avantage'
import Contact from '../components/contact/Contact'
import { FloatButton } from 'antd';
import Footer from './../components/footer/Footer';
import Tarif from '../components/tarif/Tarif'
import Map from './../components/map/Map';

function Home() {
  return (
    <div>
        <Header/>
        <Cover/>
        <FloatButton.BackTop />
        <Track/>
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