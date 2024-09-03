import React, { useEffect } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { app } from '../firebase';
import { barcode } from 'ionicons/icons'; // Importa el ícono de barras

interface ScannerProps {
  onCodeScanned: (code: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCodeScanned }) => {

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await BarcodeScanner.requestPermissions();
      } catch (error) {
        console.error('Permission request failed', error);
      }
    };

    requestPermissions();
  }, []);

  const handleScanButtonClick = async () => {
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode, BarcodeFormat.Code128, BarcodeFormat.Ean13],
      });
      if (barcodes.length > 0) {
        const scannedValue = barcodes[0].rawValue || 'No data found';
        onCodeScanned(scannedValue);
      }
    } catch (error) {
      console.error('Error scanning barcode', error);
    }
  };

  return (
    <IonButton
    expand="full"
    fill="clear"
    className="rounded-full"
    onClick={handleScanButtonClick}
    color="blue"
    style={{ marginBottom: '10px' }}
  >
    <IonIcon icon={barcode} />
  </IonButton>
    
  );
};

export default Scanner;
