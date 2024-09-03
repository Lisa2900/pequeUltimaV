// src/components/ContactList.tsx
import React, { useEffect, useState } from "react";
import { IonList, IonItem, IonLabel } from "@ionic/react";
import { collection, query, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebase";

interface ContactListProps {
  currentUserEmail: string;
  onSelectConversation: (conversationId: string) => void; // Asegúrate de incluir esta propiedad
}

const ContactList: React.FC<ContactListProps> = ({ currentUserEmail, onSelectConversation }) => {
  const [contacts, setContacts] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, "emails"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const contactList: string[] = [];
      querySnapshot.forEach((doc: DocumentData) => {
        const email = doc.data().email;
        if (email !== currentUserEmail) {
          contactList.push(email);
        }
      });
      setContacts(contactList);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserEmail]);

  const startConversation = (email: string) => {
    const conversationId = [currentUserEmail, email].sort().join("_");
    onSelectConversation(conversationId);
  };

  return (
    <IonList>
      {contacts.map((contact) => (
        <IonItem button key={contact} onClick={() => startConversation(contact)}>
          <IonLabel>{contact}</IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

export default ContactList;
