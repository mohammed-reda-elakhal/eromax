import React, { useState } from 'react';
import './track.css';
import { Input, Drawer, Steps, Alert } from 'antd';

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
                <h4>
                    Code de votre colis :
                    <span>{codeSuivre}</span>
                </h4>
                <Steps
                    progressDot
                    current={1}
                    direction="vertical"
                    items={[
                        {
                            title: 'Finished',
                            description: 'This is a description. This is a description.',
                        },
                        {
                            title: 'Finished',
                            description: 'This is a description. This is a description.',
                        },
                        {
                            title: 'In Progress',
                            description: 'This is a description. This is a description.',
                        },
                        {
                            title: 'Waiting',
                            description: 'This is a description.',
                        },
                        {
                            title: 'Waiting',
                            description: 'This is a description.',
                        },
                    ]}
                />
            </Drawer>
        </section>
    );
}

export default Track;
