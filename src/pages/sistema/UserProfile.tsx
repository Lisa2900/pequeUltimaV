import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebase';
import Salir from '../../components/Salir';

// Constants for repeated class strings
const commonTextColor = 'text-white dark:text-zinc-400';
const commonBgColor = 'bg-zinc-200 dark:bg-zinc-600';
const commonPadding = 'p-4';
const commonRounded = 'rounded-lg';

// Define the interface for the props
interface GridItemProps {
  imageUrl: string;
  altText: string;
  label: string;
}

// Smaller component for grid items
const GridItem: React.FC<GridItemProps> = ({ imageUrl, altText, label }) => (
  <div className={`flex flex-col items-center ${commonBgColor} ${commonPadding} ${commonRounded}`}>
    <img src={imageUrl} alt={altText} className="w-12 h-12" />
    <p className="mt-2 text-blue-600 dark:text-blue-400">{label}</p>
  </div>
);

// Main component
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const gridItems = [
    { imageUrl: "https://placehold.co/100x100", altText: "Articulos", label: "Articulos" },
    // Puedes agregar más items aquí si lo necesitas
  ];

  return (
    <div className="flex flex-col items-center p-4 dark:bg-zinc-800 min-h-screen mt-10 ">
      <div className="bg-[#232323] p-6 rounded-t-3xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center">
             <h2 className="mt-4 text-xl font-bold text-white dark:text-zinc-100 text-center">{user?.displayName || "Usuario"}</h2>
          <p className={`${commonTextColor} text-center`}>{user?.email || "Email"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Salir />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
