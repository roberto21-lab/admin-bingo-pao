import {
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
import { getTransactionByIdService, updateTransactionStatusService, getTransactionStatusesService } from "../Services/transactionService";

type PurchaseStatus = "pending" | "completed" | "rejected";


type WalletUser = {
  _id: string;
  name: string;
  email: string;
};

type Wallet = {
  _id: string;
  user_id: WalletUser;
  currency_id: {
    _id: string;
    code: string;
    name: string;
    symbol: string; // "Bs"
    is_active: boolean;
    roles: string[];
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
};

type TransactionDetail = {
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
  currency_id: Wallet["currency_id"];
  status_id: {
    _id: string;
    name: PurchaseStatus; 
    category: string;
    created_at: string;
    updated_at: string;
  };
  metadata: {
    refCode: string;
    bankName: string;
    payerDocType: "V" | "E";
    payerDocId: string;
    payerPhone: string;
    amount: string;      
    paidAt: string;      
    notes: string;
    voucherPreview: string | null;
    voucherFile: File | Blob | string | null;
  };
  created_at: string;
  updatedAt: string;
};

export default function UserPurchaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = React.useState<TransactionDetail | null>(null);
  const [localStatus, setLocalStatus] = React.useState<PurchaseStatus>("pending");
  const [confirm, setConfirm] = React.useState<"accept" | "cancel" | null>(null);
  const [snack, setSnack] = React.useState({ open: false, msg: "" });
  const [transactionStatuses, setTransactionStatuses] = React.useState<Array<{ _id: string; name: string; category: string }>>([]);
  const navigate = useNavigate();

  // Obtener los status de transactions al cargar
  React.useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getTransactionStatusesService();
        setTransactionStatuses(statuses);
        console.log("📋 Status de transactions obtenidos:", statuses);
      } catch (error) {
        console.error("Error obteniendo status de transactions:", error);
      }
    };

    void fetchStatuses();
  }, []);

  React.useEffect(() => {
    if (!id) return;

    const fetchTx = async () => {
      const data = await getTransactionByIdService(id);
      console.log("🚀 ~ fetchTx ~ data:", data);
      setTransaction(data as unknown as TransactionDetail);
      if (data?.status_id?.name) {
        setLocalStatus(data.status_id.name as PurchaseStatus);
      }
    };

    void fetchTx();
  }, [id]);

  const statusColor: "success" | "warning" | "default" | "error" =
    localStatus === "completed" ? "success" : localStatus === "pending" ? "warning" : localStatus === "rejected" ? "error" : "default";

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

  const doAccept = async () => {
    if (!transaction) return;
    if (!transaction?._id) {
      console.error("No hay transactionId para actualizar");
      return;
    }

    // Buscar el status "completed"
    const completedStatus = transactionStatuses.find(s => s.name.toLowerCase() === "completed");
    if (!completedStatus) {
      console.error("Status 'completed' no encontrado");
      setSnack({ open: true, msg: "Error: Status 'completed' no encontrado. Ejecute 'npm run seed' en el backend." });
      return;
    }

    try {
      const res = await updateTransactionStatusService(
        transaction._id,                         
        completedStatus._id
      );

      console.log("🚀 ~ doAccept ~ res:", res);
      setLocalStatus("completed");
      setSnack({ open: true, msg: `Pago de ${transaction.wallet_id.user_id.name} aceptado.` });
      closeConfirm();
      navigate(-1);
    } catch (error) {
      console.error("Error actualizando status:", error);
      setSnack({ open: true, msg: "Error al actualizar la transacción" });
      return;
    }
  };

  const doCancelPayment = async () => {
    if (!transaction) return;
    if (!transaction?._id) {
      console.error("No hay transactionId para actualizar");
      return;
    }

    // Buscar el status "rejected"
    const rejectedStatus = transactionStatuses.find(s => s.name.toLowerCase() === "rejected");
    if (!rejectedStatus) {
      console.error("Status 'rejected' no encontrado");
      setSnack({ open: true, msg: "Error: Status 'rejected' no encontrado. Ejecute 'npm run seed' en el backend." });
      return;
    }

    try {
      const res = await updateTransactionStatusService(
        transaction._id,                          
        rejectedStatus._id
      );

      console.log("Transacción actualizada:", res.transaction);
      console.log("Wallet recalculada:", res.wallet);
      setLocalStatus("rejected");
      setSnack({ open: true, msg: `Pago de ${transaction.wallet_id.user_id.name} cancelado.` });
      closeConfirm();
      navigate(-1);
    } catch (error) {
      console.error("Error cancelando pago:", error);
      setSnack({ open: true, msg: "Error al cancelar el pago" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
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
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {transaction?.wallet_id?.user_id?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {transaction?.wallet_id?.user_id?.email}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip size="small" label={`Estado: ${localStatus}`} color={statusColor} />
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

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

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Estado
            </Typography>
            <Typography sx={{ textTransform: "capitalize" }}>
              {transaction?.status_id?.name}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1.5 }} fontWeight={700}>
          Detalles del pago móvil
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ md: "flex-start" }}
        >
          <Stack spacing={1.25} sx={{ flex: 1, minWidth: 260 }}>
            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Banco
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.bankName}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Monto ({transaction?.currency_id?.symbol ?? "Bs"})
              </Typography>
              <Typography fontWeight={600}>
                {formatBs(
                  Number(transaction?.metadata?.amount ?? "0")
                )}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Teléfono (Pago móvil)
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.payerPhone}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                Cédula
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.payerDocType}
                {"-"}
                {transaction?.metadata?.payerDocId}
              </Typography>
            </Stack>

            <Stack spacing={0.3}>
              <Typography variant="caption" color="text.secondary">
                N° de referencia
              </Typography>
              <Typography fontWeight={600}>
                {transaction?.metadata?.refCode}
              </Typography>
            </Stack>
          </Stack>

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
                  src={transaction.metadata.voucherPreview || undefined}
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

      <Dialog open={confirm === "accept"} onClose={closeConfirm}>
        <DialogTitle>Confirmar aceptación</DialogTitle>
        <DialogContent>
          ¿Confirmas que el pago de{" "}
          <b>{transaction?.wallet_id?.user_id?.name}</b> es válido?
          <br />
          Banco: <b>{transaction?.metadata?.bankName}</b> — Monto:{" "}
          <b>
            {transaction?.currency_id?.symbol ?? "Bs"}{" "}
            {formatBs(
              Number(transaction?.metadata?.amount ?? "0")
            )}
          </b>
          <br />
          Ref: <b>{transaction?.metadata?.refCode}</b>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancelar</Button>
          <Button variant="contained" onClick={doAccept}>
            Aceptar pago
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false, msg: "" })}
        autoHideDuration={3000}
        message={snack.msg}
      />
    </Container>
  );
}

