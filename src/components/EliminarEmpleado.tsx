import React, { useState } from "react";
import { IonContent, IonButton, IonAlert } from "@ionic/react";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

const EliminarEmpleado: React.FC<{ userId: string }> = ({ userId }) => {
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const onDelete = async () => {
    try {
      await deleteDoc(doc(db, "usuarios", userId));
      setShowAlert(true);
    } catch (error) {
      console.error("Error deleting empleado: ", error);
    }
  };

  return (
    <IonContent>
      <IonButton onClick={onDelete}>Eliminar Empleado</IonButton>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Eliminación Exitosa"}
        message={"¡El empleado ha sido eliminado!"}
        buttons={["OK"]}
      />
    </IonContent>
  );
};

export default EliminarEmpleado;
