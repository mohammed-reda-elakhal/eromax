import { Button, Divider, Image, Upload, Descriptions, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import { MdVerified } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../../../../redux/apiCalls/profileApiCalls';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';


function ProfileInfo() {
    const [verify, setVerify] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = JSON.parse(Cookies.get('user'));
    const { id } = useParams();
    const {profile} = useSelector((state) => state.profile);

    useEffect(() => {
        if (user) {
            const userId = id || user._id;
            dispatch(getProfile(userId , user.role));
        }
        window.scrollTo(0, 0);
    }, [dispatch, user, id, navigate]);

    const getProfileItems = (role, profile) => {
        let items = [];

        if (profile) {
            items = [
                { key: '1', label: 'Nom Complet', children: `${profile.nom} ${profile.prenom}` },
                { key: '2', label: 'Téléphone', children: profile.tele },
                { key: '3', label: 'Email', children: profile.email },
                
            ];

            if (role === 'client') {
                items.push({ key: '4', label: 'Ville', children: profile.ville })
                items.push({ key: '5', label: 'Adresse', children: profile.adresse },)
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });
            } else if (role === 'livreur') {
                items.push({ key: '4', label: 'Ville', children: profile.ville });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse });
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });
                
                // Add the list of cities for livreur role
                if (profile.villes && profile.villes.length > 0) {
                    items.push({
                        key: 'Villes',
                        label: 'List Villes',
                        children: profile.villes.map(ville => ville).join(' - ') || 'Aucune ville',
                    });
                }
            }
            
            else if (role === 'team') {
                items.push({ key: '4', label: 'Ville', children: profile.ville })
                items.push({ key: '5', label: 'Adresse', children: profile.adresse },)
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });
            }
        }

        return items;
    };

    const handleModifieProfileRoute = () => {
        navigate(`/dashboard/compte/${user.role}/${id}` ,  { state: { from: `/dashboard/profile/${id}` } })
    }

    const profileItems = getProfileItems(user.role, profile);

    

    return (
        <div className='profile_information'>
            <div className="profile_information_header">
                <div className="profile_information_image">
                    <div className='profile_information_photo'>
                        <Image
                            className='profile_information_image-img'
                            width={150}
                            src={"https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"}
                        />
                        <Upload>
                            <Button icon={<FaRegPenToSquare />} type='primary'>Modifier Photo</Button>
                        </Upload>
                        <h2>{profile ? profile.username : ''}</h2>
                    </div>
                </div>
            </div>
            <Divider />
            <div className="profile_information_main">
                <Button type='primary' icon={<FaRegPenToSquare />} onClick={()=>handleModifieProfileRoute()}>
                    Modifier Profile
                </Button>
                <Descriptions title="Information" items={profileItems} />
            </div>
        </div>
    );
}

export default ProfileInfo;
