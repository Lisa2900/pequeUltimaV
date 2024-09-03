import React from 'react';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar, IonImg } from '@ionic/react';

interface VerDetalleProps {
  producto: Producto | null; // Permitir que producto sea null
  isOpen: boolean;
  onClose: () => void;
}

interface Producto {
  id: string; // Add any other necessary fields
  cantidad: number;
  codigo: string;
  nombre: string;
  precio: number;
  imagenURL?: string; // Optional, if not always present
  barcodeURL?: string; // Optional, if not always present
}

const VerDetalle: React.FC<VerDetalleProps> = ({ producto, isOpen, onClose }) => {
  if (!producto) {
    return null; // Si producto es null, retornar null o manejar el caso vacío según lo necesites
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalles del Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Nombre: {producto.nombre}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Código: {producto.codigo}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Cantidad en Inventario: {producto.cantidad}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Precio: ${producto.precio}</IonLabel>
          </IonItem>
          {producto.imagenURL && (
            <IonItem>
              <IonImg src={producto.imagenURL} alt={`Imagen del producto ${producto.codigo}`} />
            </IonItem>
          )}
        </IonList>
        <IonButton onClick={onClose}>Cerrar</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default VerDetalle;
