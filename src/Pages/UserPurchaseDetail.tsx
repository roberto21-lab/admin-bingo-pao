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
  Typography,
  Box,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

type PurchaseStatus = "pending" | "paid" | "rejected";

type Purchase = {
  id: string;
  userName: string;
  userEmail?: string;
  qty: number;
  ticketPrice?: number;
  status: PurchaseStatus;
  createdAt: string;

  // 💳 Campos de pago móvil
  bankName: string;
  amountBs: number;       // monto en bolívares
  phoneNumber: string;    // número de celular (pago móvil)
  ciNumber: string;       // cédula
  referenceNumber: string;// referencia bancaria
  receiptUrl?: string;    // URL o base64 del comprobante (opcional)
};

const MOCK_PURCHASES: Purchase[] = [
  {
    id: "1",
    userName: "María Pérez",
    qty: 5,
    ticketPrice: 10,
    status: "pending",
    createdAt: "2025-11-10T18:34:00",
    bankName: "Banco de Venezuela",
    amountBs: 850.5,
    phoneNumber: "0412-5551234",
    ciNumber: "V-21.345.678",
    referenceNumber: "1234567",
    receiptUrl: "", // Deja vacío o coloca un link/base64 de prueba
  },
  {
    id: "2",
    userName: "Juan Gómez",
    qty: 2,
    ticketPrice: 10,
    status: "paid",
    createdAt: "2025-11-10T19:01:00",
    bankName: "Banesco",
    amountBs: 340.0,
    phoneNumber: "0414-1112233",
    ciNumber: "V-18.222.111",
    referenceNumber: "7654321",
    receiptUrl: "",
  },
  {
    id: "3",
    userName: "Ana López",
    qty: 8,
    ticketPrice: 10,
    status: "pending",
    createdAt: "2025-11-11T09:15:00",
    bankName: "Mercantil",
    amountBs: 1200.75,
    phoneNumber: "0424-7778899",
    ciNumber: "V-25.987.321",
    referenceNumber: "9988776",
    receiptUrl: "",
  },
];

export default function UserPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = React.useMemo<Purchase | undefined>(() => {
    if (!id) return MOCK_PURCHASES[0];
    return MOCK_PURCHASES.find((p) => p.id === id) ?? MOCK_PURCHASES[0];
  }, [id]);

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });
  const [confirm, setConfirm] = React.useState<null | "accept" | "cancel">(null);

  const [localStatus, setLocalStatus] = React.useState<PurchaseStatus>(
    record?.status ?? "pending"
  );

  if (!record) return null;

  const total = record.ticketPrice ? record.ticketPrice * record.qty : undefined;

  const statusColor =
    localStatus === "paid" ? "success" : localStatus === "pending" ? "warning" : "default";

  const openAccept = () => setConfirm("accept");
  const openCancel = () => setConfirm("cancel");
  const closeConfirm = () => setConfirm(null);

  const doAccept = () => {
    // POST /purchases/:id/accept
    setLocalStatus("paid");
    setSnack({ open: true, msg: `Pago de ${record.userName} aceptado.` });
    setConfirm(null);
  };

  const doCancelPayment = () => {
    // POST /purchases/:id/reject
    setLocalStatus("rejected");
    setSnack({ open: true, msg: `Pago de ${record.userName} cancelado.` });
    setConfirm(null);
  };

  const formatBs = (n: number) =>
    new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Detalle del comprador
        </Typography>
        <Button size="small" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {/* Cabecera con usuario + chips */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64 }}>
            {record.userName
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </Avatar>

          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {record.userName}
            </Typography>
            {record.userEmail && (
              <Typography variant="body2" color="text.secondary">
                {record.userEmail}
              </Typography>
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

        {/* Info general */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={4} sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Fecha de solicitud
            </Typography>
            <Typography>{new Date(record.createdAt).toLocaleString()}</Typography>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Precio por cartón
            </Typography>
            <Typography>{record.ticketPrice ? `$${record.ticketPrice}` : "—"}</Typography>
          </Stack>
        </Stack>

        {/* 🧾 Datos del pago móvil */}
        <Typography variant="subtitle2" sx={{ mb: 1.5 }} fontWeight={700}>
          Detalles del pago móvil
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ md: "flex-start" }}
        >
          {/* Columna izquierda: datos */}
          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 260 }}>
            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Banco
              </Typography>
              <Typography fontWeight={600}>{record.bankName}</Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Monto (Bs)
              </Typography>
              <Typography fontWeight={600}>Bs {formatBs(record.amountBs)}</Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Teléfono (Pago móvil)
              </Typography>
              <Typography fontWeight={600}>{record.phoneNumber}</Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Cédula
              </Typography>
              <Typography fontWeight={600}>{record.ciNumber}</Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                N° de referencia
              </Typography>
              <Typography fontWeight={600}>{record.referenceNumber}</Typography>
            </Stack>
          </Stack>

          {/* Columna derecha: imagen comprobante */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography variant="caption" color="text.secondary">
              Comprobante
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                mt: 0.5,
                p: 1,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 220,
                bgcolor: "background.default",
              }}
            >
              {record.receiptUrl ? (
                <Box
                  component="img"
                  src={record.receiptUrl}
                  alt="Comprobante"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 360,
                    objectFit: "contain",
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  (Sin imagen adjunta)
                </Typography>
              )}
            </Paper>
          </Box>
        </Stack>

        {/* Botones de acción */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={openAccept}
            disabled={localStatus !== "pending"}
          >
            Aceptar pago
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={openCancel}
            disabled={localStatus !== "pending"}
          >
            Cancelar pago
          </Button>

          {/* 
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {}}
            disabled
          >
            Transferir saldo a este usuario
          </Button> 
          */}
        </Stack>
      </Paper>

      {/* Diálogo: Aceptar */}
      <Dialog open={confirm === "accept"} onClose={closeConfirm}>
        <DialogTitle>Confirmar aceptación</DialogTitle>
        <DialogContent>
          ¿Confirmas que el pago de <b>{record.userName}</b> es válido?
          <br />
          Banco: <b>{record.bankName}</b> — Monto: <b>Bs {formatBs(record.amountBs)}</b>
          <br />
          Ref: <b>{record.referenceNumber}</b>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doAccept}>
            Aceptar pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Cancelar */}
      <Dialog open={confirm === "cancel"} onClose={closeConfirm}>
        <DialogTitle>Confirmar cancelación</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas <b>cancelar</b> el pago de <b>{record.userName}</b>?
          <br />
          Ref: <b>{record.referenceNumber}</b>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>No</Button>
          <Button variant="contained" color="error" onClick={doCancelPayment}>
            Sí, cancelar
          </Button>
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
