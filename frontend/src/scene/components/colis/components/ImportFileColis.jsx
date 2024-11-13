// src/components/UploadColisExcel.js

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMultipleColis } from '../../../../redux/apiCalls/colisApiCalls';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Button, Divider, Space, Table } from 'antd';

const ImportFileColis = () => {
    const dispatch = useDispatch();
    const loading = useSelector(state => state.colis.loading);
    const error = useSelector(state => state.colis.error);

    const [colisList, setColisList] = useState([]);

    // Handler for file drop
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Assume the first row is the header
                const headers = jsonData[0];
                const rows = jsonData.slice(1);

                const parsedColis = rows.map((row, index) => {
                    const colis = {};
                    headers.forEach((header, i) => {
                        colis[header] = row[i];
                    });
                    return colis;
                });

                setColisList(parsedColis);
                toast.success('Fichier Excel chargé et analysé avec succès!');
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        multiple: false,
    });

    // Handler to submit parsed colis
    const handleSubmit = (e) => {
        e.preventDefault();
        if (colisList.length === 0) {
            toast.error('Aucun colis à créer. Veuillez télécharger un fichier Excel valide.');
            return;
        }

        // Optional: Validate colisList here before dispatching

        dispatch(createMultipleColis(colisList));
        setColisList([])
    };

    const columns = [
      {
        title: 'Adress',
        dataIndex: 'adresse',
        key: 'adresse',
      },{
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
      },{
        title: 'Telephone',
        dataIndex: 'tele',
        key: 'tele',
      },{
        title: 'Ville',
        dataIndex: 'ville',
        key: 'ville',
      },
      {
        title: 'Nature de Produit',
        dataIndex: 'nature_produit',
        key: 'nature_produit',
      },
    ]

    return (
        <div style={styles.container}>
            <h2>Importer des Colis via Excel</h2>
            <div {...getRootProps()} style={isDragActive ? styles.activeDropzone : styles.dropzone}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Déposez le fichier ici...</p> :
                        <p>Glissez-déposez un fichier Excel ici, ou cliquez pour sélectionner un fichier</p>
                }
            </div>
            <Divider/>
            <Table 
              columns={columns}
              dataSource={colisList}

            />

            <Button onClick={handleSubmit} disabled={loading} style={styles.button}>
                {loading ? 'Création en cours...' : 'Ajouter les Colis'}
            </Button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

// Simple inline styles for demonstration
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
    },
    dropzone: {
        border: '2px dashed #cccccc',
        borderRadius: '5px',
        padding: '40px',
        cursor: 'pointer',
        backgroundColor: '#fafafa',
        color: '#bdbdbd',
    },
    activeDropzone: {
        border: '2px dashed #2196f3',
        backgroundColor: '#f0f8ff',
    },
    preview: {
        marginTop: '20px',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    button: {
        marginTop: '20px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
    },
};

export default ImportFileColis;
