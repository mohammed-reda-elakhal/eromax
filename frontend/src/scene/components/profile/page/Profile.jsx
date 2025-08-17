import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../profile.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import ProfileClientV2 from '../components/ProfileClientV2';
import ProfileLivreurV2 from '../components/ProfileLivreurV2';
import ProfileAdminV2 from '../components/ProfileAdminV2';
import { useSelector } from 'react-redux';

function Profile() {
    const { theme } = useContext(ThemeContext);
    const authUser = useSelector((state) => state.auth.user);
    const role = authUser?.role;

    // Set theme attribute on document body for CSS variables
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <div className="container-profile">
                            {role === 'client' && <ProfileClientV2 theme={theme} />}
                            {role === 'livreur' && <ProfileLivreurV2 theme={theme} />}
                            {role === 'admin' && <ProfileAdminV2 theme={theme} />}
                            {!role && (
                                <div style={{ padding: 16 }}>
                                    Unable to detect user role. Please sign in again.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;
