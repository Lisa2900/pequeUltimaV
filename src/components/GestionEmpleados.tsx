import React, { useEffect, useState } from "react";
import { IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonAlert, IonSpinner } from "@ionic/react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const GestionEmpleados: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState<string>("");

  // Función para obtener la lista de empleados desde Firestore
  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const empleadosData: any[] = [];
      querySnapshot.forEach((doc) => {
        empleadosData.push({ id: doc.id, ...doc.data() });
      });
      setEmpleados(empleadosData);
    } catch (error) {
      console.error("Error fetching empleados: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const onCreate = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const credencialUsuario = await createUserWithEmailAndPassword(auth, email, contraseña);
      const usuario = credencialUsuario.user;

      await setDoc(doc(db, "usuarios", usuario.uid), {
        email: usuario.email,
        empleado: true,
        creadoEn: new Date(),
      });

      setShowAlert(true);
      setEmail("");
      setContraseña("");
      // Refresh employee list
      fetchEmpleados();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    if (selectedUserId) {
      try {
        const empleadoRef = doc(db, "usuarios", selectedUserId);
        await updateDoc(empleadoRef, { email: newEmail });
        setShowAlert(true);
        setNewEmail("");
        setSelectedUserId(null);
        // Refresh employee list
        fetchEmpleados();
      } catch (error) {
        console.error("Error updating empleado: ", error);
      }
    }
  };

  const onDelete = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "usuarios", userId));
      setShowAlert(true);
      // Refresh employee list
      fetchEmpleados();
    } catch (error) {
      console.error("Error deleting empleado: ", error);
    }
  };

  if (loading) return <IonSpinner name="crescent" />;

  return (
    <IonContent>
      <IonList>
        <IonItem>
          <IonLabel>Registrar Nuevo Empleado</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            placeholder="Email"
          />
          <IonInput
            type="password"
            value={contraseña}
            onIonChange={(e) => setContraseña(e.detail.value!)}
            placeholder="Contraseña"
          />
          <IonButton onClick={onCreate}>Registrar</IonButton>
          {errorMessage && (
            <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
              {errorMessage}
            </p>
          )}
        </IonItem>

        <IonItem>
          <IonLabel>Actualizar Empleado</IonLabel>
          <IonInput
            value={newEmail}
            onIonChange={(e) => setNewEmail(e.detail.value!)}
            placeholder="Nuevo Email"
          />
          <IonButton
            onClick={onUpdate}
            disabled={!selectedUserId}
          >
            Actualizar
          </IonButton>
        </IonItem>

        <IonList>
          {empleados.map((empleado) => (
            <IonItem key={empleado.id}>
              <IonLabel>
                <h2>{empleado.email}</h2>
                <p>{empleado.creadoEn.toDate().toLocaleDateString()}</p>
              </IonLabel>
              <IonButton onClick={() => setSelectedUserId(empleado.id)}>Seleccionar</IonButton>
              <IonButton color="danger" onClick={() => onDelete(empleado.id)}>Eliminar</IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonList>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Operación Exitosa"}
        message={"La operación se completó correctamente!"}
        buttons={["OK"]}
      />
    </IonContent>
  );
};

export default GestionEmpleados;
