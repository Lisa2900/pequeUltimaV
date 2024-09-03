import React, { useState } from "react";
import { IonContent, IonInput, IonButton, IonAlert } from "@ionic/react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const ActualizarEmpleado: React.FC<{ userId: string }> = ({ userId }) => {
  const [email, setEmail] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const onSubmit = async () => {
    try {
      const empleadoRef = doc(db, "usuarios", userId);
      await updateDoc(empleadoRef, { email });
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating empleado: ", error);
    }
  };

  return (
    <IonContent>
      <IonInput
        value={email}
        onIonChange={(e) => setEmail(e.detail.value!)}
        placeholder="Nuevo Email"
      />
      <IonButton onClick={onSubmit}>Actualizar</IonButton>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Actualización Exitosa"}
        message={"¡La información del empleado se ha actualizado!"}
        buttons={["OK"]}
      />
    </IonContent>
  );
};

export default ActualizarEmpleado;
