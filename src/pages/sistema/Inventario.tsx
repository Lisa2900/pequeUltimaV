import React from 'react';
import Scanner from '../../components/Scanner';

import Table from '../../components/Table';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import Search from '../../components/Search';

function Inventario() {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inventario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Table/>
      </IonContent>
    </>
  );
}

export default Inventario;
