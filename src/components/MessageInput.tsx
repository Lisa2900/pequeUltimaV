// src/components/MessageInput.tsx
import React from "react";
import { IonButton, IonInput, IonItem, IonToolbar } from "@ionic/react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSend: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ newMessage, setNewMessage, handleSend }) => {
  return (
    <IonToolbar>
      <IonItem lines="none" style={{ padding: "10px", backgroundColor: "#ffffff" }}>
        <IonInput
          value={newMessage}
          onIonChange={(e) => setNewMessage(e.detail.value!)}
          placeholder="Escribe un mensaje"
          style={{ flex: 1 }}
        />
        <IonButton onClick={handleSend} color="primary" style={{ marginLeft: "10px" }}>
          Enviar
        </IonButton>
      </IonItem>
    </IonToolbar>
  );
};

export default MessageInput;
