import React, { useState, useEffect } from 'react';
import { IonHeader, IonGrid, IonRow, IonCol } from '@ionic/react';
import Logo from '../img/LOGO copy.png';
import BackgroundImage from '../img/background.jpg';
import '../Styles/Header.css'; // Asegúrate de importar el archivo CSS

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timerId); // Cleanup function to clear interval on unmount
  }, []);

  return (
    <IonHeader
      className='bg-red-600 rounded-b-3xl'
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <IonGrid>
        <IonRow className="ion-align-items-center mt-[-20px]">
          <IonCol size="6" className="ion-text-center sm:ion-text-left">
            <img src={Logo} alt="CFE" className="mr-2" style={{ marginTop:'1.2em', width: '80%', maxWidth: '150px' }} />
          </IonCol>
          <IonCol size="6" className="ion-text-right">
            <p className="custom-date">
              {currentTime.toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).toUpperCase()}
            </p>
            <p className="custom-time">
              {currentTime.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Header;
