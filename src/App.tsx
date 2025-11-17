// src/App.tsx
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Rooms from "./Pages/Rooms";
import UserPurchaseDetail from "./Pages/UserPurchaseDetail";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import React from "react";
import Login from "./Pages/Login";
import Menu from "./components/Menu";
import LoadRequest from "./Pages/loadRequest";
import WithdrawalRequest from "./Pages/WithdrawalRequest";
import UserWithdraw from "./Pages/UserWithdraw";
import RoomDetails from "./Pages/RoomDetails";
import Users from "./Pages/Users";
import UserDetails from "./Pages/UserDetails";

function NotFound() {
  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que intentas abrir no existe.</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  // Mostrar/ocultar menú y footer según la ruta
  const isLogin = location.pathname === "/login";
  const showMenu = !isLogin;
  const showFooter = !isLogin;

  // Debe coincidir con el ancho del Drawer en tu componente Menu
  const drawerWidth = 260;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Menú lateral (md+) */}
        {showMenu && <Menu />}

        {/* Contenido principal */}
     
          {/* Si más adelante agregas un AppBar, este Toolbar empuja el contenido */}
          <Toolbar />

          <Routes>
            {/* Rutas con layout (verán Menu y Footer) */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/purchase/:id" element={<UserPurchaseDetail />} />
            <Route path="/user-withdraw/:id" element={<UserWithdraw />} />
            <Route path="/room-details/:id" element={<RoomDetails />} />
            <Route path="/user-details/:id" element={<UserDetails />} />

            
            
            
            <Route path="/register-user" element={<Register />} />
            <Route path="/users" element={<Users />} />
            <Route path="/topup-requests" element={<LoadRequest />} />
            <Route path="/withdraw-requests" element={<WithdrawalRequest />} />
            {/* WithdrawalRequest */}
            {/* Login sin layout */}
            <Route path="/login" element={<Login />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        {/* Footer fijo */}
        {/* {showFooter && (
          <Footer
            createTo="/"
            otherTo="/rooms"
            createLabel="Crear sala"
            otherLabel="Salas"
          />
        )} */}
      </Box>
    </ThemeProvider>
  );
}
