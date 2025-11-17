// src/Pages/WithdrawRequestDetail.tsx
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

type WithdrawStatus = "pending" | "approved" | "rejected";
type AccountType = "Cuenta corriente" | "Cuenta de ahorro" | "Pago móvil";

type WithdrawRequest = {
  id: string;
  // solicitante
  userName: string;
  userEmail: string;
  ciNumber: string;

  // retiro
  requestedAt: string;
  amountBs: number;

  // destino
  bankName: string;
  accountType: AccountType;

  /** Si es cuenta bancaria tradicional */
  accountNumber?: string; // 20 dígitos aprox

  /** Si es pago móvil */
  phoneNumber?: string; // 04xx-xxx-xxxx

  /** Titular de la cuenta o pago móvil */
  holderName: string;
  holderCI: string;

  // adjunto (opcional): comprobante de pago final que subirías luego
  receiptUrl?: string;

  status: WithdrawStatus;
};

const MOCK_WITHDRAW_REQUESTS: WithdrawRequest[] = [
  {
    id: "w1",
    userName: "María Pérez",
    userEmail: "maria@example.com",
    ciNumber: "V-21.345.678",
    requestedAt: "2025-11-14T16:20:00",
    amountBs: 1500.75,
    bankName: "Banco de Venezuela",
    accountType: "Pago móvil",
    phoneNumber: "0412-5551234",
    holderName: "María A. Pérez",
    holderCI: "V-21.345.678",
    status: "pending",
  },
  {
    id: "w2",
    userName: "Juan Gómez",
    userEmail: "juan@example.com",
    ciNumber: "V-18.222.111",
    requestedAt: "2025-11-14T18:05:00",
    amountBs: 980.0,
    bankName: "Banesco",
    accountType: "Cuenta corriente",
    accountNumber: "0134-5678-9012-3456-7890",
    holderName: "Juan C. Gómez",
    holderCI: "V-18.222.111",
    status: "approved",
  },
  {
    id: "w3",
    userName: "Ana López",
    userEmail: "ana@example.com",
    ciNumber: "V-25.987.321",
    requestedAt: "2025-11-15T09:30:00",
    amountBs: 2300.0,
    bankName: "Mercantil",
    accountType: "Cuenta de ahorro",
    accountNumber: "0105-0012-3456-7890-1234",
    holderName: "Ana M. López",
    holderCI: "V-25.987.321",
    status: "pending",
  },
];

export default function WithdrawRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = React.useMemo<WithdrawRequest>(() => {
    if (!id) return MOCK_WITHDRAW_REQUESTS[0];
    return (
      MOCK_WITHDRAW_REQUESTS.find((r) => r.id === id) ?? MOCK_WITHDRAW_REQUESTS[0]
    );
  }, [id]);

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });
  const [confirm, setConfirm] = React.useState<null | "approve" | "reject">(null);
  const [localStatus, setLocalStatus] = React.useState<WithdrawStatus>(
    record.status
  );

  // Enviar correo al aprobar (simulado)
  const [sendEmail, setSendEmail] = React.useState(true);

  const statusColor =
    localStatus === "approved" ? "success" : localStatus === "pending" ? "warning" : "default";

  const openApprove = () => setConfirm("approve");
  const openReject = () => setConfirm("reject");
  const closeConfirm = () => setConfirm(null);

  const formatBs = (n: number) =>
    new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const initials = record.userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const doApprove = () => {
    // POST /withdraws/:id/approve  (y opcionalmente /mailer/send)
    setLocalStatus("approved");
    setSnack({
      open: true,
      msg: `Retiro aprobado para ${record.userName}${
        sendEmail ? ` y correo enviado a ${record.userEmail}` : ""
      }.`,
    });
    setConfirm(null);
    // Redirigir al listado si quieres:
    // navigate("/withdraw-requests");
  };

  const doReject = () => {
    // POST /withdraws/:id/reject
    setLocalStatus("rejected");
    setSnack({ open: true, msg: `Retiro rechazado para ${record.userName}.` });
    setConfirm(null);
    // navigate("/withdraw-requests");
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Solicitud de retiro
        </Typography>
        <Button size="small" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {/* Cabecera */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64 }}>{initials}</Avatar>

          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {record.userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {record.userEmail}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip size="small" label={`Estado: ${localStatus}`} color={statusColor as any} />
              <Chip size="small" variant="outlined" label={`CI: ${record.ciNumber}`} />
              <Chip
                size="small"
                variant="outlined"
                label={`Monto: Bs ${formatBs(record.amountBs)}`}
              />
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
            <Typography>{new Date(record.requestedAt).toLocaleString()}</Typography>
          </Stack>
        </Stack>

        {/* 🧾 Datos del destino */}
        <Typography variant="subtitle2" sx={{ mb: 1.5 }} fontWeight={700}>
          Datos bancarios destino
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ md: "flex-start" }}>
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
                Tipo de cuenta
              </Typography>
              <Typography fontWeight={600}>{record.accountType}</Typography>
            </Stack>

            {record.accountType !== "Pago móvil" ? (
              <Stack spacing={0.3}>
                <Typography variant="caption" color="text.secondary">
                  Nº de cuenta
                </Typography>
                <Typography fontWeight={600}>{record.accountNumber ?? "—"}</Typography>
              </Stack>
            ) : (
              <Stack spacing={0.3}>
                <Typography variant="caption" color="text.secondary">
                  Teléfono (Pago móvil)
                </Typography>
                <Typography fontWeight={600}>{record.phoneNumber ?? "—"}</Typography>
              </Stack>
            )}

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Titular
              </Typography>
              <Typography fontWeight={600}>{record.holderName}</Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                CI del titular
              </Typography>
              <Typography fontWeight={600}>{record.holderCI}</Typography>
            </Stack>
          </Stack>

          {/* Columna derecha: (espacio para comprobante / nota futura) */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography variant="caption" color="text.secondary">
              Comprobante (opcional)
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

        {/* Acciones */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={openApprove}
            disabled={localStatus !== "pending"}
          >
            Aprobar retiro
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={openReject}
            disabled={localStatus !== "pending"}
          >
            Rechazar
          </Button>
        </Stack>
      </Paper>

      {/* Diálogo: Aprobar */}
      <Dialog open={confirm === "approve"} onClose={closeConfirm}>
        <DialogTitle>Confirmar aprobación de retiro</DialogTitle>
        <DialogContent>
          Se aprobará el retiro de <b>Bs {formatBs(record.amountBs)}</b> para{" "}
          <b>{record.userName}</b>.
          <br />
          Banco: <b>{record.bankName}</b> — {record.accountType === "Pago móvil" ? (
            <>Teléfono: <b>{record.phoneNumber}</b></>
          ) : (
            <>Nº de cuenta: <b>{record.accountNumber}</b></>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
              }
              label={`Enviar correo a ${record.userEmail} confirmando la transferencia`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doApprove}>
            Aprobar y continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo: Rechazar */}
      <Dialog open={confirm === "reject"} onClose={closeConfirm}>
        <DialogTitle>Confirmar rechazo</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas <b>rechazar</b> la solicitud de retiro de <b>{record.userName}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>No</Button>
          <Button variant="contained" color="error" onClick={doReject}>
            Sí, rechazar
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
