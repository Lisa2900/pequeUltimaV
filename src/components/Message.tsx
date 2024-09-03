// src/components/Message.tsx
import React from "react";
import { IonItem, IonLabel } from "@ionic/react";

interface MessageProps {
  text: string;
  timestamp: Date;
  user: string;
  currentUser: string;
}

const Message: React.FC<MessageProps> = ({ text, timestamp, user, currentUser }) => {
  const isCurrentUser = user === currentUser;

  return (
    <IonItem
      className={`message ${isCurrentUser ? "sent" : "received"}`}
      lines="none"
      style={{
        backgroundColor: isCurrentUser ? "#dcf8c6" : "#ffffff",
        borderRadius: isCurrentUser ? "15px 15px 0 15px" : "15px 15px 15px 0",
        margin: "5px 0",
        padding: "10px",
        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
      }}
    >
      <IonLabel>
        <div className="message-text">{text}</div>
        <div className="message-time">{timestamp.toLocaleTimeString()}</div>
      </IonLabel>
    </IonItem>
  );
};

export default Message;
