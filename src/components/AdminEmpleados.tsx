import React, { useState, useEffect, FormEvent } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButtons,
} from "@ionic/react";
import { IonInputCustomEvent, InputChangeEventDetail } from "@ionic/core";

interface Empleado {
  id: string;
  email: string;
  empleado: boolean;
}

const AdminEmpleados: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState<string>("");
  const [editEmpleado, setEditEmpleado] = useState<Empleado | null>(null);
  const [editEmail, setEditEmail] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "usuarios"), where("empleado", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const empleadosData: Empleado[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        empleado: doc.data().empleado,
      }));
      setEmpleados(empleadosData);
    });

    return () => unsubscribe();
  }, []);

  const agregarEmpleado = async (e: FormEvent) => {
    e.preventDefault();
    if (nuevoEmpleado) {
      await addDoc(collection(db, "usuarios"), {
        email: nuevoEmpleado,
        empleado: true,
      });
      setNuevoEmpleado("");
      setShowModal(false);
    }
  };

  const actualizarEmpleado = async (e: FormEvent) => {
    e.preventDefault();
    if (editEmpleado) {
      const empleadoRef = doc(db, "usuarios", editEmpleado.id);
      await updateDoc(empleadoRef, {
        email: editEmail,
      });
      setEditEmpleado(null);
      setEditEmail("");
      setShowModal(false);
    }
  };

  const eliminarEmpleado = async (id: string) => {
    await deleteDoc(doc(db, "usuarios", id));
  };

  const abrirEditarModal = (empleado: Empleado) => {
    setEditEmpleado(empleado);
    setEditEmail(empleado.email);
    setShowModal(true);
  };

  const handleInputChange = (
    e: IonInputCustomEvent<InputChangeEventDetail>
  ) => {
    const value = e.detail.value!;
    if (editEmpleado) {
      setEditEmail(value);
    } else {
      setNuevoEmpleado(value);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Administración de Empleados</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton expand="full" onClick={() => setShowModal(true)}>
          Agregar Empleado
        </IonButton>

        <IonList>
          {empleados.map((empleado) => (
            <IonCard key={empleado.id}>
              <IonCardHeader>
                <IonCardTitle>{empleado.email}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton onClick={() => abrirEditarModal(empleado)}>
                  Editar
                </IonButton>
                <IonButton
                  color="danger"
                  onClick={() => eliminarEmpleado(empleado.id)}
                >
                  Eliminar
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        <IonModal isOpen={showModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editEmpleado ? "Editar Empleado" : "Agregar Empleado"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <form onSubmit={editEmpleado ? actualizarEmpleado : agregarEmpleado}>
              <IonList>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={editEmpleado ? editEmail : nuevoEmpleado}
                    onIonChange={handleInputChange}
                    required
                  />
                </IonItem>
              </IonList>
              <IonButton expand="full" type="submit">
                {editEmpleado ? "Actualizar" : "Agregar"}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AdminEmpleados;
