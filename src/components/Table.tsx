import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonSpinner,
} from "@ionic/react";
import UserCreation from "../components/NewProduct/UserCreation";
import DeleteButton from "./Botones/DeleteButton";
import UpdateUser from "../components/NewProduct/UpdateUser";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { pencil, eye, downloadOutline, barcode } from "ionicons/icons";
import { Button } from "@nextui-org/react";
import Search from "./Search";

interface InventarioItem {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: string;
  precio: string;
  imagenURL: string;
  barcodeURL: string; // URL de la imagen del código de barras
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const generatePDF = (data: InventarioItem[]) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' }) as jsPDFWithAutoTable;

  const title = "Reporte de inventario";
  const fontSize = 18;
  doc.setFontSize(fontSize);
  const pageWidth = doc.internal.pageSize.width;
  const titleWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, 20);

  doc.autoTable({
    startY: 30,
    head: [['ID', 'Nombre', 'Código', 'Cantidad', 'Precio']],
    body: data.map(item => [
      item.id,
      item.nombre,
      item.codigo,
      item.cantidad,
      item.precio
    ]),
    styles: {
      fontSize: 10,
      lineColor: 0,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      lineWidth: 0.5,
    },
    margin: { top: 30 },
  });

  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}${month}${year}`;

  doc.save(`inventarioMLP${formattedDate}.pdf`);
};

const ImageModal: React.FC<{ isOpen: boolean; imageURL: string | null; onClose: () => void }> = ({ isOpen, imageURL, onClose }) => (
  <IonModal isOpen={isOpen} onDidDismiss={onClose}>
    <div className="flex flex-col items-center justify-center p-4">
      {imageURL && (
        <>
          <img 
            src={imageURL} 
            alt="Imagen" 
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
          />
          <IonButton className="mt-4" onClick={() => handleDownloadImage(imageURL)}>
            <IonIcon icon={downloadOutline} slot="start" />
            Descargar Imagen
          </IonButton>
        </>
      )}
    </div>
  </IonModal>
);

const handleDownloadImage = (url: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = "imagen.png";
  link.click();
};

const Table: React.FC = () => {
  const [estadoFrom, setEstadoFrom] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [tableLoaded, setTableLoaded] = useState<boolean>(false);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProductImageModal, setShowProductImageModal] = useState<{ open: boolean; imageURL: string | null }>({ open: false, imageURL: null });
  const [showBarcodeImageModal, setShowBarcodeImageModal] = useState<{ open: boolean; barcodeURL: string | null }>({ open: false, barcodeURL: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'inventario'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InventarioItem[];
      setInventario(data);
      setTableLoaded(true);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportToPDF = () => {
    if (!tableLoaded) {
      console.error("Error: Table not loaded yet");
      return;
    }
    generatePDF(inventario);
  };

  return (
    <IonContent>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <IonSpinner name="crescent" />
        </div>
      ) : (
        <div className="container mt-4 px-4">
          <Search setSearchResults={setInventario} setInventario={setInventario} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex flex-row space-x-2">
              <Button
                color="primary"
                className="hover:-translate-y-1 hover:scale-110 hover:bg-black-100"
                onClick={() => setEstadoFrom(!estadoFrom)}
              >
                Agregar 
              </Button>
              <Button
                className="hover:-translate-y-1 hover:scale-110 hover:bg-white-100"
                onClick={handleExportToPDF}
              >
                Exportar 
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              <IonList id="table-to-export" className="min-w-[800px] divide-y divide-gray-200">
                <IonItem className="bg-gray-100 flex flex-nowrap">
                  <IonLabel className="w-[20%] text-center font-medium p-2">Código</IonLabel>
                  <IonLabel className="w-[20%] text-center font-medium p-2">Nombre</IonLabel>
                  <IonLabel className="w-[20%] text-center font-medium p-2">Cantidad</IonLabel>
                  <IonLabel className="w-[20%] text-center font-medium p-2">Precio</IonLabel>
                  <IonLabel className="w-[20%] text-center font-medium p-2">Acciones</IonLabel>
                </IonItem>

                {inventario.map(item => (
                  <IonItem key={item.codigo} className="flex flex-nowrap items-center">
                    <IonLabel className="w-1/6 text-center p-2">{item.codigo}</IonLabel>
                    <IonLabel className="w-1/6 text-center p-2">{item.nombre}</IonLabel>
                    <IonLabel className="w-1/6 text-center p-2">{item.cantidad}</IonLabel>
                    <IonLabel className="w-1/6 text-center p-2">{item.precio}</IonLabel>
                    <div className="w-1/6 flex justify-center items-center space-x-2 p-2">
                      <IonButton aria-label="Editar producto" fill="clear" className="p-0 m-0" onClick={() => { setSelectedItem(item); setOpenForm(true); }}>
                        <IonIcon icon={pencil} className="icon-edit text-lg" />
                      </IonButton>
                      <IonButton
                        aria-label="Ver imagen del producto"
                        fill="clear"
                        className="p-0 m-0"
                        onClick={() => setShowProductImageModal({ open: true, imageURL: item.imagenURL })}
                      >
                        <IonIcon icon={eye} className="text-lg" />
                      </IonButton>
                      <IonButton
                        aria-label="Ver código de barras"
                        fill="clear"
                        className="p-0 m-0"
                        onClick={() => setShowBarcodeImageModal({ open: true, barcodeURL: item.barcodeURL })}
                      >
                        <IonIcon icon={barcode} className="text-lg" />
                      </IonButton>
                      <DeleteButton itemId={item.id} onDeleteSuccess={fetchData} />
                    </div>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </div>
        </div>
      )}

      <ImageModal
        isOpen={showProductImageModal.open}
        imageURL={showProductImageModal.imageURL}
        onClose={() => setShowProductImageModal({ open: false, imageURL: null })}
      />

      <ImageModal
        isOpen={showBarcodeImageModal.open}
        imageURL={showBarcodeImageModal.barcodeURL}
        onClose={() => setShowBarcodeImageModal({ open: false, barcodeURL: null })}
      />

      {estadoFrom && (
        <UserCreation
          abrir={estadoFrom}
          cerra={() => setEstadoFrom(false)}
        />
      )}
      {openForm && selectedItem && (
        <UpdateUser
          open={openForm}
          close={() => setOpenForm(false)}
          item={selectedItem}
        />
      )}
    </IonContent>
  );
};

export default Table;
