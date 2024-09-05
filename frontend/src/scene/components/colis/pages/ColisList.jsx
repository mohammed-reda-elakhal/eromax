import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import ColisFilterBar from '../components/ColisFilterBar';
import ColisTable from '../components/ColisTable';
import '../colis.css'
import { Link } from 'react-router-dom';



function ColisList({search}) {
    const { theme } = useContext(ThemeContext);
    const darkStyle = {
        control: (styles) => ({
            ...styles,
            backgroundColor: 'transparent',
            color: '#fff',
            borderColor: 'gray',
        }),
        placeholder: (styles) => ({
            ...styles,
            color: 'gray', // Set placeholder color to gray
        }),
        singleValue: (styles) => ({
            ...styles,
            color: '#fff',
        }),
        menu: (styles) => ({
            ...styles,
            backgroundColor: '#333',
            color: '#fff',
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isFocused ? '#444' : isSelected ? '#555' : undefined,
            color: isFocused || isSelected ? '#fff' : '#ccc',
        }),
        dropdownIndicator: (styles) => ({
            ...styles,
            color: 'gray',
        }),
        indicatorSeparator: (styles) => ({
            ...styles,
            backgroundColor: 'gray',
        }),
        // Additional styles for RangePicker
        calendarContainer: (styles) => ({
            ...styles,
            backgroundColor: '#333',
            color: '#fff',
        }),
        day: (styles) => ({
            ...styles,
            color: '#fff',
        }),
        datePickerInput: (styles) => ({
            ...styles,
            backgroundColor: 'transparent', // Set the background color of the date picker input to transparent
            border: 'none', // Optionally remove the border
            color: '#fff',
        }),
    };

    
    
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
                    <div className="page-content-header">
                        <Title nom='List Colis' />
                        <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
                            <PlusCircleFilled style={{marginRight:"8px"}} />
                            Ajouter Colis
                        </Link>
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <h4>List Colis</h4>
                        <ColisFilterBar theme={theme} darkStyle={darkStyle}/>
                        <ColisTable theme={theme} darkStyle={darkStyle} search={search}/>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColisList;
