import React, { useEffect, useState } from "react";
import { IonContent, IonList, IonItem, IonLabel } from "@ionic/react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const ListaEmpleados: React.FC = () => {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEmpleados = async () => {
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

    fetchEmpleados();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <IonContent>
      <IonList>
        {empleados.map((empleado) => (
          <IonItem key={empleado.id}>
            <IonLabel>
              <h2>{empleado.email}</h2>
              <p>{empleado.creadoEn.toDate().toLocaleDateString()}</p>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    </IonContent>
  );
};

export default ListaEmpleados;
