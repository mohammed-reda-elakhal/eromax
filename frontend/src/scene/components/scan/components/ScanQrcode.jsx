import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Input } from 'antd';

function ScanQrcode({theme}) {
  const [scannerResult, setScannerResult] = useState(null);

  const darkStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    borderColor: 'gray',
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      setScannerResult(result);
    }
    function error(err) {
      console.warn(err);
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      scanner.clear();
    };
  }, []); // <-- Fix here: properly closing the useEffect dependency array

  return (
    <div>
      <h1>Scanning Qr code:</h1>
      <div id="reader"></div>
      <div className="input-scan">
        <label htmlFor="code_suivi">Code Suivi :</label>
        <Input 
          placeholder="Code suivi Scan" 
          value={scannerResult} 
          style={theme === 'dark' ? darkStyle : {}}
        />
      </div>
    </div>
  );
}

export default ScanQrcode;
