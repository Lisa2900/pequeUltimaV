// src/components/Chat.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonAvatar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonButtons,  // Importar IonButtons si no está
} from "@ionic/react";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { db, auth } from "../../firebase";
import ConversationList from "../../components/ConversationList";
import ContactList from "../../components/ContactList";
import ChatView from "../../components/ChatView";
import { personCircleOutline, peopleOutline } from "ionicons/icons"; // Importar iconos

const Chat: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [showContacts, setShowContacts] = useState<boolean>(false); // Estado para mostrar contactos

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setProfileName(currentUser.displayName || "");
      } else {
        setUser(null);
        setProfileName("");
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleSelectConversation = (convId: string) => {
    setConversationId(convId);
    setShowContacts(false); // Ocultar contactos al seleccionar una conversación
  };

  const handleProfileUpdate = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName: profileName });
        alert("Perfil actualizado con éxito");
      } catch (error) {
        console.error("Error actualizando perfil", error);
      }
    }
  };

  return (
    <IonSplitPane contentId="main">
      {/* Menú lateral con lista de conversaciones */}
      <IonMenu contentId="main" type="overlay">
        <IonContent>
          <IonItem>
            <IonAvatar>
              <IonIcon icon={personCircleOutline} />
            </IonAvatar>
            <IonLabel>
              <IonInput
                value={profileName}
                onIonChange={(e) => setProfileName(e.detail.value!)}
                placeholder="Nombre de usuario"
              />
              <IonButton size="small" onClick={handleProfileUpdate}>
                Guardar
              </IonButton>
            </IonLabel>
          </IonItem>
          <IonButtons>
            <IonButton onClick={() => setShowContacts(!showContacts)}>
              <IonIcon icon={peopleOutline} />
              Contactos
            </IonButton>
          </IonButtons>
          {user && !showContacts && (
            <ConversationList
              currentUserEmail={user.email || ""}
              onSelectConversation={handleSelectConversation}
            />
          )}
          {user && showContacts && (
            <ContactList
              currentUserEmail={user.email || ""}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </IonContent>
      </IonMenu>

      {/* Contenido principal del chat */}
      <IonPage id="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Chat</IonTitle>
          </IonToolbar>
        </IonHeader>
        {user && conversationId && (
          <ChatView conversationId={conversationId} currentUserEmail={user.email || ""} />
        )}
      </IonPage>
    </IonSplitPane>
  );
};

export default Chat;
