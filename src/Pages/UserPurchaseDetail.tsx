import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

// === MOCK DATA (simulado) ===
type Purchase = {
  id: string;
  userName: string;
  userEmail?: string;
  qty: number;           // cartones comprados
  ticketPrice?: number;  // opcional para calculitos
  status: "pending" | "paid" | "rejected";
  createdAt: string;
};

const MOCK_PURCHASES: Purchase[] = [
  { id: "1", userName: "María Pérez", qty: 5, ticketPrice: 10, status: "pending", createdAt: "2025-11-10T18:34:00" },
  { id: "2", userName: "Juan Gómez",  qty: 2, ticketPrice: 10, status: "paid",    createdAt: "2025-11-10T19:01:00" },
  { id: "3", userName: "Ana López",   qty: 8, ticketPrice: 10, status: "pending", createdAt: "2025-11-11T09:15:00" },
];

export default function UserPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Busca el registro mock por id (si no viene id, agarra el primero)
  const record = React.useMemo<Purchase | undefined>(() => {
    if (!id) return MOCK_PURCHASES[0];
    return MOCK_PURCHASES.find((p) => p.id === id) ?? MOCK_PURCHASES[0];
  }, [id]);

  // UI state
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
  const [confirm, setConfirm] = React.useState<null | "accept" | "transfer">(null);

  if (!record) return null;

  const total = record.ticketPrice ? record.ticketPrice * record.qty : undefined;

  const statusColor =
    record.status === "paid" ? "success" : record.status === "pending" ? "warning" : "default";

  const handleAccept = () => setConfirm("accept");
  const handleTransfer = () => setConfirm("transfer");
  const closeConfirm = () => setConfirm(null);

  const doAccept = () => {
    // aquí llamarías a tu API: POST /purchases/:id/accept
    setSnack({ open: true, msg: `Pago de ${record.userName} aceptado.` });
    setConfirm(null);
  };

  const doTransfer = () => {
    // aquí llamarías a tu API: POST /wallet/transfer
    setSnack({ open: true, msg: `Saldo transferido a ${record.userName}.` });
    setConfirm(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Detalle del comprador</Typography>
        <Button size="small" onClick={() => navigate(-1)}>Volver</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
            <Avatar sx={{ width: 64, height: 64 }}>
              {record.userName.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
            </Avatar>

            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={700}>{record.userName}</Typography>
              {record.userEmail && (
                <Typography variant="body2" color="text.secondary">{record.userEmail}</Typography>
              )}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip size="small" label={`Estados: ${record.status}`} color={statusColor as any} />
                <Chip size="small" variant="outlined" label={`Cartones: ${record.qty}`} />
                {typeof total === "number" && (
                  <Chip size="small" variant="outlined" label={`Total: $${total.toFixed(2)}`} />
                )}
              </Stack>
            </Stack>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Fecha de solicitud</Typography>
              <Typography>{new Date(record.createdAt).toLocaleString()}</Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Precio por cartón</Typography>
              <Typography>{record.ticketPrice ? `$${record.ticketPrice}` : "—"}</Typography>
            </Stack>
          </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            disabled={record.status !== "pending"}
          >
            Aceptar pago
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleTransfer}
            // disabled={record.status !== "paid"}
          >
            Transferir saldo a este usuario
          </Button>
        </Stack>
      </Paper>

      {/* Dialogs de confirmación */}
      <Dialog open={confirm === "accept"} onClose={closeConfirm}>
        <DialogTitle>Confirmar aceptación</DialogTitle>
        <DialogContent>
          ¿Confirmas que el pago de <b>{record.userName}</b> por <b>{record.qty}</b> cartones es válido?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doAccept}>Aceptar pago</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirm === "transfer"} onClose={closeConfirm}>
        <DialogTitle>Confirmar transferencia</DialogTitle>
        <DialogContent>
          Se transferirá el saldo correspondiente a <b>{record.userName}</b>.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doTransfer}>Transferir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false, msg: "" })}
        autoHideDuration={3000}
        message={snack.msg}
      />
    </Container>
  );
}
