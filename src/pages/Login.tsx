import React, { useState } from "react";
import usuarioImg from "../img/Nuevoxd.png";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../Styles/Login.css";
import { Button } from "@nextui-org/react";
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonList,
  IonInput,
  IonContent,
  IonSpinner,
} from "@ionic/react";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const history = useHistory();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Primero, verifica si el usuario existe en la colección 'empleados'
      const empleadosRef = collection(db, "empleados");
      const q = query(empleadosRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErrorMessage("El usuario no está registrado como empleado");
        setLoading(false);
        return;
      }

      // Si el usuario es un empleado, intenta autenticarlo
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el rol y estado de autenticación en el localStorage
      localStorage.setItem("role", "empleado");
      localStorage.setItem("loggedIn", "true");

      onLogin(); // Llamamos a la función onLogin
      history.push("/inicio");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      setErrorMessage("Error en las credenciales"); // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent>
      <IonCard className=" max-w-sm mx-auto  bg-black mt-8 p-5 shadow-lg rounded-3xl text-white">
        <img
          alt="Silueta de montañas"
          src={usuarioImg}
          style={{
            width: "80%",
            borderRadius: "10px",
            marginRight: "auto",
            marginLeft: "auto",
            display: "block",
          }}
        />
        <IonCardHeader
          style={{ textAlign: "center" }}
          className="rounded-b-3xl"
        >
          <IonCardTitle style={{ fontSize: "24px", fontWeight: "bold" }}>
            Iniciar Sesión
          </IonCardTitle>
          <IonCardSubtitle style={{ color: "#666" }}>
            Inicia sesión para entrar al sistema
          </IonCardSubtitle>
        </IonCardHeader>

        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          <IonList className="bg-black">
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
              placeholder=" Email"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono  font-arial rounded-lg px-4 py-2 mt-5"
            />

            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              required
              placeholder=" Contraseña"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono  font-arial rounded-lg px-4 py-2 mt-5"
            />
          </IonList>
          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              backgroundColor: "#007bff",
              color: "#fff",
            }}
          >
            {loading ? <IonSpinner name="crescent" /> : "Iniciar sesión"}
          </Button>
        </form>
        {errorMessage && (
          <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
            {errorMessage}
          </p>
        )}
      </IonCard>
    </IonContent>
  );
};

export default Login;
