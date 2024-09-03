import {
  IonButton,
  IonCol,
  IonRow
} from '@ionic/react';
import React, { useState } from 'react';
import BuscarProducto from '../Modales/BuscarProducto';
import RegistrarReparacion from '../Modales/RegistrarReparacion';
import { Button } from "@nextui-org/react";
import '../../Styles/VenderReparar.css'; 

// Importa la imagen de fondo
import backgroundImage from '../../img/background.jpg';

const VenderReparar: React.FC = () => {
  const [showBuscarProductoModal, setShowBuscarProductoModal] = useState(false);
  const [showRegistrarReparacionModal, setShowRegistrarReparacionModal] = useState(false);

  const handleSalesButtonClick = () => {
    setShowBuscarProductoModal(true);
  };

  const handleServiceButtonClick = () => {
    setShowRegistrarReparacionModal(true);
  };

  return (
    <>
      <IonRow>
        <IonCol size="12" className="flex justify-start gap-4">
          <Button 
            className="
              transition 
              ease-in-out 
              delay-150 
              hover:-translate-y-1 
              hover:scale-110 
              duration-300 
              h-12 
              w-1/2 
              sm:w-1/6 
              text-white
              bg-cover
            " 
            style={{
              backgroundImage: `url(${backgroundImage})`, // Establece la imagen de fondo
              backgroundSize: 'cover', // Ajusta el tamaño de la imagen para cubrir el botón
              backgroundPosition: 'center', // Centra la imagen en el botón
            }}
            onClick={handleSalesButtonClick}
          >
            Realizar venta
          </Button>
          <Button 
            className="
              transition 
              ease-in-out 
              delay-150 
              hover:-translate-y-1 
              hover:scale-110 
              duration-300 
              h-12 
              w-1/2 
              sm:w-1/6 
              text-white
              bg-cover
            " 
            style={{
              backgroundImage: `url(${backgroundImage})`, // Establece la imagen de fondo
              backgroundSize: 'cover', // Ajusta el tamaño de la imagen para cubrir el botón
              backgroundPosition: 'center', // Centra la imagen en el botón
            }}
            onClick={handleServiceButtonClick}
          >
            Registrar reparacion
          </Button>
        </IonCol>
      </IonRow>

      <BuscarProducto showModal={showBuscarProductoModal} setShowModal={setShowBuscarProductoModal} />
      <RegistrarReparacion showModal={showRegistrarReparacionModal} setShowModal={setShowRegistrarReparacionModal} />
    </>
  );
};

export default VenderReparar;
