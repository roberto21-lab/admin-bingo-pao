import {
  Avatar,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

type Purchase = {
  id: string;
  userName: string;
  userEmail?: string;
  qty: number;
  ticketPrice?: number;
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

  const record = React.useMemo<Purchase | undefined>(() => {
    if (!id) return MOCK_PURCHASES[0];
    return MOCK_PURCHASES.find((p) => p.id === id) ?? MOCK_PURCHASES[0];
  }, [id]);

  // --- UI state ---
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
  const [confirm, setConfirm] = React.useState<null | "accept" | "transfer" | "cancel">(null);

  // estado local del status (para reflejar cambios de aceptar/cancelar)
  const [localStatus, setLocalStatus] = React.useState<Purchase["status"]>(record?.status ?? "pending");

  // Transferir: SIEMPRE deshabilitado al inicio; se habilita solo tras aceptar
  const [canTransfer, setCanTransfer] = React.useState(false);

  if (!record) return null;

  const total = record.ticketPrice ? record.ticketPrice * record.qty : undefined;

  const statusColor =
    localStatus === "paid" ? "success" : localStatus === "pending" ? "warning" : "default";

  const handleAccept = () => setConfirm("accept");
  const handleTransfer = () => setConfirm("transfer");
  const handleCancelPayment = () => setConfirm("cancel");
  const closeConfirm = () => setConfirm(null);

  const doAccept = () => {
    // POST /purchases/:id/accept
    setLocalStatus("paid");
    setCanTransfer(true); // habilitar transfer
    setSnack({ open: true, msg: `Pago de ${record.userName} aceptado.` });
    setConfirm(null);
  };

  const doCancelPayment = () => {
    // POST /purchases/:id/reject
    setLocalStatus("rejected");
    setCanTransfer(false); // asegurar que quede deshabilitado
    setSnack({ open: true, msg: `Pago de ${record.userName} cancelado.` });
    setConfirm(null);
  };

  const doTransfer = () => {
    // POST /wallet/transfer (o la que corresponda)
    setSnack({ open: true, msg: `Saldo transferido a ${record.userName}.` });
    setConfirm(null);
    navigate("/rooms");
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Detalle del comprador</Typography>
        <Button size="small" onClick={() => navigate(-1)}>Volver</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64 }}>
            {record.userName.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
          </Avatar>

          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>{record.userName}</Typography>
            {record.userEmail && (
              <Typography variant="body2" color="text.secondary">{record.userEmail}</Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip size="small" label={`Estado: ${localStatus}`} color={statusColor as any} />
              <Chip size="small" variant="outlined" label={`Cartones: ${record.qty}`} />
              {typeof total === "number" && (
                <Chip size="small" variant="outlined" label={`Total: $${total.toFixed(2)}`} />
              )}
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">Fecha de solicitud</Typography>
            <Typography>{new Date(record.createdAt).toLocaleString()}</Typography>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">Precio por cartón</Typography>
            <Typography>{record.ticketPrice ? `$${record.ticketPrice}` : "—"}</Typography>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAccept}
            disabled={localStatus !== "pending"}
          >
            Aceptar pago
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelPayment}
            disabled={localStatus !== "pending"}
          >
            Cancelar pago
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleTransfer}
            disabled={!canTransfer}
          >
            Transferir saldo a este usuario
          </Button>
        </Stack>
      </Paper>

      {/* Confirmar Aceptación */}
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

      {/* Confirmar Cancelación */}
      <Dialog open={confirm === "cancel"} onClose={closeConfirm}>
        <DialogTitle>Confirmar cancelación</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas <b>cancelar</b> el pago de <b>{record.userName}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>No</Button>
          <Button variant="contained" color="error" onClick={doCancelPayment}>Sí, cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar Transferencia */}
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
