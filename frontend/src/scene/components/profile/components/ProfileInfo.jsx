import { Button, Divider, Image, Upload } from 'antd'
import React, { useEffect, useState } from 'react'
import { MdVerified } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { Descriptions } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileClient } from '../../../../redux/apiCalls/profileApiCalls';
import { useParams } from 'react-router-dom';

function ProfileInfo() {
    const [verify , setVerify] = useState(false)
    const [profileData ,  setProfileData] = useState({}) 
    const dispatch = useDispatch()
    const {id} = useParams()

    useEffect(()=>{
      dispatch(getProfileClient(id))
      window.scrollTo(0 , 0)
    })

    const items = [
        {
          key: '1',
          label: 'Nom Complete',
          children: 'Mohammed reda',
        },
        {
          key: '2',
          label: 'CIN',
          children: 'AY12579',
        },
        {
          key: '3',
          label: 'Telephone',
          children: '0690137708',
        },
        {
          key: '4',
          label: 'Email',
          children: 'mohammedreda@gmail.com',
        },
        {
            key: '5',
            label: 'Ville',
            children: 'Kenitra',
          },
        {
          key: '6',
          label: 'Address',
          children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
        },
        {
            key: '7',
            label: 'Businesses',
            children: 2,
          },
          {
            key: '8',
            label: 'Date de Creation',
            children: '2024-07-16',
          },
      ];
  return (
    <div className='profile_information'>
        <div className="profile_information_header">
            <div className="profile_information_image">
                <div>
                    <Image
                        className='profile_information_image-img'
                        width={150}
                        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <Upload>
                        <Button 
                            icon={<FaRegPenToSquare/>} 
                            type='primary'
                            className='profile_information_image-btn'
                        >
                        </Button>
                    </Upload>
                </div>
                <div className="profile_information_header-info">
                    <h3>
                        {profileData.nom + " " + profileData.prenom}
                        <MdVerified style={verify ? {color:"blue"} : {color:"var(--gray)"} }/>
                    </h3>
                    <span>Client</span>
                    <p>0690137708</p>
                    <p>Kenitra</p>
                </div>
            </div>
            <Button type='primary'>
                Modifier Profile
            </Button>
        </div>
        <Divider/>
        <div className="profile_information_main">
            <Descriptions title="Information" items={items} />
        </div>
    </div>
  )
}

export default ProfileInfo