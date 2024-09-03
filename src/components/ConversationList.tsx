// src/components/ConversationList.tsx
import React, { useEffect, useState } from "react";
import { IonList, IonItem, IonLabel } from "@ionic/react";
import { collection, query, where, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebase";
interface ConversationListProps {
  currentUserEmail: string;
  onSelectConversation: (conversationId: string) => void;
}

interface Conversation {
  id: string;
  users: string[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentUserEmail,
  onSelectConversation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where("users", "array-contains", currentUserEmail)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversationList: Conversation[] = [];
      querySnapshot.forEach((doc: DocumentData) => {
        const data = doc.data();
        conversationList.push({
          id: doc.id,
          users: data.users,
        });
      });
      setConversations(conversationList);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserEmail]);

  return (
    <IonList>
      {conversations.map((conversation) => {
        const otherUserEmail = conversation.users.find((email) => email !== currentUserEmail);
        return (
          <IonItem button key={conversation.id} onClick={() => onSelectConversation(conversation.id)}>
            <IonLabel>{otherUserEmail}</IonLabel>
          </IonItem>
        );
      })}
    </IonList>
  );
};

export default ConversationList;
