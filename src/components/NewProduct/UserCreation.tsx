import React, { ReactNode, useState } from 'react';
import { IonContent, IonInput, IonLabel, IonModal } from '@ionic/react';
import swal from 'sweetalert';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@nextui-org/react";
import Scanner from '../Scanner';
import JsBarcode from 'jsbarcode';

interface CreateUserFormProps {
  abrir: boolean;
  cerra: (value: boolean) => void;
  children?: ReactNode;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ abrir, cerra }) => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [codigoError, setCodigoError] = useState('');
  const [barcodeURL, setBarcodeURL] = useState<string | null>(null);

  const mostrarAlerta = (titulo: string, texto: string, icono: "success" | "error") => {
    swal({
      title: titulo,
      text: texto,
      icon: icono
    });
  };

  const agregarProducto = async (barcodeURL: string) => {
    if (!nombre || !codigo || !cantidad || !precio || !imagen) {
      mostrarAlerta("Error", "Por favor, completa todos los campos y sube una imagen.", "error");
      return;
    }

    try {
      const q = query(collection(db, 'inventario'), where('codigo', '==', codigo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setCodigoError("El código del producto ya está registrado.");
        return;
      }

      let imagenURL = '';
      if (imagen) {
        const imagenRef = ref(storage, `productos/${codigo}`);
        await uploadBytes(imagenRef, imagen);
        imagenURL = await getDownloadURL(imagenRef);
      }

      const docRef = await addDoc(collection(db, 'inventario'), {
        nombre,
        codigo,
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        imagenURL,
        barcodeURL // Guardar la URL del código de barras en Firestore
      });

      console.log("Documento escrito con ID: ", docRef.id);
      mostrarAlerta("¡Bien hecho!", "¡Has agregado un nuevo producto correctamente!", "success");
      cerra(false);
    } catch (error) {
      console.error("Error al agregar el documento: ", error);
      mostrarAlerta("Error", "Hubo un error al agregar el producto.", "error");
    }
  };

  const handleCodeScanned = (code: string) => {
    setCodigo(code);
    setCodigoError('');
  };

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase(); // Genera un código aleatorio alfanumérico
  };

  const handleGenerateBarcode = () => {
    if (!nombre) {
      mostrarAlerta("Error", "Debes ingresar un nombre para generar el código.", "error");
      return;
    }

    if (!codigo) {
      const randomCode = generateRandomCode();
      setCodigo(randomCode);
    }

    const canvas = document.createElement('canvas');
    JsBarcode(canvas, codigo, { 
      format: "CODE39",        // Tipo de código de barras
      width: 2,                // Grosor de las barras
      height: 100,             // Altura del código de barras
      displayValue: true,      // Mostrar el valor debajo del código de barras
      fontSize: 20,            // Tamaño de la fuente del valor
      background: "#ffffff",   // Color de fondo
      lineColor: "#000000"     // Color de las barras
    });
    const url = canvas.toDataURL("image/png");
    setBarcodeURL(url);
  };

  const handleDownloadBarcode = () => {
    if (barcodeURL) {
      const link = document.createElement('a');
      link.href = barcodeURL;
      link.download = `${nombre}-barcode.png`;
      link.click();
    }
  };

  const saveBarcodeToStorage = async () => {
    if (!barcodeURL) return null;

    const response = await fetch(barcodeURL);
    const blob = await response.blob();
    const barcodeRef = ref(storage, `codigos_de_barras/${nombre}-barcode.png`);
    await uploadBytes(barcodeRef, blob);
    return await getDownloadURL(barcodeRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guardar la imagen del código de barras en Firebase Storage
    const barcodeImageUrl = await saveBarcodeToStorage();

    if (barcodeImageUrl) {
      console.log("Imagen del código de barras guardada en: ", barcodeImageUrl);
      await agregarProducto(barcodeImageUrl);
    }
  };

  const handleSelectImage = async () => {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,  // Muestra opciones para elegir entre la cámara o la galería
      quality: 100
    });

    if (image && image.dataUrl) {
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      setImagen(file);
    }
  };

  return (
    <IonModal isOpen={abrir} onDidDismiss={() => cerra(false)}>
      <IonContent>
        <div className="flex items-center justify-center h-full">
          <div className="bg-[#202020] text-white p-9 w-full h-auto rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Crear Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Nombre del Producto *</IonLabel>
                <IonInput className="bg-[#282828] text-white" value={nombre} onIonChange={(e) => setNombre(e.detail.value!)} required></IonInput>
              </div>
              <div className="mb-4 flex items-center">
                <IonLabel className="block text-white mb-1">Código *</IonLabel>
                <IonInput 
                  className={`bg-[#282828] text-white ${codigoError ? 'border-red-500' : ''}`} 
                  value={codigo} 
                  onIonChange={(e) => {
                    setCodigo(e.detail.value!);
                    setCodigoError('');
                  }} 
                  required
                />
                {codigoError && <p className="text-red-500 text-sm mt-1">{codigoError}</p>}
                <Scanner onCodeScanned={handleCodeScanned} />
              </div>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Cantidad *</IonLabel>
                <IonInput className="bg-[#282828] text-white" type="number" value={cantidad} onIonChange={(e) => setCantidad(e.detail.value!)} required></IonInput>
              </div>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Precio *</IonLabel>
                <IonInput className="bg-[#282828] text-white" type="number" value={precio} onIonChange={(e) => setPrecio(e.detail.value!)} required></IonInput>
              </div>
              <div className="mb-4">
                <Button type="button" onClick={handleSelectImage} className="text-white px-4 py-2 rounded-2xl bg-green-600">
                  Seleccionar Imagen
                </Button>
              </div>
              <div className="mb-4">
                <Button type="button" onClick={handleGenerateBarcode} className="text-white px-4 py-2 rounded-2xl bg-green-600">
                  Generar Código de Barras
                </Button>
                {barcodeURL && (
                  <>
                    <img src={barcodeURL} alt="Código de Barras" className="mt-4" />
                    <Button type="button" onClick={handleDownloadBarcode} className="text-white px-4 py-2 rounded-2xl bg-blue-600 mt-2">
                      Descargar Código de Barras
                    </Button>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="button" onClick={() => cerra(false)} className="text-white px-4 py-2 rounded-2xl bg-blue-800">
                  Cancelar
                </Button>
                <Button type="submit" className="text-white px-4 py-2 rounded-2xl bg-red-800">
                  Agregar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CreateUserForm;
