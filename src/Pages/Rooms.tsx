// src/pages/Rooms.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";

import { getRooms, type ApiDecimal, type ApiRoom } from "../Services/rooms.service";

type RoomRow = {
  id: string;
  name: string;
  ticketPrice?: number;
  currencySymbol?: string;
  capacity?: number;
  sold: number;
  startsAt?: string;
  backendStatus?: ApiRoom["status"];
  isPublic?: boolean;
};

export default function Rooms() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<RoomRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  type MaybeDecimal = ApiDecimal | number | undefined | null;

  const toNum = (value?: MaybeDecimal) => {
    if (typeof value === "number") return value;
    if (!value || typeof value.$numberDecimal !== "string") return undefined;

    const n = Number(value.$numberDecimal);
    return Number.isFinite(n) ? n : undefined;
  };

  // 🔥 MAPPER TOTALMENTE CORREGIDO
  const mapToUI = (r: ApiRoom): RoomRow => {
    return {
      id: r.id,
      name: r.name,
      ticketPrice: toNum(r.price_per_card as any),
      currencySymbol: r.currency_id?.symbol ?? "Bs",
      capacity: typeof r.min_players === "number" ? r.min_players : undefined,
      sold: Array.isArray(r.players) ? r.players.length : 0,
      // startsAt: r.scheduled_at || r.created_at,
      backendStatus: r.status,
      isPublic: r.is_public,
    };
  };

  const statusChipFromBackend = (s?: ApiRoom["status"]) => {
    const map: Record<
      string,
      { label: string; color: "default" | "success" | "warning" | "info" }
    > = {
      waiting_players: { label: "Esperando jugadores", color: "info" },
      preparing: { label: "Preparando", color: "warning" },
      in_progress: { label: "En progreso", color: "success" },
      finished: { label: "Finalizada", color: "default" },
    };

    const m = s ? map[s] : undefined;

    return (
      <Chip
        size="small"
        label={m?.label ?? "—"}
        color={m?.color ?? "default"}
      />
    );
  };

  const onView = (r: RoomRow) => {
    console.log("🚀 ~ onView ~ r:", r);
    navigate(`/room-details/${r.id}`)};

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getRooms();
        console.log("🚀 ~ Rooms ~ data:", data)
        setRows((data as ApiRoom[]).map(mapToUI));
      } catch (err: any) {
        console.error("Error al obtener salas:", err);
        setError(err?.response?.data?.message || err.message || "Error al obtener salas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Salas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {rows.length}
        </Typography>
      </Stack>

      <Paper variant="outlined">
        {loading && <LinearProgress />}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sala</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Precio
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} width={320}>
                  Vendidos / Disponibles
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Inicio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    (Sin salas)
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  console.log("🚀 ~ Rooms ~ r:", r);
                  const sold = r.sold;
                  const hasCapacity = typeof r.capacity === "number";
                  const remaining = hasCapacity ? (r.capacity! - sold) : undefined;
                  const pct = hasCapacity ? Math.round((sold / r.capacity!) * 100) : undefined;

                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography fontWeight={700}>{r.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.isPublic ? "Pública" : "Privada"} — Capacidad: {r.capacity}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        {typeof r.ticketPrice === "number"
                          ? `${r.currencySymbol}${formatMoney(r.ticketPrice)}`
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              Vendidos: <b>{sold}</b>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Disponibles: <b>{remaining ?? "—"}</b>
                            </Typography>
                          </Stack>

                          {hasCapacity ? (
                            <>
                              <LinearProgress variant="determinate" value={pct!} />
                              <Typography variant="caption" color="text.secondary">
                                {pct}% vendido
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              (Capacidad no definida)
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {r.startsAt ? new Date(r.startsAt).toLocaleString() : "—"}
                      </TableCell>

                      <TableCell>{statusChipFromBackend(r.backendStatus)}</TableCell>

                      <TableCell align="right">
                        <IconButton size="small" onClick={() => onView(r)} aria-label="ver">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
