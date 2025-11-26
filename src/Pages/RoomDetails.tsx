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
  const decimalV = v as { $numberDecimal?: string } | null | undefined;
  if (decimalV && typeof decimalV.$numberDecimal === "string") {
    const n = Number(decimalV.$numberDecimal);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

// Función helper para normalizar VES a Bs
const normalizeCurrency = (currencyCode?: string | null): string => {
  if (!currencyCode) return "Bs";
  const normalized = currencyCode.toLowerCase().trim();
  return normalized === "ves" ? "Bs" : currencyCode;
};

const formatMoney = (n: number, currencyCode: string = "Bs"): string => {
  // Normalizar VES a Bs
  const normalizedCode = normalizeCurrency(currencyCode);
  
  // Si es Bs, usar formato personalizado
  if (normalizedCode === "Bs") {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " Bs";
  }
  
  // Para otras monedas (USD, etc.), usar formato de currency estándar
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: normalizedCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

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
  if (!room) return { code: "Bs", label: "Bs" };
  
  const anyRoom = room as Record<string, unknown>;

  // si viene como "currency": "Bs" | "USD"
  if (typeof anyRoom?.currency === "string") {
    const normalized = normalizeCurrency(anyRoom.currency);
    if (normalized === "Bs") return { code: "Bs", label: "Bs" };
    if (normalized === "USD") return { code: "USD", label: "USD" };
    return { code: normalized, label: normalized };
  }

  // si viene poblado currency_id
  const currencyId = anyRoom?.currency_id;
  if (currencyId && typeof currencyId === "object" && currencyId !== null) {
    const currencyObj = currencyId as Record<string, unknown>;
    if (typeof currencyObj.code === "string") {
      const normalizedCode = normalizeCurrency(currencyObj.code);
      const symbolOrCode = typeof currencyObj.symbol === "string" ? currencyObj.symbol : currencyObj.code;
      const normalizedLabel = normalizeCurrency(symbolOrCode);
      return {
        code: normalizedCode,
        label: normalizedLabel,
      };
    }
  }

  // fallback
  return { code: "Bs", label: "Bs" };
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
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la sala";
        const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(responseMessage || errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // valores numéricos
  const roomData = room as Record<string, unknown> | null;
  const price = toNumFlexible(roomData?.price_per_card as number | ApiDecimal | null | undefined);
  const totalPot = toNumFlexible(roomData?.total_pot as number | ApiDecimal | null | undefined);
  const adminFeeAmount = toNumFlexible(roomData?.admin_fee as number | ApiDecimal | null | undefined);

  // rounds con prize_amount
  type RoundReward = {
    amount?: number | ApiDecimal;
    pattern?: string;
    percent?: number;
  };

  const rounds = ((roomData?.rounds ?? []) as Array<{
    round_number: React.Key | null | undefined;
    reward?: RoundReward;
    round: number;
    pattern: string;
    percent: number;
    prize_amount?: number | ApiDecimal;
  }>);

  const totalPrizeFromBackend = toNumFlexible(roomData?.total_prize as number | ApiDecimal | null | undefined);

  const totalPrize =
    typeof totalPrizeFromBackend === "number"
      ? totalPrizeFromBackend
      : rounds.reduce((acc, r) => {
          const amount = toNumFlexible(r.prize_amount as number | ApiDecimal | undefined);
          return acc + (typeof amount === "number" ? amount : 0);
        }, 0);

  const playersCount = room?.players?.length ?? 0;
  const rewardsCount = room?.rewards?.length ?? 0;

  // moneda
  const { code: currencyCode, label: currencyLabel } = resolveCurrency(room);

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
             
                <Typography variant="caption" color="text.secondary">
                  Visibilidad:{" "}
                  <strong>
                    {roomData?.is_public ? "Pública" : "Privada"}
                  </strong>
                </Typography>
                {(() => {
                  const scheduledAt = roomData?.scheduled_at;
                  if (scheduledAt && typeof scheduledAt === "string") {
                    return (
                      <Typography variant="caption" color="text.secondary">
                        Programada para: {new Date(scheduledAt).toLocaleString()}
                      </Typography>
                    );
                  }
                  return null;
                })()}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {statusChipFromBackend(roomData?.status as string | undefined)}
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

{rounds.length > 0 && (
  <>
    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
      Rondas & Premios
    </Typography>

    <Stack spacing={1.5} sx={{ mb: 2 }}>
      {rounds.map((r) => {
        const prizeAmount = toNumFlexible(r.reward?.amount as number | ApiDecimal | undefined);

        return (
          <Box
            key={r.round_number}
            sx={{
              borderRadius: 1,
              border: (theme: { palette: { divider: string } }) => `1px solid ${theme.palette.divider}`,
              p: 1.5,
            }}
          >
            <Typography fontWeight={700}>
              Ronda {r.round_number} — {r.reward?.pattern} ({r.reward?.percent}
              %)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Premio:{" "}
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
