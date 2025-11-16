// src/App.tsx
import { Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Rooms from "./Pages/Rooms";
import UserPurchaseDetail from "./Pages/UserPurchaseDetail";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";
import { CssBaseline } from "@mui/material";
import React from "react";
import  Login  from "./Pages/Login";

function NotFound() {
  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que intentas abrir no existe.</p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [seeFooter, setSeeFooter] = React.useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

{/* Login */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/purchase/:id" element={<UserPurchaseDetail />} />
        <Route path="/register-user" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {
        seeFooter && (
          <Footer
            createTo="/"
            otherTo="/rooms"
            createLabel="Crear sala"
            otherLabel="Salas"
          />
        )
      }

    </ThemeProvider>

  );
}
