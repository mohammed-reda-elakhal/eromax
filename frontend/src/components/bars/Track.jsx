import React , { useState} from 'react'
import './bars.css'
import { Input, Drawer , Button } from 'antd';

function Track() {
    const { Search } = Input;
    const [open, setOpen] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
  return (
    <div className='track-bar'>
        <h1>Suivre votre Colis</h1>
        <p>S’il vous plaît, saisissez le numéro de suivre pour votre colis.</p>
        <Search
            placeholder="Taper votre numéro de suivi"
            allowClear
            enterButton="Suivre"
            size="large"
            className='track-input'
            onSearch={showDrawer}
        />
        <Drawer title="les données de colis suivre" onClose={onClose} open={open}>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
        </Drawer>
    </div>
  )
}

export default Track