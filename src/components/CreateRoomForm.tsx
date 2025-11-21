import * as React from "react";
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Alert, Stack, InputAdornment, FormControlLabel, Switch,
  FormLabel, Button
} from "@mui/material";

// 👇 importa tu servicio
import { createRoom } from "../Services/rooms.service"; // ajusta el path real
import { useNavigate } from "react-router-dom";

type PrizeModel = "percent" | "fixed";
type PriceMode = "autoFromPrize" | "manual";

type Pattern =
  | "random"
  | "horizontal"
  | "vertical"
  | "diagonal"
  | "cross_small"
  | "cross_big"
  | "full";

const PATTERN_LABELS: Record<Pattern, string> = {
  random: "Aleatorio",
  horizontal: "Horizontal",
  vertical: "Vertical",
  diagonal: "Diagonal",
  cross_small: "Cruz pequeña",
  cross_big: "Cruz grande",
  full: "Full (cartón lleno)",
};

type RoundConfig = { pattern: Pattern; percent: number };

const DEFAULT_ROUNDS: RoundConfig[] = [
  { pattern: "horizontal", percent: 30 },
  { pattern: "vertical", percent: 30 },
  { pattern: "full", percent: 40 },
];

type State = {
  status: "waiting_players" | "in_progress" | "completed";
  name: string;
  currency: "Bs" | "USD"; // 👈 solo visual, el back usa currency_id
  ticketPrice: number;
  minTicketsToStart: number;
  // maxTickets?: number | "";
  // maxPerPlayer?: number | "";
  commission: number; // % para la casa en el preview (el back ahora usa fijo 10%)
  prizeModel: PrizeModel;
  priceMode: PriceMode;
  scheduledAt?: string;
  isPublic: boolean;
  description?: string;

  rounds: RoundConfig[];
  ticketsPreview: number;
};

type CreateRoomPayload = {
  status: "waiting_players" | "in_progress" | "completed";
  name: string;
  price_per_card: number;
  min_players: number;
  max_rounds: number;
  currency_id: string;
  description?: string | null;
  // new optional fields supported by the API payload
  is_public?: boolean;
  scheduled_at?: string | null;

  // optional fields that the frontend may compute and send
  total_prize?: number;
  currency?: "Bs" | "USD";

  rounds: Array<{
    round: number;
    pattern: Pattern;
    percent: number;
    prize_amount?: number;
  }>;
};

const DEFAULT_CURRENCY_ID = "691b47f1b0a2446494b164fc";

export default function CrearSalaFormFlex() {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [state, setState] = React.useState<State>({
    status: "in_progress",
    name: "",
    currency: "Bs",
    ticketPrice: 1,
    minTicketsToStart: 10,
    // maxTickets: "",
    // maxPerPlayer: "",
    commission: 10,
    prizeModel: "percent",
    priceMode: "manual",
    scheduledAt: "",
    isPublic: true,
    description: "",
    rounds: DEFAULT_ROUNDS,
    ticketsPreview: 100,
  });

  const handleChange = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const handleRoundChange = (idx: number, patch: Partial<RoundConfig>) =>
    setState((s) => {
      const rounds = s.rounds.map((r, i) => (i === idx ? { ...r, ...patch } : r));
      return { ...s, rounds };
    });

  // 👉 ahora el back exige que la suma sea 100%
  const roundsSum = state.rounds.reduce(
    (acc, r) => acc + (Number(r.percent) || 0),
    0
  );
  const percentToWinners = 100;
  const roundsValid = roundsSum === percentToWinners;

  const potPreview =
    (Number(state.ticketsPreview) || 0) * (Number(state.ticketPrice) || 0);
  const houseCut = (potPreview * state.commission) / 100;
  const potForWinners = potPreview - houseCut;

  const currencySymbol = state.currency === "USD" ? "$" : "Bs";
  const PERCENT_OPTIONS = Array.from({ length: 21 }, (_, i) => i * 5);

  // const buildPayload = (): CreateRoomPayload => {
  //   return {
  //     status: "scheduled",
  //     name: state.name.trim(),
  //     price_per_card: Number(state.ticketPrice) || 0,
  //     min_players: Number(state.minTicketsToStart) || 0,
  //     max_rounds: state.rounds.length,
  //     currency_id: DEFAULT_CURRENCY_ID,
  //     description: state.description?.trim() || null,
  //     rounds: state.rounds.map((r, i) => ({
  //       round: i + 1,
  //       pattern: r.pattern,
  //       percent: Number(r.percent) || 0,
  //     })),
  //   };
  // };

  const buildPayload = (): CreateRoomPayload => {
    const minPlayers = Number(state.minTicketsToStart) || 0;
    const pricePerCard = Number(state.ticketPrice) || 0;
    const commissionPercent = Number(state.commission) || 0;

    // bote base usando el mínimo de cartones
    const basePot = minPlayers * pricePerCard;

    // bote para premios (después de comisión de la sala)
    const prizePool = basePot * (1 - commissionPercent / 100);

    // Convertimos la fecha a ISO o la dejamos en null si no hay
    const scheduledAtIso =
      state.scheduledAt && state.scheduledAt.trim() !== ""
        ? new Date(state.scheduledAt).toISOString()
        : null; // si el backend no acepta null, aquí podemos omitir el campo

    return {
      // 👇 igual que el ejemplo del backend
      status: "waiting_players",
      name: state.name.trim(),
      price_per_card: pricePerCard,
      min_players: minPlayers,
      max_rounds: state.rounds.length,
      currency_id: "691cbf660d374a9d0bb4cdc9",
      description: state.description?.trim() || "Sala sin descripción",
      is_public: state.isPublic,

      // 🕒 fecha en formato ISO (o null)
      scheduled_at: scheduledAtIso,

      // 💰 total de premio a repartir
      total_prize: Number(prizePool.toFixed(2)),

      // ❌ IMPORTANTE: quitamos `currency`, el backend no lo espera
      // currency: state.currency,  // ⬅️ ELIMINADO

      rounds: state.rounds.map((r, i) => {
        const percent = Number(r.percent) || 0;
        const prizeAmount = prizePool * (percent / 100);

        return {
          round: i + 1,                // 1, 2, 3...
          pattern: r.pattern,          // "horizontal" | "vertical" | "diagonal" | etc.
          percent,                     // número
          prize_amount: Number(prizeAmount.toFixed(2)), // número
        };
      }),
    };
  };

  const navigate = useNavigate();

  const resetForm = () => {
    setState({
      status: "in_progress",
      name: "",
      currency: "Bs",
      ticketPrice: 1,
      minTicketsToStart: 10,
      // maxTickets: "",
      // maxPerPlayer: "",
      commission: 10,
      prizeModel: "percent",
      priceMode: "manual",
      scheduledAt: "",
      isPublic: true,
      description: "",
      rounds: DEFAULT_ROUNDS,
      ticketsPreview: 100,
    });
    setError(null);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roundsValid) {
      setError(
        `La suma de % de rondas debe ser 100% (actual: ${roundsSum}%).`
      );
      return;
    }

    if (!state.name.trim()) {
      setError("El nombre de la sala es obligatorio.");
      return;
    }

    if (!state.ticketPrice || state.ticketPrice <= 0) {
      setError("El precio del cartón debe ser mayor a 0.");
      return;
    }

    if (!state.minTicketsToStart || state.minTicketsToStart <= 0) {
      setError("El mínimo de cartones para iniciar debe ser mayor a 0.");
      return;
    }

    setError(null);
    setLoading(true);

    const payload = buildPayload();
    console.log("🚀 Payload a enviar (crear sala):", payload);

    try {
      const res = await createRoom(payload);
      console.log("✅ Sala creada:", res);
      navigate('/rooms');
      // aqui debo limpiar el formulario o redirigir
      resetForm();

      // aquí puedes: resetear formulario, navegar, mostrar snackbar, etc.
    } catch (err: any) {
      console.error("Error creando sala:", err);
      const msg =
        err?.response?.data?.message ||
        "Error al crear la sala. Intente nuevamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  const minTickets = Number(state.minTicketsToStart) || 0;
  const ticketPrice = Number(state.ticketPrice) || 0;

  const basePot = minTickets * ticketPrice;

  const commissionPercent = Number(state.commission) || 0;

  const prizePool = basePot * (1 - commissionPercent / 100);

  const totalPrizeToDistribute = prizePool;

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ maxWidth: 1000 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Crear sala
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Nombre de la sala"
          fullWidth
          value={state.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <FormControl sx={{ minWidth: { sm: 180 } }}>
          <InputLabel>Moneda</InputLabel>
          <Select
            label="Moneda"
            value={state.currency}
            onChange={(e) =>
              handleChange("currency", e.target.value as State["currency"])
            }
          >
            <MenuItem value="Bs">Bs</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Precio del cartón"
          type="number"
          value={state.ticketPrice}
          onChange={(e) => handleChange("ticketPrice", Number(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{currencySymbol}</InputAdornment>
            ),
            inputProps: { min: 0, step: "any" },
          }}
          sx={{ minWidth: { sm: 220 } }}
        />
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Premio total a repartir"
          value={
            Number.isFinite(totalPrizeToDistribute)
              ? totalPrizeToDistribute.toFixed(2)
              : ""
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currencySymbol}
              </InputAdornment>
            ),
            readOnly: true,
          }}
          fullWidth
          disabled
        />
      </Stack>


      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Mín. cartones para iniciar"
          type="number"
          value={state.minTicketsToStart}
          onChange={(e) =>
            handleChange("minTicketsToStart", Number(e.target.value))
          }
          InputProps={{ inputProps: { min: 1, step: 1 } }}
        />
        {/* Si luego agregas Máx cartones y Límite por jugador, ponlos aquí */}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Comisión sala (%)"
          type="number"
          value={state.commission}
          onChange={(e) => handleChange("commission", Number(e.target.value))}
          InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
          helperText="Por defecto 10% (casa, solo para preview)"
          sx={{ maxWidth: { sm: 240 } }}
        />
      </Stack>

      <FormLabel sx={{ mb: 1.5, display: "block", fontWeight: 700 }}>
        Premios (3 ganadores) — repartir 100% del bote destinado a premios
      </FormLabel>

      {/* Rondas */}
      <Stack spacing={1.5} sx={{ mb: 1 }}>
        {state.rounds.map((r, idx) => {
          const roundPercent = Number(r.percent) || 0;
          const roundPrize = prizePool * (roundPercent / 100);

          return (
            <Stack
              key={idx}
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
            >
              <FormControl sx={{ minWidth: { sm: 260 }, flex: 1 }}>
                <InputLabel>{`Ronda ${idx + 1} — Patrón`}</InputLabel>
                <Select
                  label={`Ronda ${idx + 1} — Patrón`}
                  value={r.pattern}
                  onChange={(e) =>
                    handleRoundChange(idx, {
                      pattern: e.target.value as Pattern,
                    })
                  }
                >
                  {Object.entries(PATTERN_LABELS).map(([val, label]) => (
                    <MenuItem key={val} value={val}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ width: { sm: 160 } }}>
                <InputLabel>{`Ronda ${idx + 1} — %`}</InputLabel>
                <Select
                  label={`Ronda ${idx + 1} — %`}
                  value={r.percent}
                  onChange={(e) =>
                    handleRoundChange(idx, { percent: Number(e.target.value) })
                  }
                  renderValue={(v) => `${v}%`}
                >
                  {PERCENT_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ minWidth: { sm: 200 } }}>
                <Typography variant="caption" color="text.secondary">
                  Premio estimado (Ronda {idx + 1})
                </Typography>
                <Typography fontWeight={600}>
                  {Number.isFinite(roundPrize)
                    ? `${currencySymbol}${roundPrize.toFixed(2)}`
                    : "—"}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>

      <Typography
        variant="caption"
        color={roundsValid ? "success.main" : "error"}
        sx={{ display: "block", mb: 2 }}
      >
        Suma premios: {roundsSum}% — Debe ser 100%
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Bote base (mín. cartones: {minTickets}) = {currencySymbol}
        {basePot.toFixed(2)} — Comisión casa {commissionPercent}% → Bote para premios ={" "}
        {currencySymbol}
        {prizePool.toFixed(2)}
      </Typography>


      <Typography
        variant="caption"
        color={roundsValid ? "success.main" : "error"}
        sx={{ display: "block", mb: 2 }}
      >
        Suma premios: {roundsSum}% — Debe ser 100%
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Programar inicio (opcional)"
          type="datetime-local"
          value={state.scheduledAt}
          onChange={(e) => handleChange("scheduledAt", e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { sm: 280 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={state.isPublic}
              onChange={(e) => handleChange("isPublic", e.target.checked)}
            />
          }
          label="Visibilidad pública"
          sx={{ ml: { sm: 1 } }}
        />
      </Stack>

      <TextField
        label="Descripción (opcional)"
        multiline
        minRows={2}
        fullWidth
        value={state.description}
        onChange={(e) => handleChange("description", e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="Tickets (preview)"
            type="number"
            value={state.ticketsPreview}
            onChange={(e) =>
              handleChange("ticketsPreview", Number(e.target.value))
            }
            InputProps={{ inputProps: { min: 0, step: 1 } }}
            sx={{ width: { sm: 200 } }}
          />
          <Typography variant="body2" sx={{ flex: 1 }}>
            Bote = {state.ticketsPreview} × {currencySymbol}
            {state.ticketPrice} ={" "}
            <b>
              {currencySymbol}
              {(potPreview || 0).toFixed(2)}
            </b>{" "}
            | Casa ({state.commission}%) ={" "}
            <b>
              {currencySymbol}
              {houseCut.toFixed(2)}
            </b>{" "}
            | Para premios ={" "}
            <b>
              {currencySymbol}
              {potForWinners.toFixed(2)}
            </b>
          </Typography>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {state.rounds.map((r, i) => (
            <Typography key={i} variant="caption">
              Ronda {i + 1} ({PATTERN_LABELS[r.pattern]}): {r.percent}% →{" "}
              <b>
                {currencySymbol}
                {((potForWinners * r.percent) / 100 || 0).toFixed(2)}
              </b>
            </Typography>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Creando..." : "Crear sala"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => handleChange("rounds", DEFAULT_ROUNDS)}
        >
          Reset premios
        </Button>
      </Stack>
    </Box>
  );
}
