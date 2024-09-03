import React, { useState, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { home, list, construct, addCircle, personCircle } from 'ionicons/icons';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

import Inicio from './pages/sistema/Inicio';
import Inventario from './pages/sistema/Inventario';
import Admin from './pages/sistema/Admin';
import UserProfile from './pages/sistema/UserProfile';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

setupIonicReact();

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);

        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const employeeStatus = userDoc.data().empleado;
          setIsEmployee(employeeStatus ?? false);
        } else {
          setIsEmployee(false);
        }
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <IonApp>Loading...</IonApp>;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonPage id="main-content">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Multiservicios "Los Peques" Soporte Tecnico</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonRouterOutlet>
              <Switch>
                <Route exact path="/login">
                  {loggedIn ? <Redirect to="/inicio" /> : <Login onLogin={() => setLoggedIn(true)} />}
                </Route>
                <Route exact path="/register" component={Register} />
                {loggedIn ? (
                  <>
                    <Route exact path="/inicio" component={Inicio} />
                    <Route exact path="/perfil" component={UserProfile} />
                    {!isEmployee && (
                      <>
                        <Route exact path="/inventario" component={Inventario} />
                        <Route exact path="/admin" component={Admin} />
                      </>
                    )}
                    <Route exact path="/">
                      <Redirect to="/inicio" />
                    </Route>
                    <IonTabs className="block md:hidden">
                      <IonRouterOutlet>
                        <Route exact path="/inicio" component={Inicio} />
                        <Route exact path="/perfil" component={UserProfile} />
                        {!isEmployee && (
                          <>
                            <Route exact path="/inventario" component={Inventario} />
                            <Route exact path="/admin" component={Admin} />
                          </>
                        )}
                      </IonRouterOutlet>
                      <IonTabBar slot="bottom">
                        <IonTabButton tab="inicio" href="/inicio">
                          <IonIcon icon={home} />
                          <IonLabel>Inicio</IonLabel>
                        </IonTabButton>
                        {!isEmployee && (
                          <IonTabButton tab="inventario" href="/inventario">
                            <IonIcon icon={list} />
                            <IonLabel>Inventario</IonLabel>
                          </IonTabButton>
                        )}
                        {!isEmployee && (
                          <IonTabButton tab="admin" href="/admin">
                            <IonIcon icon={construct} />
                            <IonLabel>Admin</IonLabel>
                          </IonTabButton>
                        )}
                        <IonTabButton tab="mas" href="/perfil">
                          <IonIcon icon={personCircle} />
                          <IonLabel>Perfil</IonLabel>
                        </IonTabButton>
                      </IonTabBar>
                    </IonTabs>
                  </>
                ) : (
                  <Redirect to="/login" />
                )}
                <Route component={NotFound} />
              </Switch>
            </IonRouterOutlet>
          </IonContent>
        </IonPage>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
