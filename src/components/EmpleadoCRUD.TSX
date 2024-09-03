import React, { useState, useEffect, FormEvent } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase"; 
import { Button } from "@nextui-org/react";
import { Card } from "@nextui-org/card";
import { IonContent, IonList, IonInput, IonSpinner, IonAlert, IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem, IonLabel, IonButton } from "@ionic/react";

const EmpleadosCRUD: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [editingEmpleado, setEditingEmpleado] = useState<any | null>(null);

  const [newEmail, setNewEmail] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const empleadosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmpleados(empleadosData);
      } catch (error) {
        console.error("Error fetching empleados: ", error);
      }
    };

    fetchEmpleados();
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
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
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !newEmail) return;

    try {
      const docRef = doc(db, "usuarios", editingId);
      await updateDoc(docRef, {
        email: newEmail,
      });
      setNewEmail("");
      setEditingId(null);
    } catch (error) {
      console.error("Error updating empleado: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setEmpleados(empleados.filter(emp => emp.id !== id));
    } catch (error) {
      console.error("Error deleting empleado: ", error);
    }
  };

  const startEditing = (empleado: any) => {
    setEditingEmpleado(empleado);
    setNewEmail(empleado.email);
    setEditingId(empleado.id);
  };

  return (
    <IonContent>
      <Card className="max-w-sm mx-auto bg-black mt-8 p-5 shadow-lg rounded-3xl text-white">
        <img
          alt="Silueta de montañas"
         
          style={{
            width: "40%",
            borderRadius: "10px",
            margin: "0 auto",
            display: "block",
          }}
        />
        <IonCardHeader style={{ textAlign: "center" }} className="rounded-b-3xl">
          <IonCardTitle style={{ fontSize: "24px", fontWeight: "bold" }}>
            CRUD Empleados
          </IonCardTitle>
          <IonCardSubtitle style={{ color: "#666" }}>
            Administrar empleados del sistema
          </IonCardSubtitle>
        </IonCardHeader>

        <form onSubmit={handleRegister} style={{ marginTop: "1px" }}>
          <IonList className="bg-black">
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
              placeholder="Email"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono font-arial rounded-lg px-4 py-2 mt-5"
            />
            <IonInput
              type="password"
              value={contraseña}
              onIonChange={(e) => setContraseña(e.detail.value!)}
              required
              placeholder="Contraseña"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono rounded-lg px-4 py-2 mt-5"
            />
            <Button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "20px",
                backgroundColor: "#007bff",
                color: "#fff",
              }}
            >
              {loading ? <IonSpinner /> : "Registrar"}
            </Button>
          </IonList>
        </form>

        <IonList>
          {empleados.map(empleado => (
            <IonItem key={empleado.id}>
              <IonLabel>
                <h2>{empleado.email}</h2>
                <p>Empleado desde: {new Date(empleado.creadoEn.toDate()).toLocaleDateString()}</p>
                <IonButton onClick={() => startEditing(empleado)}>Editar</IonButton>
                <IonButton color="danger" onClick={() => handleDelete(empleado.id)}>Eliminar</IonButton>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {editingEmpleado && (
          <div>
            <IonInput
              value={newEmail}
              onIonChange={(e) => setNewEmail(e.detail.value!)}
              placeholder="Nuevo Email"
            />
            <IonButton onClick={handleUpdate}>Actualizar</IonButton>
          </div>
        )}
      </Card>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Registro Exitoso"}
        message={"¡Te has registrado correctamente!"}
        buttons={["OK"]}
      />

      {errorMessage && (
        <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          {errorMessage}
        </p>
      )}
    </IonContent>
  );
};

export default EmpleadosCRUD;
