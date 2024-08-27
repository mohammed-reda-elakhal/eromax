import { Button, Divider, Image, Upload, Descriptions, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import { MdVerified } from "react-icons/md";
import { FaRegPenToSquare } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { getProfileClient, getProfileLivreur, getProfileTeam, getProfileAdmin, getProfile } from '../../../../redux/apiCalls/profileApiCalls';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { toast } from 'react-toastify';

function ProfileInfo() {
    const [verify, setVerify] = useState(false);
    const [drawerProfile, setDrawerProfile] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
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
                { key: '4', label: 'Ville', children: profile.ville },
                
            ];

            if (role === 'client') {
                items.push({ key: '6', label: 'CIN', children: profile.cin || 'N/A' });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse },)
                items.push({ key: '7', label: 'Nombre de Colis', children: profile.number_colis || 'N/A' });
            } else if (role === 'livreur') {
                items.push({ key: '6', label: 'Active', children: profile.active ? 'Oui' : 'Non' });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse },)
            } else if (role === 'team') {
                items.push({ key: '6', label: 'File ID', children: profile.file || 'N/A' });
                items.push({ key: '5', label: 'Adresse', children: profile.adresse },)
            }
        }

        return items;
    };

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
                <Button type='primary' icon={<FaRegPenToSquare />} onClick={() => setDrawerProfile(true)}>
                    Modifier Profile
                </Button>
                <Descriptions title="Information" items={profileItems} />
                <Drawer
                    title="Modifier votre profile"
                    onClose={() => setDrawerProfile(false)}
                    open={drawerProfile}
                >
                    <ProfileForm data={profile} drawer={setDrawerProfile}/>
                </Drawer>
            </div>
        </div>
    );
}

export default ProfileInfo;
