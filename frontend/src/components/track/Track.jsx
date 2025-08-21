import React, { useState } from 'react';
import './track.css';
import { Input, Drawer, Steps, Alert } from 'antd';
import TrackingColis from '../../scene/global/TrackingColis ';


function Track() {
    const [open, setOpen] = useState(false);
    const [codeSuivre, setCodeSuivre] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        setCodeSuivre(""); // Clear the input field when the drawer is closed
    };

    const handleSuivreColis = () => {
        if (codeSuivre !== "") {
            setShowAlert(false); // Hide alert if previously shown
            showDrawer();
        } else {
            setShowAlert(true);
        }
    };

    return (
        <section className='track' dir="rtl">
            <h1>تتبع طردك</h1>
            <p>أدخل رقم التتبع الخاص بطردك للحصول على آخر التحديثات حول حالة الشحن</p>
            <div className="track-input">
                <Input
                    placeholder="أدخل رقم التتبع هنا"
                    size='large'
                    onChange={(e) => setCodeSuivre(e.target.value)}
                    value={codeSuivre}
                    style={{ textAlign: 'right', direction: 'rtl' }}
                />
                <button className='submit-btn' onClick={handleSuivreColis}>
                    تتبع الآن
                </button>
            </div>
            {showAlert && (
                <Alert
                    message="رقم التتبع مطلوب"
                    description="يرجى إدخال رقم التتبع الصحيح للطرد للمتابعة"
                    type="warning"
                    showIcon
                    closable
                    onClose={() => setShowAlert(false)}
                    style={{ textAlign: 'right', direction: 'rtl' }}
                />
            )}
            <Drawer 
                title="تفاصيل تتبع الطرد" 
                onClose={onClose} 
                open={open}
                placement="right"
                style={{ direction: 'rtl' }}
            >
                <TrackingColis codeSuivi={codeSuivre} />
            </Drawer>
        </section>
    );
}

export default Track;
