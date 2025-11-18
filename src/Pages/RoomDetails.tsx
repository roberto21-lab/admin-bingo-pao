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
import {
  getRoomById,
  type ApiRoom,
  type ApiDecimal,
} from "../Services/rooms.service";

// acepta number o ApiDecimal
const toNumFlexible = (v?: number | ApiDecimal | null): number | undefined => {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (!v) return undefined;
  const anyV = v as any;
  if (typeof anyV.$numberDecimal === "string") {
    const n = Number(anyV.$numberDecimal);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const formatMoney = (n: number, currencyCode: string = "USD") =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// status del backend (scheduled, waiting_players, etc.)
const statusChipFromBackend = (s?: string) => {
  const map: Record<
    string,
    { label: string; color: "default" | "success" | "warning" | "info" }
  > = {
    waiting_players: { label: "Esperando jugadores", color: "info" },
    scheduled: { label: "Programada", color: "warning" },
    preparing: { label: "Preparando", color: "warning" },
    in_progress: { label: "En progreso", color: "success" },
    finished: { label: "Finalizada", color: "default" },
  };

  const m = s ? map[s] : undefined;
  return (
    <Chip
      size="small"
      label={m?.label ?? s ?? "—"}
      color={m?.color ?? "default"}
    />
  );
};

// resuelve el código de moneda para Intl y una etiqueta amigable
const resolveCurrency = (room: ApiRoom | null): { code: string; label: string } => {
  const anyRoom = room as any;

  // si viene como "currency": "Bs" | "USD"
  if (typeof anyRoom?.currency === "string") {
    if (anyRoom.currency === "Bs") return { code: "VES", label: "Bs" };
    if (anyRoom.currency === "USD") return { code: "USD", label: "USD" };
    return { code: anyRoom.currency, label: anyRoom.currency };
  }

  // si viene poblado currency_id
  if (anyRoom?.currency_id?.code) {
    return {
      code: anyRoom.currency_id.code,
      label: anyRoom.currency_id.symbol || anyRoom.currency_id.code,
    };
  }

  // fallback
  return { code: "USD", label: "USD" };
};

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = React.useState<ApiRoom | null>(null);
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
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Error al cargar la sala"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // valores numéricos
  const price = toNumFlexible((room as any)?.price_per_card);
  const totalPot = toNumFlexible((room as any)?.total_pot);
  const adminFeeAmount = toNumFlexible((room as any)?.admin_fee);
  const totalPrize = toNumFlexible((room as any)?.total_prize); // 💰 tu campo nuevo

  const playersCount = room?.players?.length ?? 0;
  const rewardsCount = room?.rewards?.length ?? 0;

  // moneda
  const { code: currencyCode, label: currencyLabel } = resolveCurrency(room);

  // rounds con prize_amount
  const rounds = ((room as any)?.rounds ?? []) as Array<{
    round: number;
    pattern: string;
    percent: number;
    prize_amount?: number | ApiDecimal;
  }>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Detalle de la sala
        </Typography>
        <Button size="small" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        {loading && <LinearProgress />}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && room && (
          <>
            {/* Header */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5}>
                <Typography variant="h5" fontWeight={800}>
                  {room.name}
                </Typography>
                {/* <Typography variant="caption" color="text.secondary">
                  ID: {(room as any)._id}
                </Typography> */}
                {/* {room.description && (
                  <Typography variant="body2" color="text.secondary">
                    {room.description}
                  </Typography>
                )} */}
                <Typography variant="caption" color="text.secondary">
                  Visibilidad:{" "}
                  <strong>
                    {(room as any).is_public ? "Pública" : "Privada"}
                  </strong>
                </Typography>
                {(room as any).scheduled_at && (
                  <Typography variant="caption" color="text.secondary">
                    Programada para:{" "}
                    {new Date((room as any).scheduled_at).toLocaleString()}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {statusChipFromBackend((room as any).status)}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Datos generales */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Datos generales
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mín. jugadores
                </Typography>
                <Typography fontWeight={600}>
                  {room.min_players ?? "—"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Máx. rondas
                </Typography>
                <Typography fontWeight={600}>
                  {room.max_rounds ?? "—"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Moneda
                </Typography>
                <Typography fontWeight={600}>{currencyLabel}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Creada
                </Typography>
                <Typography fontWeight={600}>
                  {room.created_at
                    ? new Date(room.created_at).toLocaleString()
                    : "—"}
                </Typography>
              </Box>
            </Stack>

            {/* Economía */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Economía
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Precio por cartón
                </Typography>
                <Typography fontWeight={600}>
                  {typeof price === "number"
                    ? formatMoney(price, currencyCode)
                    : "—"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bote total (back)
                </Typography>
                <Typography fontWeight={600}>
                  {typeof totalPot === "number"
                    ? formatMoney(totalPot, currencyCode)
                    : "—"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Premio total a repartir
                </Typography>
                <Typography fontWeight={600}>
                  {typeof totalPrize === "number"
                    ? formatMoney(totalPrize, currencyCode)
                    : "—"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Comisión admin (monto)
                </Typography>
                <Typography fontWeight={600}>
                  {typeof adminFeeAmount === "number"
                    ? formatMoney(adminFeeAmount, currencyCode)
                    : "—"}
                </Typography>
              </Box>
            </Stack>

            {/* Rondas / Premios */}
            {rounds.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  sx={{ mb: 1 }}
                >
                  Rondas & Premios
                </Typography>

                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {rounds.map((r) => {
                    const prizeAmount = toNumFlexible(r.prize_amount);
                    return (
                      <Box
                        key={r.round}
                        sx={{
                          borderRadius: 1,
                          border: (t) => `1px solid ${t.palette.divider}`,
                          p: 1.5,
                        }}
                      >
                        <Typography fontWeight={700}>
                          Ronda {r.round} — {r.pattern} ({r.percent}%)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Premio estimado:{" "}
                          {typeof prizeAmount === "number"
                            ? formatMoney(prizeAmount, currencyCode)
                            : "—"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}

            {/* Jugadores / Recompensas */}
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Jugadores & Recompensas
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Jugadores
                </Typography>
                <Typography fontWeight={600}>{playersCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Recompensas configuradas
                </Typography>
                <Typography fontWeight={600}>{rewardsCount}</Typography>
              </Box>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
}
