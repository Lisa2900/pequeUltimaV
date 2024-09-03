import { IonButton } from '@ionic/react';
import React from 'react';
import { useHistory } from 'react-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Asegúrate de importar la instancia de auth desde tu archivo firebase

const Salir: React.FC = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      // Cierra sesión en Firebase Authentication
      await signOut(auth);
      // Eliminar la marca de autenticación en localStorage
      localStorage.removeItem('loggedIn');
      // Redirigir al usuario a la página de inicio de sesión
      history.push("/login");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Manejo de errores si es necesario
    }
  };

  return (
    <IonButton onClick={handleLogout} color="danger">
      Cerrar sesión
    </IonButton>
  );
};

export default Salir;
