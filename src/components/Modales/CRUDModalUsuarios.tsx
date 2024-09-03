import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonAlert,
} from "@ionic/react";
import { add, close, trash, pencil } from "ionicons/icons";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const CRUDModalUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [alerta, setAlerta] = useState<string>("");

  useEffect(() => {
    // Cargar usuarios desde Firestore
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "empleados"));
        const usuariosArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(usuariosArray);
      } catch (error) {
        setAlerta("Error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const abrirModal = (usuario?: any) => {
    setSelectedUsuario(usuario || null);
    setEmail(usuario?.email || "");
    setContraseña(usuario?.contraseña || ""); // Recuerda que en un entorno real no se debería mostrar la contraseña
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedUsuario(null);
    setEmail("");
    setContraseña("");
    setIsModalOpen(false);
  };

  const guardarUsuario = async () => {
    setLoading(true);
    try {
      if (selectedUsuario) {
        // Actualizar usuario existente
        await updateDoc(doc(db, "empleados", selectedUsuario.id), {
          email,
          contraseña, // No almacenar contraseñas en texto plano en producción
        });
        setAlerta("Usuario actualizado con éxito");
      } else {
        // Crear nuevo usuario
        const nuevoDoc = doc(collection(db, "empleados"));
        await setDoc(nuevoDoc, {
          email,
          contraseña, // No almacenar contraseñas en texto plano en producción
          creadoEn: new Date(),
        });
        setAlerta("Usuario creado con éxito");
      }
      setIsModalOpen(false);
      setSelectedUsuario(null);
      setEmail("");
      setContraseña("");
    } catch (error) {
      setAlerta("Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (usuarioId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "empleados", usuarioId));
      setAlerta("Usuario eliminado con éxito");
    } catch (error) {
      setAlerta("Error al eliminar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="ion-padding">
      <IonButton expand="full" onClick={() => abrirModal()}>
        Crear nuevo usuario
        <IonIcon slot="end" icon={add} />
      </IonButton>

      {loading && <IonSpinner name="crescent" />}

      <IonList>
        {usuarios.map((usuario) => (
          <IonItem key={usuario.id}>
            <IonLabel>{usuario.email}</IonLabel>
            <IonButton slot="end" color="primary" onClick={() => abrirModal(usuario)}>
              <IonIcon icon={pencil} />
            </IonButton>
            <IonButton slot="end" color="danger" onClick={() => eliminarUsuario(usuario.id)}>
              <IonIcon icon={trash} />
            </IonButton>
          </IonItem>
        ))}
      </IonList>

      <IonModal isOpen={isModalOpen} onDidDismiss={cerrarModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{selectedUsuario ? "Editar Usuario" : "Crear Usuario"}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={cerrarModal}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
              type="email"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Contraseña</IonLabel>
            <IonInput
              value={contraseña}
              onIonChange={(e) => setContraseña(e.detail.value!)}
              required
              type="password"
            />
          </IonItem>
          <IonButton expand="full" onClick={guardarUsuario} disabled={loading}>
            {loading ? <IonSpinner name="crescent" /> : "Guardar"}
          </IonButton>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={!!alerta}
        onDidDismiss={() => setAlerta("")}
        header="Mensaje"
        message={alerta}
        buttons={["OK"]}
      />
    </IonContent>
  );
};

export default CRUDModalUsuarios;
