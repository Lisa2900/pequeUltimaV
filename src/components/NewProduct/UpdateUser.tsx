import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonInput, IonLabel, IonModal } from '@ionic/react';
import swal from 'sweetalert';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { db, storage } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button } from "@nextui-org/react";
import Scanner from '../Scanner'; // Asegúrate de que la ruta sea correcta

// Definición de InventarioItem directamente en este archivo
interface InventarioItem {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: string;
  precio: string;
  imagenURL: string;
}

// Definición de las props del componente
interface UpdateUserProps {
  open: boolean;
  close: () => void;
  item: InventarioItem;
}

const UpdateUser: React.FC<UpdateUserProps> = ({ open, close, item }) => {
  const [nombre, setNombre] = useState(item.nombre);
  const [codigo, setCodigo] = useState(item.codigo);
  const [cantidad, setCantidad] = useState(item.cantidad);
  const [precio, setPrecio] = useState(item.precio);
  const [imagenUrl, setImagenUrl] = useState(item.imagenURL); // Estado para la imagen
  const [imagenFile, setImagenFile] = useState<File | null>(null); // Estado para el archivo de imagen

  useEffect(() => {
    setNombre(item.nombre);
    setCodigo(item.codigo);
    setCantidad(item.cantidad);
    setPrecio(item.precio);
    setImagenUrl(item.imagenURL); // Inicializa la URL de la imagen
  }, [item]);

  const mostrarAlerta = (titulo: string, texto: string, icono: 'success' | 'error') => {
    swal({
      title: titulo,
      text: texto,
      icon: icono,
    });
  };

  const eliminarImagenAnterior = async (url: string) => {
    try {
      const imagenRef = ref(storage, url);
      await deleteObject(imagenRef);
    } catch (error) {
      console.error('Error al eliminar la imagen anterior: ', error);
    }
  };

  const actualizarProducto = async () => {
    try {
      // Obtener el documento del producto para comprobar si el código ha cambiado
      const productRef = doc(db, 'inventario', item.id);
      const productDoc = await getDoc(productRef);
      const oldData = productDoc.data() as InventarioItem;

      let newImagenUrl = imagenUrl;

      // Si el código ha cambiado, eliminar la imagen antigua
      if (codigo !== oldData.codigo && oldData.imagenURL) {
        await eliminarImagenAnterior(oldData.imagenURL);
      }

      if (imagenFile) {
        // Subir la nueva imagen a Firebase Storage
        const storageRef = ref(storage, `images/${imagenFile.name}`);
        await uploadBytes(storageRef, imagenFile);
        newImagenUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(productRef, {
        nombre,
        codigo,
        cantidad: parseInt(cantidad, 10),
        precio: parseFloat(precio),
        imagenURL: newImagenUrl, // Actualizar la URL de la imagen
      });
      mostrarAlerta('¡Bien hecho!', '¡Has actualizado el producto exitosamente!', 'success');
      close();
    } catch (error) {
      console.error('Error al actualizar el documento: ', error);
      mostrarAlerta('Error!', 'Hubo un error al actualizar el producto.', 'error');
    }
  };

  const handleCodeScanned = (code: string) => {
    // Actualizar el código del producto con el valor escaneado
    setCodigo(code);
    // Aquí puedes hacer una consulta para obtener la imagen asociada al código
    // y actualizar la imagen en el estado si es necesario
  };

  const handleSelectImage = async () => {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Muestra opciones para elegir entre la cámara o la galería
      quality: 100
    });

    if (image && image.dataUrl) {
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      setImagenFile(file);
      setImagenUrl(image.dataUrl); // Actualiza la URL de la imagen para vista previa
    }
  };

  return (
    <IonModal isOpen={open} onDidDismiss={close}>
      <IonContent>
        <div className="flex items-center justify-center h-full">
          <div className="bg-[#202020] text-white p-9 w-full h-auto rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Actualizar Producto</h2>
            <form>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Nombre del Producto *</IonLabel>
                <IonInput className="bg-[#282828] text-white" value={nombre} onIonChange={(e) => setNombre(e.detail.value ?? '')} required />
              </div>
              <div className="mb-4 flex items-center">
                <IonLabel className="block text-white mb-1">Código Producto *</IonLabel>
                <IonInput className="bg-[#282828] text-white" value={codigo} onIonChange={(e) => setCodigo(e.detail.value ?? '')} required />
                <Scanner onCodeScanned={handleCodeScanned} />
              </div>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Cantidad *</IonLabel>
                <IonInput className="bg-[#282828] text-white" type="number" value={cantidad} onIonChange={(e) => setCantidad(e.detail.value ?? '')} required />
              </div>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Precio *</IonLabel>
                <IonInput className="bg-[#282828] text-white" type="number" value={precio} onIonChange={(e) => setPrecio(e.detail.value ?? '')} required />
              </div>
              <div className="mb-4">
                <IonLabel className="block text-white mb-1">Imagen del Producto *</IonLabel>
                <Button type="button" onClick={handleSelectImage} className="text-white px-4 py-2 rounded-2xl bg-green-600">
                  Seleccionar Imagen
                </Button>
                {imagenUrl && <img src={imagenUrl} alt="Vista previa" className="mt-4" />}
              </div>
              <div className="flex justify-end space-x-4">
                <Button onClick={close} className="text-white px-4 py-2 rounded-2xl bg-blue-800">Cancelar</Button>
                <Button onClick={actualizarProducto} className="text-white px-4 py-2 rounded-2xl bg-red-800">Actualizar</Button>
              </div>
            </form>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default UpdateUser;
