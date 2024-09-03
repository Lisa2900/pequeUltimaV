import React, { useState, FormEvent } from "react";
import Register1Img from "../img/nuevo.svg";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@nextui-org/react";
import { Card } from "@nextui-org/card";
import {
  IonContent,
  IonInput,
  IonSpinner,
  IonAlert,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonIcon,
  IonModal,
} from "@ionic/react";
import { people } from "ionicons/icons"; // Icono de gestión de usuarios
import CRUDModalUsuarios from "./Modales/CRUDModalUsuarios"; // Asegúrate de tener el componente de CRUD importado

const RegistroEmpleado: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isCRUDModalOpen, setIsCRUDModalOpen] = useState<boolean>(false); // Estado para controlar la visibilidad del modal

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Guarda el empleado en Firestore con la colección 'empleados'
      await setDoc(doc(db, "empleados", email), {
        email: email,
        contraseña: contraseña, // Aunque en la práctica no es seguro guardar contraseñas en texto plano.
        empleado: true,
        creadoEn: new Date(),
      });

      // Mostrar alerta de éxito
      setShowAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Error al registrar el empleado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="ion-padding">
      <Card className="max-w-md mx-auto bg-black mt-8 p-6 shadow-lg rounded-3xl text-white">
        <img
          alt="Silueta de montañas"
          src={Register1Img}
          className="w-1/2 mx-auto mb-4"
          style={{
            filter: "invert(1) sepia(1) saturate(10) hue-rotate(180deg)",
          }}
        />

        <IonCardHeader className="text-center rounded-b-3xl mb-4">
          <IonCardTitle className="text-2xl font-bold">Registrar empleado</IonCardTitle>
          <IonCardSubtitle className="text-gray-400">
            Registra a un empleado ingresando su correo y contraseña
          </IonCardSubtitle>
        </IonCardHeader>

        <form onSubmit={onSubmit} className="space-y-4 p-4">
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            required
            placeholder="Email"
            className="bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none text-white rounded-lg px-4 py-3"
          />

          <IonInput
            type="password"
            value={contraseña}
            onIonChange={(e) => setContraseña(e.detail.value!)}
            required
            placeholder="Contraseña"
            className="bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none text-white rounded-lg px-4 py-3"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? <IonSpinner name="bubbles" /> : "Registrar empleado"}
          </Button>

          {errorMessage && (
            <p className="text-red-500 text-center mt-4">
              {errorMessage}
            </p>
          )}
        </form>
        
        <IonButton
          expand="full"
          className="mt-4"
          onClick={() => setIsCRUDModalOpen(true)} // Abre el modal al hacer clic
        >
          Gestionar Empleados
          <IonIcon slot="end" icon={people} />
        </IonButton>
      </Card>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Registro Exitoso"
        message="¡Te has registrado correctamente!"
        buttons={["OK"]}
      />

      {/* Modal CRUD para gestionar empleados */}
      <IonModal isOpen={isCRUDModalOpen} onDidDismiss={() => setIsCRUDModalOpen(false)}>
        <CRUDModalUsuarios />
        <IonButton onClick={() => setIsCRUDModalOpen(false)}>Cerrar</IonButton>
      </IonModal>
    </IonContent>
  );
};

export default RegistroEmpleado;
