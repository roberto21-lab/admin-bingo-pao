import * as React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ViewListIcon from "@mui/icons-material/ViewList";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

const items = [
  { label: "Crear sala", icon: <AddCircleIcon />, to: "/" },
  { label: "Listado de salas", icon: <ViewListIcon />, to: "/rooms" },
  { label: "Crear persona", icon: <PersonAddAlt1Icon />, to: "/register-user" },
  { label: "Solicitud de recarga", icon: <AccountBalanceWalletIcon />, to: "/topup-requests" },
  { label: "Solicitud de retiro", icon: <PaidIcon />, to: "/withdraw-requests" },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: "none", md: "block" }, // fijo en desktop, oculto en mobile
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
      open
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={800}>
          Panel
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {items.map((it) => {
            const selected = location.pathname === it.to;
            return (
              <ListItemButton
                key={it.to}
                selected={selected}
                onClick={() => navigate(it.to)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
