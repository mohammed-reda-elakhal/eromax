import { Button, Divider, Image, Upload, Descriptions } from 'antd';
import React, { useEffect, useState } from 'react';
import { MdVerified } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { getProfileClient } from '../../../../redux/apiCalls/profileApiCalls';
import { useParams } from 'react-router-dom';

function ProfileInfo() {
    const [verify, setVerify] = useState(false);
    const dispatch = useDispatch();
    const { id } = useParams();

    // Access profile data from Redux store
    const profileData = useSelector((state) => state.profile.profile);

    useEffect(() => {
        dispatch(getProfileClient(id));
        window.scrollTo(0, 0);
    }, [dispatch, id]);

    const items = [
        {
            key: '1',
            label: 'Nom Complet',
            children: profileData ? `${profileData.nom} ${profileData.prenom}` : '',
        },
        {
            key: '2',
            label: 'CIN',
            children: profileData ? profileData.cin : '',
        },
        {
            key: '3',
            label: 'Telephone',
            children: profileData ? profileData.tele : '',
        },
        {
            key: '4',
            label: 'Email',
            children: profileData ? profileData.email : '',
        },
        {
            key: '5',
            label: 'Ville',
            children: profileData ? profileData.ville : '',
        },
        {
            key: '6',
            label: 'Address',
            children: profileData ? profileData.adresse : '',
        },
        {
            key: '7',
            label: 'Businesses',
            children: profileData ? profileData.businesses : 0,
        },
        {
            key: '8',
            label: 'Date de Création',
            children: profileData ? profileData.createdAt : '',
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
                            src={profileData?.profileImage || "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"}
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
                            {profileData ? `${profileData.nom} ${profileData.prenom}` : ''}
                            <MdVerified style={verify ? {color:"blue"} : {color:"var(--gray)"} }/>
                        </h3>
                        <span>Client</span>
                        <p>{profileData ? profileData.tele : ''}</p>
                        <p>{profileData ? profileData.ville : ''}</p>
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
    );
}

export default ProfileInfo;
