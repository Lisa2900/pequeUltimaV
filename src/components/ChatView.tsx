// src/components/ChatView.tsx
import React, { useEffect, useState, useRef } from "react";
import { IonContent, IonFooter } from "@ionic/react";
import { collection, addDoc, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebase";
import Message from "./Message";
import MessageInput from "./MessageInput";

interface MessageData {
  text: string;
  timestamp: Date;
  user: string;
}

interface ChatViewProps {
  conversationId: string | null;
  currentUserEmail: string;
}

const ChatView: React.FC<ChatViewProps> = ({ conversationId, currentUserEmail }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (conversationId) {
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs: MessageData[] = [];
        querySnapshot.forEach((doc: DocumentData) => {
          const data = doc.data();
          msgs.push({
            text: data.text,
            timestamp: data.timestamp.toDate(),
            user: data.user,
          });
        });
        setMessages(msgs);
        scrollToBottom();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [conversationId]);

  const handleSend = async () => {
    if (newMessage.trim() !== "" && currentUserEmail && conversationId) {
      try {
        await addDoc(collection(db, "conversations", conversationId, "messages"), {
          text: newMessage,
          timestamp: new Date(),
          user: currentUserEmail,
        });
        setNewMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("Error enviando mensaje", error);
      }
    }
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
    }
  };

  return (
    <>
      <IonContent ref={contentRef} style={{ backgroundColor: "#e5ddd5" }}>
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            timestamp={msg.timestamp}
            user={msg.user}
            currentUser={currentUserEmail}
          />
        ))}
      </IonContent>
      <IonFooter>
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
        />
      </IonFooter>
    </>
  );
};

export default ChatView;
