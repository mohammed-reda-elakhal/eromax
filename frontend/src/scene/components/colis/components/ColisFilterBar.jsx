import React, { useState } from 'react';
import { Button, DatePicker } from 'antd';
import Select from 'react-select';
import { FaFilter } from "react-icons/fa";

const { RangePicker } = DatePicker;

const options = [
    {
        id: 1,
        name: 'sale'
    },
    {
        id: 2,
        name: 'rabat'
    }
];



function ColisFilterBar({ theme , darkStyle }) {
    const [ville, setVille] = useState('');
    const [etat, setEtat] = useState('');
    const [statu, setStatu] = useState('');
    const [dateRange, setDateRange] = useState([]);

    const handleChangeVille = (selectedOption) => {
        setVille(selectedOption);
    };

    const handleChangeEtat = (selectedOption) => {
        setEtat(selectedOption);
    };

    const handleChangeStatu = (selectedOption) => {
        setStatu(selectedOption);
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Ville:', ville);
        console.log('Etat:', etat);
        console.log('Statu:', statu);
        console.log('Date Range:', dateRange);
    };

    return (
        <div className='colis-filter'>
            <form onSubmit={handleSubmit}>
                <div className="filter-inputs">
                    <Select
                        options={options.map(option => ({
                            value: option.id,
                            label: option.name
                        }))}
                        value={ville}
                        onChange={handleChangeVille}
                        placeholder="Ville (TOUT)"
                        styles={theme === 'dark' ? darkStyle : {}}
                    />
                    <Select
                        options={options.map(option => ({
                            value: option.id,
                            label: option.name
                        }))}
                        value={etat}
                        onChange={handleChangeEtat}
                        placeholder="Etat (TOUT)"
                        styles={theme === 'dark' ? darkStyle : {}}
                    />
                    <Select
                        options={options.map(option => ({
                            value: option.id,
                            label: option.name
                        }))}
                        value={statu}
                        onChange={handleChangeStatu}
                        placeholder="Statu (TOUT)"
                        styles={theme === 'dark' ? darkStyle : {}}
                    />
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        placeholder={['Début', 'Fin']}
                        style={{ backgroundColor: 'transparent', }}
                        picker="date" // Ensure that the RangePicker is used as a date picker
                    />
                </div>
                <button className='btn-dashboard' type="submit">
                    <FaFilter style={{marginRight : "8"}}/>
                    Filter
                </button>
            </form>
        </div>
    );
}

export default ColisFilterBar;
