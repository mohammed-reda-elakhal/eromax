import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Input } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ScanQrcode({ theme, statu, livreur }) {
  const [scannerResult, setScannerResult] = useState('');
  const [scannerInstance, setScannerInstance] = useState(null);

  const darkStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    borderColor: 'gray',
  };

  const success = (result) => {
    setScannerResult(result);
    if (scannerInstance) {
      scannerInstance.clear(); // Stop scanning after result is found
    }
  };

  const error = (err) => {
    console.warn(err);
  };

  useEffect(() => {
    const initializeScanner = () => {
      const readerDiv = document.getElementById('reader');
      if (readerDiv) {
        const scanner = new Html5QrcodeScanner('reader', {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        });
        scanner.render(success, error);
        setScannerInstance(scanner); // Save the scanner instance to state
      }
    };

    initializeScanner();
    
    return () => {
      if (scannerInstance) {
        scannerInstance.clear(); // Clean up scanner on component unmount
      }
    };
  }, []);

  useEffect(() => {
    if (scannerResult) {
      handleSubmit();
    }
  }, [scannerResult]);

  const handleSubmit = () => {
   if(statu != null){
    if (scannerResult) {
      console.log(`Changing status of colis with code ${scannerResult} to ${statu} assigned to ${livreur}`);

      toast.success('Status changed successfully!', {
        position: "top-right",
        autoClose: 2000,
      });

      setScannerResult(''); // Clear input field for next scan

      // Optionally restart the scanner after a delay
      setTimeout(() => {
        if (scannerInstance) {
          scannerInstance.render(success, error); // Restart scanning
        }
      }, 2000); // 2 seconds delay
    } else {
      toast.error('No code scanned. Please scan a code first.', {
        position: "top-right",
        autoClose: 2000,
      });
    }
   }else{
    toast.error("S'il vous plit , selection statu")
    setScannerResult('')
    // Optionally restart the scanner after a delay
    setTimeout(() => {
      if (scannerInstance) {
        scannerInstance.render(success, error); // Restart scanning
      }
    }, 2000); // 2 seconds delay
  }
  };

  return (
    <div>
      <div>
        {statu && (<p>Statu: {statu}</p>)}
        {livreur && (<p>Livreur: {livreur}</p>)}
      </div>
      <h3>Scanning QR code:</h3>
      <div id="reader"></div>
      <div className="input-scan">
        <label htmlFor="code_suivi">Code Suivi :</label>
        <Input
          placeholder="Code suivi Scan"
          value={scannerResult}
          onChange={(e) => setScannerResult(e.target.value)}
          style={theme === 'dark' ? darkStyle : {}}
        />
      </div>
      <ToastContainer />
    </div>
  );
}

export default ScanQrcode;
