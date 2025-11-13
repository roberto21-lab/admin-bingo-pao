// src/App.tsx
import * as React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./Pages/Home";
import Footer from "./components/Footer";
import Rooms from "./Pages/Rooms";
import UserPurchaseDetail from "./Pages/UserPurchaseDetail";
// import Home from "./Pages/Home";
// import Header from "./Pages/Header";
// import RoomDetail from "./Pages/RoomDetail";
// import PurchasedCartons from "./Pages/PurchasedCartons";
// import Header from "./components/Header"; // asegúrate de la ruta real

// Componente 404 simple (puedes moverlo a src/Pages/NotFound.tsx luego)
function NotFound() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que intentas abrir no existe.</p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <>
      {/* <Header
        title="Bingo Pao"
        links={[
          { label: "Inicio", to: "/" },
          // agrega más links cuando existan rutas
          // { label: "Salas", to: "/rooms" },
          // { label: "Reglas", to: "/rules" },
        ]}
        onNavigate={(to) => navigate(to)}
        actionLabel="Crear sala"
        onActionClick={() => alert("Crear sala (próximamente)")}
        roomCount={2}
      /> */}

         <div style={{ paddingBottom: 72 }}>{/* espacio para el footer fijo */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/create-room" element={<CreateRoom />} /> */}
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/purchase/:id" element={<UserPurchaseDetail />} />
        </Routes>


      </div>
       <Footer
        createTo="/"
        otherTo="/rooms"
        createLabel="Crear sala"
        otherLabel="Salas"
      />
    </>
  );
}
