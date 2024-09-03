import React from 'react';
import { IonModal, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonLabel } from '@ionic/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: (confirm: boolean) => void;
  amount: number; // Añadir la propiedad amount
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, amount }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={() => onClose(false)}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Confirmar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <p>¿Estás seguro de que deseas marcar esta reparación como entregada?</p>
          <IonLabel>La cantidad a liquidar es: ${amount}</IonLabel>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <IonButton
              onClick={() => {
                onClose(true);
              }}
              color="primary"
              style={{ marginRight: '8px' }}
            >
              Confirmar
            </IonButton>
            <IonButton
              onClick={() => {
                onClose(false);
              }}
              color="medium"
            >
              Cancelar
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ConfirmModal;
