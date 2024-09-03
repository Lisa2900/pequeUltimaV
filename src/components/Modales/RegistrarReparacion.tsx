import React, { useState, useCallback } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { collection, addDoc, doc, runTransaction, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '@nextui-org/react';
import jsPDF from 'jspdf';
import logo from '../../img/bannerTicket.jpg';
import swal from 'sweetalert';
import '../../Styles/RegistrarReparacion.css';
import { closeOutline } from 'ionicons/icons';

interface RegistrarReparacionProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const RegistrarReparacion: React.FC<RegistrarReparacionProps> = ({
  showModal,
  setShowModal,
}) => {
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [repairType, setRepairType] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [technician, setTechnician] = useState('');
  const [importe, setImporte] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [setShowModal]);

  const resetForm = () => {
    setDeviceType('');
    setBrand('');
    setModel('');
    setRepairType('');
    setDescription('');
    setCustomerName('');
    setContactNumber('');
    setTechnician('');
    setImporte('');
    setTotalCost('');
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: CustomEvent) => {
    const inputElement = e.target as HTMLIonInputElement;
    setter(inputElement.value as string);
  };

  const generateUniqueFolio = async () => {
    const counterRef = doc(db, 'counters', 'folio');
    
    const folio = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let nextFolioNumber = 1;

      if (counterDoc.exists()) {
        nextFolioNumber = counterDoc.data().current + 1;
        transaction.update(counterRef, { current: nextFolioNumber });
      } else {
        transaction.set(counterRef, { current: nextFolioNumber });
      }

      return `${nextFolioNumber}`;
    });

    return folio;
  };

  const handleRegisterRepair = async () => {
    try {
      // Verificar si el importe y el costo total son números válidos
      const validImporte = importe ? parseFloat(importe) : 0;
      const validTotalCost = totalCost ? parseFloat(totalCost) : 0;
  
      // Calcular el costo final como la diferencia
      const finalCost = validTotalCost - validImporte;
  
      const folio = await generateUniqueFolio();
      if (folio) {
        const repairData = {
          deviceType,
          brand,
          model,
          repairType,
          description,
          status: 'pendiente',
          fechaRegistro: new Date(),
          folio,
          customerName,
          contactNumber,
          technician,
          importe: validImporte,
          totalCost: validTotalCost, // Campo agregado para el costo total
          finalCost // Nuevo campo para el costo final
        };
  
        // Registra la reparación con el folio como ID del documento
        await setDoc(doc(db, 'reparaciones', folio), repairData);
  
        // Registra la reparación como una venta
        await addDoc(collection(db, 'ventas'), {
          codigo: folio, // Usar el folio como código
          producto: `Reparación de ${brand} ${model}`,
          cantidad: 1,
          precioUnitario: finalCost,
          total: validImporte, // Usar el costo final para la venta
          timestamp: Timestamp.now()
        });
  
        generateReceipt(folio, validImporte, validTotalCost, finalCost);
        swal('Éxito', 'La reparación se registró correctamente.', 'success');
      }
    } catch (error) {
      console.error('Error al registrar la reparación:', error);
      swal('Error', 'Hubo un error al registrar la reparación.', 'error');
    } finally {
      closeModal();
    }
  };

  const generateReceipt = (folio: string, importe: number, totalCost: number, finalCost: number) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 200]
    });

    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 0, 0, 100, 15);

      doc.setFontSize(10);
      const fecha = new Date().toLocaleDateString();
      doc.text(`Fecha: ${fecha}`, 10, 35);
      doc.setLineWidth(0.5);
      doc.line(10, 38, 90, 38);

      doc.setFontSize(12);
      doc.text('Ticket de Reparación', 10, 45);

      doc.setFontSize(10);
      doc.text(`Folio: ${folio}`, 35, 35);
      doc.text(`Cliente: ${customerName}`, 10, 75);
      doc.text(`Número: ${contactNumber}`, 10, 85);
      doc.text(`Marca: ${brand}`, 10, 95);
      doc.text(`Modelo: ${model}`, 10, 105);
      doc.text(`Tipo de Dispositivo: ${deviceType}`, 10, 115);
      doc.text(`Tipo de Reparación: ${repairType}`, 10, 125);
      doc.text(`Descripción: ${description}`, 10, 135);
      doc.text(`Anticipo: ${importe}`, 10, 155);
      doc.text(`Precio total: ${totalCost}`, 10, 165);
      doc.text(`Total restante: ${finalCost}`, 10, 175); // Mostrar el costo final en el recibo

      doc.save('recibo_reparacion.pdf');
      console.log('Recibo impreso');
    };

    img.onerror = (error) => {
      console.error('Error al cargar la imagen:', error);
    };
  };

  return (
    <>
      <IonModal isOpen={showModal} onDidDismiss={closeModal} style={{ '--border-radius': '16px' }}>
        <IonHeader>
          <IonToolbar className='rounded-2xl'>
            <IonTitle>Registrar Reparación</IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              className="rounded-full"
              onClick={closeModal}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className='rounded-2xl'>
          <div style={{ padding: '0 16px' }}>
            <IonSelect
              className='bg-[#282828] rounded-lg mt-1'
              value={deviceType}
              placeholder="  Selecciona tipo de dispositivo"
              onIonChange={(e) => setDeviceType(e.detail.value)}
              style={{ marginBottom: '16px' }}
            >
              <IonSelectOption value="telefono">Teléfono</IonSelectOption>
              <IonSelectOption value="tablet">Tableta</IonSelectOption>
              <IonSelectOption value="computadora">Computadora</IonSelectOption>
            </IonSelect>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={brand}
              placeholder="  Marca"
              onIonChange={handleInputChange(setBrand)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={model}
              placeholder="  Modelo"
              onIonChange={handleInputChange(setModel)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={repairType}
              placeholder="  Reparación a realizar"
              onIonChange={handleInputChange(setRepairType)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonTextarea
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={description}
              placeholder="  Descripción detallada de la reparación"
              onIonChange={handleInputChange(setDescription)}
              style={{ marginBottom: '16px' }}
            ></IonTextarea>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={customerName}
              placeholder="  Cliente"
              onIonChange={handleInputChange(setCustomerName)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={contactNumber}
              placeholder="  Telefono"
              onIonChange={handleInputChange(setContactNumber)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={importe}
              placeholder="  Anticipo"
              onIonChange={handleInputChange(setImporte)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <IonInput
              className="bg-[#282828] text-white rounded-lg mt-1"
              value={totalCost}
              placeholder="  Precio total"
              onIonChange={handleInputChange(setTotalCost)}
              style={{ marginBottom: '16px' }}
            ></IonInput>
            <Button
  color="secondary"
  onClick={handleRegisterRepair}
  style={{ width: '100%', marginTop: '16px', marginBottom: '16px', borderRadius: '12px' }}
  className="bg-[#0558C4] text-white hover:bg-[#2C2C2C]"
>
  Registrar Reparación
</Button>



          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default RegistrarReparacion;
