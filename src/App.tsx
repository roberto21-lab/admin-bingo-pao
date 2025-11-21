// src/App.tsx
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import {
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import Menu from "./components/Menu";
import Home from "./Pages/Home";
import LoadRequest from "./Pages/loadRequest";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import RoomDetails from "./Pages/RoomDetails";
import Rooms from "./Pages/Rooms";
import UserDetails from "./Pages/UserDetails";
import UserPurchaseDetail from "./Pages/UserPurchaseDetail";
import Users from "./Pages/Users";
import UserWithdraw from "./Pages/UserWithdraw";
import WithdrawalRequest from "./Pages/WithdrawalRequest";
import theme from "./theme";
import { useAuth } from "./context/AuthContext";
import type { JSX } from "react";

function NotFound() {
  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que intentas abrir no existe.</p>
    </div>
  );
}

// 🔒 Ruta privada: solo accesible si hay usuario logueado
// function PrivateRoute({ children }: { children: JSX.Element }) {
//   const { isAuthenticated, initialized } = useAuth();

//   // Mientras carga el contexto (lee localStorage), no hacemos nada.
//   // Aquí puedes poner un spinner si quieres.
//   if (!initialized) return null;

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

// // 🔓 Ruta pública (login): si ya está logueado, lo llevo al home
// function PublicRoute({ children }: { children: JSX.Element }) {
//   const { isAuthenticated, initialized } = useAuth();

//   if (!initialized) return null;

//   if (isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }

// 🔒 Ruta privada: por ahora NO protege nada
function PrivateRoute({ children }: { children: JSX.Element }) {
  return children;
}

// 🔓 Ruta pública (login): por ahora NO redirige si estás logueado
function PublicRoute({ children }: { children: JSX.Element }) {
  return children;
}

export default function App() {
  const location = useLocation();

  // Mostrar/ocultar menú según la ruta
  const isLogin = location.pathname === "/login";
  const showMenu = !isLogin;
  // si luego usas footer, lo puedes manejar con showFooter igual
  // const showFooter = !isLogin;

  // Debe coincidir con el ancho del Drawer en tu componente Menu
  const drawerWidth = 260;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Menú lateral (md+) */}
        {showMenu && <Menu />}

        <Toolbar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // si tu Menu desplaza el contenido: ml: { md: `${drawerWidth}px` },
          }}
        >
          <Routes>
            {/* 🔐 RUTAS PRIVADAS */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <PrivateRoute>
                  <Rooms />
                </PrivateRoute>
              }
            />
            <Route
              path="/purchase/:id"
              element={
                <PrivateRoute>
                  <UserPurchaseDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-withdraw/:id"
              element={
                <PrivateRoute>
                  <UserWithdraw />
                </PrivateRoute>
              }
            />
            <Route
              path="/room-details/:id"
              element={
                <PrivateRoute>
                  <RoomDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-details/:id"
              element={
                <PrivateRoute>
                  <UserDetails />
                </PrivateRoute>
              }
            />
           
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/topup-requests"
              element={
                <PrivateRoute>
                  <LoadRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="/withdraw-requests"
              element={
                <PrivateRoute>
                  <WithdrawalRequest />
                </PrivateRoute>
              }
            />

             <Route
              path="/register-user"
              element={
                <PrivateRoute>
                  <Register />
                </PrivateRoute>
              }
            />

            {/* 🔓 LOGIN – solo si NO está autenticado */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
