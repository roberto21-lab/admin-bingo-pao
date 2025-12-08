// src/Pages/ContactFormDetail.tsx
import * as React from "react";
import {
  Alert,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  getContactFormById,
  type ContactFormDetail as ContactFormFromApi,
} from "../Services/contactForms.service";

type ContactFormStatus = "pending" | "answered" | "in_progress";

// lo que usamos en el front (extendemos por si luego agregas created_at)
type ContactForm = ContactFormFromApi & {
  created_at?: string;
};

export default function ContactFormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = React.useState<ContactForm | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  React.useEffect(() => {
    const fetchForm = async () => {
      if (!id) {
        setError("ID de formulario inválido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 🔹 Llamamos al backend real
        const data = await getContactFormById(id);

        // data tiene: _id, title, email, description, status, user_id
        // si en el futuro el back devuelve created_at, caerá aquí también
        setForm(data);
      } catch (err: any) {
        console.error(err);
        setError("Error al obtener el formulario");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const getStatusChip = (status: ContactFormStatus) => {
    let label = "";
    let color: "default" | "success" | "warning" | "info" = "default";

    switch (status) {
      case "pending":
        label = "Pendiente";
        color = "warning";
        break;
      case "answered":
        label = "Respondido";
        color = "success";
        break;
      case "in_progress":
        label = "En proceso";
        color = "info";
        break;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  const handleMarkAsAnswered = () => {
    if (!form) return;
    // 🔹 Aquí luego harás PATCH al backend para cambiar status
    setForm({ ...form, status: "answered" });
    setSnackbar({
      open: true,
      message: "Formulario marcado como respondido (mock)",
      severity: "success",
    });
  };

  const handleNotifyUser = () => {
    if (!form) return;
    // 🔹 Aquí luego llamarás al endpoint real de notificación
    console.log("Enviar notificación al usuario:", form.email);
    setSnackbar({
      open: true,
      message: "Notificación enviada al usuario (mock)",
      severity: "info",
    });
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
        spacing={1.5}
      >
        <Typography variant="h6" fontWeight={800}>
          Detalle del formulario de contacto
        </Typography>

        <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && form && (
          <>
            <Stack spacing={1.5}>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  Correo:
                </Typography>
                <Typography variant="body2">{form.email}</Typography>
              </Stack>

              {/* Si el backend está populando user_id, lo mostramos */}
              {form.user_id && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuario:
                  </Typography>
                  <Typography variant="body2">
                    {form.user_id.name} ({form.user_id.email})
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  Estado:
                </Typography>
                {getStatusChip(form.status as ContactFormStatus)}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha:
                </Typography>
                <Typography variant="body2">
                  {formatDate(form.created_at)}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Título
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {form.title}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {form.description}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleMarkAsAnswered}
                disabled={form.status === "answered"}
              >
                Cambio de status
              </Button>
              <Button variant="outlined" onClick={handleNotifyUser}>
                Enviar notificación al usuario
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
