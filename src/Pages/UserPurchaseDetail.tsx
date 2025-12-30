import {
  Box,
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
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTransactionByIdService,
  updateTransactionStatusService,
} from "../Services/transactionService";
import { getStatusesService } from "../Services/status.service";

type PurchaseStatus = "pending" | "paid" | "rejected";

type WalletUser = {
  _id: string;
  name: string;
  email: string;
};

type Currency = {
  _id: string;
  code: string;
  name: string;
  symbol: string; // "Bs"
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
};

type Wallet = {
  _id: string;
  user_id: WalletUser;
  currency_id: Currency;
  created_at: string;
  updated_at: string;
};

type TransactionStatus = {
  _id: string;
  name: PurchaseStatus;
  category: string;
  created_at: string;
  updated_at: string;
};

type TransactionMetadata = {
  bank_name: string;
  documentTypeId: string;
  document_number: string;
  phone_number: string;
  amount: number;          // en tu JSON viene como number
  refCode: string;
  paidAt: string;
  // opcionalmente puedes soportar esto si en el futuro guardas imagen
  voucherPreview?: string | null;
};

type TransactionDetail = {
  admin_code: string | null;
  _id: string;
  wallet_id: Wallet;
  transaction_type_id: {
    _id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  amount: { $numberDecimal: string };
  currency_id: Currency;
  status_id: TransactionStatus | null; // 👈 en el JSON viene null
  metadata: TransactionMetadata;
  created_at: string;
  updatedAt: string;
};

export default function UserPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = React.useState<TransactionDetail | null>(null);
  console.log("🚀 ~ UserPurchaseDetail ~ transaction:", transaction)
  const [localStatus, setLocalStatus] = React.useState<PurchaseStatus>("pending");
  const [confirm, setConfirm] = React.useState<"accept" | "cancel" | null>(null);
  const [snack, setSnack] = React.useState({ open: false, msg: "" });
  const [statuses, setStatuses] = React.useState<any[]>([]);
  const [statusesLoading, setStatusesLoading] = React.useState(false);
  
  const navigate = useNavigate();

React.useEffect(() => {
  const fetchStatuses = async () => {
    try {
      console.log("🔥 Entrando a fetchStatuses");
      setStatusesLoading(true); // 👈 ya no usamos setLoading

      const data = await getStatusesService();
      console.log("🚀 ~ fetchStatuses ~ data:", data);

      setStatuses(data);
    } catch (err) {
      console.error("Error cargando statuses:", err);
    } finally {
      setStatusesLoading(false); // 👈 igual aquí
    }
  };

  fetchStatuses();
}, []);



  React.useEffect(() => {
    if (!id) return;

    const fetchTx = async () => {
      const data = await getTransactionByIdService(id);
      console.log("🚀 ~ fetchTx ~ data:", data);

      setTransaction(data as unknown as TransactionDetail);

      if (data?.status_id?.name) {
        setLocalStatus(data.status_id.name as PurchaseStatus);
      } else {
        // Si no tiene status_id, lo tratamos como pending
        setLocalStatus("pending");
      }
    };

    void fetchTx();
  }, [id]);

  const statusColor: "success" | "warning" | "default" =
    localStatus === "paid" ? "success" : localStatus === "pending" ? "warning" : "default";

  const openAccept = () => setConfirm("accept");
  const openCancel = () => setConfirm("cancel");
  const closeConfirm = () => setConfirm(null);

  const formatBs = (amount: number | null | undefined) => {
    if (amount == null) return "0,00";
    return amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ID del status "completed" (category: transaction)
const completedStatusId = React.useMemo(() => {
  const status = statuses.find((s) => s.name === "completed");
  return status?._id || null;
}, [statuses]);

  const doAccept = async () => {
  if (!transaction || !transaction._id) {
    console.error("No hay transactionId para actualizar");
    return;
  }

  if (!completedStatusId) {
    console.error("No se encontró el status 'completed' en statuses");
    setSnack({
      open: true,
      msg: "No se pudo obtener el status 'completed'. Intenta recargar la página.",
    });
    return;
  }

  try {
    const res = await updateTransactionStatusService(
      transaction._id,
      completedStatusId // 👈 ahora viene de la BD
    );

    console.log("Transacción actualizada:", res);

    // Aquí puedes decidir si usar "paid" o "completed" para tu estado local
    setLocalStatus("paid");

    setSnack({
      open: true,
      msg: `Pago de ${transaction.wallet_id.user_id.name} aceptado.`,
    });
    closeConfirm();
    navigate(-1);
  } catch (error) {
    console.error("Error actualizando status:", error);
    setSnack({ open: true, msg: "Error al actualizar la transacción" });
  }
};


const rejectedStatusId = React.useMemo(() => {
  const status = statuses.find((s) => s.name === "rejected");
  return status?._id || null;
}, [statuses]);

  const doCancelPayment = async () => {
    if (!transaction || !transaction._id) {
      console.error("No hay transactionId para actualizar");
      return;
    }

    try {
      const res = await updateTransactionStatusService(
        transaction._id,
        rejectedStatusId // ID de status "rejected"
      );

      console.log("Transacción actualizada:", res);
      setLocalStatus("rejected");
      setSnack({
        open: true,
        msg: `Pago de ${transaction.wallet_id.user_id.name} cancelado.`,
      });
      closeConfirm();
      navigate(-1);
    } catch (error) {
      console.error("Error cancelando pago:", error);
      setSnack({ open: true, msg: "Error al cancelar el pago" });
    }
  };

  // const metadata = transaction?.metadata;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Detalle del comprador
        </Typography>
        <Button size="small" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {/* Datos del usuario */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between" // 👈 separa izquierda / derecha
        >
          {/* IZQUIERDA: nombre + correo */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {transaction?.wallet_id?.user_id?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {transaction?.wallet_id?.user_id?.email}
            </Typography>
          </Stack>

          {/* DERECHA: status */}
          <Chip
            size="small"
            label={`Estado: ${localStatus}`}
            color={statusColor}
            sx={{ ml: 2 }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Fecha + estado */}


        <Typography variant="subtitle2" sx={{ mb: 1.5, textAlign: "center" }} fontWeight={700}>
          Detalles del pago móvil
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          sx={{ mb: 2 }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Fecha de solicitud
            </Typography>
            <Typography>{transaction?.metadata?.paidAt}</Typography>
          </Stack>


        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ md: "flex-start" }}
        >
          {/* Columna de texto */}
          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 260 }}>
            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Banco
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.bank_name}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Monto ({transaction?.currency_id?.symbol ?? "Bs"})
              </Typography>
              <Typography fontWeight={600}>
                {formatBs(Number(transaction?.amount?.$numberDecimal ?? 0))}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Teléfono (Pago móvil)
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.phone_number}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Cédula / Documento
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.document_number}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                N° de referencia
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.refCode}
                {transaction?.admin_code }
              </Typography>
            </Stack>
          </Stack>

          {/* Comprobante */}
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
              {transaction?.metadata?.voucherPreview ? (
                <Box
                  component="img"
                  src={transaction?.metadata.voucherPreview || undefined}
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3 }}
        >
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
        </Stack>
      </Paper>

      {/* Diálogo aceptar */}
      <Dialog open={confirm === "accept"} onClose={closeConfirm}>
        <DialogTitle>Confirmar aceptación</DialogTitle>
        <DialogContent>
          ¿Confirmas que el pago de{" "}
          <b>{transaction?.wallet_id?.user_id?.name}</b> es válido?
          <br />
          Banco: <b>{transaction?.metadata?.bank_name}</b> — Monto:{" "}
          <b>
            {transaction?.currency_id?.symbol ?? "Bs"}{" "}
            {/* {formatBs(transaction?.amount?.$numberDecimal ?? 0)} */}
          </b>
          <br />
          Ref: <b>{transaction?.metadata?.refCode}</b>
              <b>{transaction?.admin_code}</b>
         
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doAccept}>
            Aceptar pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo cancelar */}
      <Dialog open={confirm === "cancel"} onClose={closeConfirm}>
        <DialogTitle>Confirmar cancelación</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas <b>cancelar</b> el pago de{" "}
          <b>{transaction?.wallet_id?.user_id?.name}</b>?
          <br />
          Ref: <b>{transaction?.metadata?.refCode}</b>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>No</Button>
          <Button
            variant="contained"
            color="error"
            onClick={doCancelPayment}
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false, msg: "" })}
        autoHideDuration={3000}
        message={snack.msg}
      />
    </Container>
  );
}


