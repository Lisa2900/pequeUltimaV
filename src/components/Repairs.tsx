import React, { useState, useEffect, useCallback } from 'react';
import { IonHeader, IonTitle, IonList, IonItem, IonLabel, IonText, IonSearchbar, IonButton, IonIcon } from '@ionic/react';
import { collection, getDocs, query, where, CollectionReference, DocumentData, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import RepairModal from './Modales/RepairModal';
import ConfirmModal from './Modales/ConfirmModal';
import '../Styles/Scroll2.css'; // Asegúrate de importar el archivo CSS
import { logoWhatsapp } from 'ionicons/icons'; // Importar el icono de WhatsApp

interface Repair {
  id: string;
  title: string;
  description: string;
  date: string;
  fechaRegistro: {
    seconds: number;
    nanoseconds: number;
  };
  brand: string;
  model: string;
  deviceType: string;
  repairType: string;
  status: string;
  folio: string;
  contactNumber: string; // Asegúrate de tener esta propiedad en tu documento
  deliveryDate?: {
    seconds: number;
    nanoseconds: number;
  }; // Fecha de entrega opcional
}

const Repairs: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [currentRepair, setCurrentRepair] = useState<Repair | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRepairs = async (searchText: string) => {
    setLoading(true);
    setError(null);

    try {
      const repairCollection: CollectionReference<DocumentData> = collection(db, 'reparaciones');
      let queryRef = query(repairCollection, orderBy('fechaRegistro', 'desc'));

      if (searchText !== '') {
        queryRef = query(repairCollection, where('folio', '==', searchText), orderBy('fechaRegistro', 'desc')) as CollectionReference<DocumentData>;
      }

      const querySnapshot = await getDocs(queryRef);
      const fetchedRepairs: Repair[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Repair;
        const { id, ...rest } = data;
        fetchedRepairs.push({ id: doc.id, ...rest });
      });
      setRepairs(fetchedRepairs);
    } catch (error) {
      console.error('Error al obtener las reparaciones:', error);
      setError('Error al obtener las reparaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs(searchText);
  }, [searchText]);

  const handleOpenModal = useCallback((repair: Repair) => {
    setCurrentRepair(repair);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setCurrentRepair(null);
    setModalOpen(false);
  }, []);

  const handleSearch = useCallback((e: CustomEvent) => {
    const text = e.detail.value as string;
    setSearchText(text);
  }, []);

  const handleWhatsApp = (contactNumber: string) => {
    const whatsappLink = `https://wa.me/${contactNumber}`;
    window.open(whatsappLink, '_blank');
  };

  const updateRepairStatus = async (repairId: string, newStatus: string) => {
    try {
      const repairDocRef = doc(db, 'reparaciones', repairId);
      const updates: any = { status: newStatus };
      if (newStatus === 'Entregado') {
        updates.deliveryDate = Timestamp.fromDate(new Date());
      }
      await updateDoc(repairDocRef, updates);
      setSuccessMessage('Reparación marcada como entregada');
      fetchRepairs(searchText); // Refrescar la lista después de la actualización
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      setError('Error al actualizar el estado.');
    } finally {
      // Opcional: Configura un temporizador para limpiar el mensaje después de un tiempo
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="p-4 bg-[#232323] rounded-2xl border border-transparent shadow-md text-white mb-4 mt custom-scroll-container">
        <IonTitle>Reparaciones</IonTitle>
        <IonSearchbar value={searchText} onIonInput={handleSearch} placeholder="Buscar por folio"></IonSearchbar>
        {loading ? (
          <IonText>Cargando...</IonText>
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : (
          <>
            {successMessage && (
              <IonText color="success" style={{ display: 'block', marginBottom: '16px' }}>
                {successMessage}
              </IonText>
            )}
            <IonList>
              {repairs.map((repair) => (
                <IonItem key={repair.id} onClick={() => handleOpenModal(repair)}>
                  <IonLabel>
                    <h2>{repair.title}</h2>
                    <p>Estado: {repair.status}</p>
                    <p>Fecha: {new Date(repair.fechaRegistro.seconds * 1000).toLocaleString()}</p>
                    <p>Marca: {repair.brand}</p>
                    <p>Modelo: {repair.model}</p>
                    <p>Folio: {repair.folio}</p>
                  </IonLabel>
                  <IonButton
                    fill="clear"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el click abra el modal
                      handleWhatsApp(repair.contactNumber);
                    }}
                  >
                    <IonIcon icon={logoWhatsapp} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </>
        )}
      </div>
      <RepairModal isOpen={modalOpen} onClose={handleCloseModal} repair={currentRepair} updateRepairStatus={updateRepairStatus} />
      <ConfirmModal isOpen={confirmModalOpen} onClose={(confirm) => {
        if (confirm && currentRepair) {
          updateRepairStatus(currentRepair.id, 'Entregado');
        }
        setConfirmModalOpen(false);
      } } amount={0} />
    </>
  );
};

export default Repairs;
