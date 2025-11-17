// src/Pages/RoomDetails.tsx
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomById, type ApiRoom, type ApiDecimal } from "../Services/rooms.service";

const toNum = (d?: ApiDecimal) => {
  if (!d || typeof d.$numberDecimal !== "string") return undefined;
  const n = Number(d.$numberDecimal);
  return Number.isFinite(n) ? n : undefined;
};

const formatMoney = (n: number, currency: "USD" | "VES" = "USD") =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "VES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const statusChipFromBackend = (s?: ApiRoom["status"]) => {
  const map: Record<string, { label: string; color: "default" | "success" | "warning" | "info" }> = {
    waiting_players: { label: "Esperando jugadores", color: "info" },
    preparing:      { label: "Preparando",           color: "warning" },
    in_progress:    { label: "En progreso",          color: "success" },
    finished:       { label: "Finalizada",           color: "default" },
  };
  const m = s ? map[s] : undefined;
  return <Chip size="small" label={m?.label ?? "—"} color={m?.color ?? "default"} />;
};

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = React.useState<ApiRoom | null>(null);
  console.log('room', room)
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getRoomById(id);
        setRoom(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || err.message || "Error al cargar la sala");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const price = toNum(room?.price_per_card);
  const totalPot = toNum(room?.total_pot);
  const adminFee = toNum(room?.admin_fee);
  const playersCount = room?.players?.length ?? 0;
  const rewardsCount = room?.rewards?.length ?? 0;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Detalle de la sala
        </Typography>
        <Button size="small" onClick={() => navigate(-1)}>Volver</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {loading && <LinearProgress />}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {!loading && !error && room && (
          <>
            {/* Header */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={800}>{room.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {room._id}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {statusChipFromBackend(room.status)}
                {/* Si en el futuro quieres tu propio status (abierta/programada/cerrada), lo montas aquí */}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Datos generales */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Datos generales
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Mín. jugadores</Typography>
                <Typography fontWeight={600}>{room.min_players ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Máx. rondas</Typography>
                <Typography fontWeight={600}>{room.max_rounds ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Inicio</Typography>
                <Typography fontWeight={600}>
                  {room.starts_at ? new Date(room.starts_at).toLocaleString() : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Creada</Typography>
                <Typography fontWeight={600}>
                  {room.created_at ? new Date(room.created_at).toLocaleString() : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Actualizada</Typography>
                <Typography fontWeight={600}>
                  {room.updated_at ? new Date(room.updated_at).toLocaleString() : "—"}
                </Typography>
              </Box>
            </Stack>

            {/* Economía */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Economía
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Precio por cartón</Typography>
                <Typography fontWeight={600}>{typeof price === "number" ? formatMoney(price, "USD") : "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Bote total</Typography>
                <Typography fontWeight={600}>{typeof totalPot === "number" ? formatMoney(totalPot, "USD") : "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Comisión admin</Typography>
                <Typography fontWeight={600}>
                  {typeof adminFee === "number" ? `${adminFee}%` : "—"}
                </Typography>
              </Box>
            </Stack>

            {/* Jugadores / Recompensas */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Jugadores & Recompensas
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">Jugadores</Typography>
                <Typography fontWeight={600}>{playersCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Recompensas configuradas</Typography>
                <Typography fontWeight={600}>{rewardsCount}</Typography>
              </Box>
              {/* Si en el back agregan capacity, vendidos, etc., puedes mostrarlos aquí */}
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
}
