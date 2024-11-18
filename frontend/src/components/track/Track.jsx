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
        <section className='track'>
            <h1>Suivre votre Colis</h1>
            <p>S’il vous plaît, saisissez le numéro de suivre pour votre colis.</p>
            <div className="track-input">
                <Input
                    placeholder="Taper votre numéro de suivi"
                    size='large'
                    onChange={(e) => setCodeSuivre(e.target.value)}
                    value={codeSuivre}
                />
                <button className='submit-btn' onClick={handleSuivreColis}>
                    Suivre
                </button>
            </div>
            {showAlert && (
                <Alert
                    message="Manque de code de suivi"
                    description="S'il vous plaît, saisissez le numéro de suivre pour votre colis."
                    type="warning"
                    showIcon
                    closable
                    onClose={() => setShowAlert(false)}
                />
            )}
            <Drawer title="Les données de colis suivre" onClose={onClose} open={open}>
                <TrackingColis codeSuivi={codeSuivre} />
            </Drawer>
        </section>
    );
}

export default Track;
