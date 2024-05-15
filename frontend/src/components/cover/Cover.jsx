import React from "react";
import { Carousel } from 'antd';
import './cover.css';

const Images = [
    {
        url: '/image/gift2.gif',
        caption: 'First Slide'
    },
    {
        url: '/image/gift1.gif',
        caption: 'Second Slide'
    },
];

function Cover() {
    return (
        <div className='cover'>
            <Carousel className="carousel" autoplay>
                {Images.map((image, index) => (
                    <div key={index} className="carousel-slide">
                        <img src={image.url} alt=""/>
                    </div>
                ))}
            </Carousel>
        </div>
    );
}

export default Cover;
