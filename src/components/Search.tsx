import React, { useState, useEffect } from "react";
import { IonInput, IonText } from "@ionic/react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Scanner from "./Scanner";
interface InventarioItem {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: string;
  precio: string;
  imagenURL: string;
  barcodeURL: string;
}

interface SearchProps {
  setSearchResults: (results: InventarioItem[]) => void;
  setInventario: (data: InventarioItem[]) => void;
}

const Search: React.FC<SearchProps> = ({ setSearchResults, setInventario }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [noResults, setNoResults] = useState<boolean>(false);

  const handleScanCode = async (code: string) => {
    setSearchTerm(code);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (searchTerm.trim() === "") {
          // Fetch and show all items if search term is empty
          const querySnapshot = await getDocs(collection(db, 'inventario'));
          const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InventarioItem[];
          setInventario(data);
          setSearchResults(data);
          setNoResults(false);
        } else {
          // Search by product code
          const q = query(collection(db, 'inventario'), where('codigo', '==', searchTerm));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InventarioItem[];
          setSearchResults(data);
          setNoResults(data.length === 0);
        }
      } catch (error) {
        console.error("Error fetching search results: ", error);
      }
    };

    fetchData();
  }, [searchTerm]);

  return (
    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 mb-4">
      <IonInput
        value={searchTerm}
        onIonInput={(e) => setSearchTerm((e.detail.value as string) || "")}
        placeholder="Buscar por código de producto"
        className="flex-1"
      />
      <Scanner onCodeScanned={handleScanCode} />
      {noResults && <IonText color="danger">No se encontraron resultados.</IonText>}
    </div>
  );
};

export default Search;
