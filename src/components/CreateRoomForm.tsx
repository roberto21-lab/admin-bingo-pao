import * as React from "react";
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Alert, Stack, InputAdornment, FormControlLabel, Switch,
  FormLabel, Button
} from "@mui/material";

type PrizeModel = "percent" | "fixed";
type PriceMode = "autoFromPrize" | "manual";

type Pattern =
  | "horizontal"
  | "vertical"
  | "diagonal"
  | "cross_small"
  | "cross_big"
  | "random"
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

type RoundConfig = { pattern: Pattern; percent: number; };

const DEFAULT_ROUNDS: RoundConfig[] = [
  { pattern: "horizontal", percent: 40 },
  { pattern: "vertical", percent: 30 },
  { pattern: "full", percent: 20 },
];

type State = {
  name: string;
  currency: "Bs" | "USD";
  ticketPrice: number;
  minTicketsToStart: number;
  maxTickets?: number | "";
  maxPerPlayer?: number | "";
  commission: number; // % para la casa (10 por defecto)
  prizeModel: PrizeModel;
  priceMode: PriceMode;
  scheduledAt?: string;
  isPublic: boolean;
  description?: string;

  rounds: RoundConfig[]; // 3 rondas
  ticketsPreview: number;
};

// 👉 Tipo sugerido para el payload (ajústalo a tu back si difiere)
type CreateRoomPayload = {
  name: string;
  currency: "Bs" | "USD";
  price_per_card: number;
  min_players: number;
  max_tickets?: number | null;
  max_per_player?: number | null;
  admin_fee: number;           // en decimal (0.10 = 10%). Si tu back quiere 10, cambia abajo.
  is_public: boolean;
  scheduled_at?: string | null;
  description?: string | null;
  rounds: Array<{ round: number; pattern: Pattern; percent: number }>;
};

export default function CrearSalaFormFlex() {
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<State>({
    name: "",
    currency: "USD",
    ticketPrice: 1,
    minTicketsToStart: 10,
    maxTickets: "",
    maxPerPlayer: "",
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

  const percentToWinners = 100 - state.commission;
  const roundsSum = state.rounds.reduce((acc, r) => acc + (Number(r.percent) || 0), 0);
  const roundsValid = roundsSum === percentToWinners;

  const potPreview = (Number(state.ticketsPreview) || 0) * (Number(state.ticketPrice) || 0);
  const houseCut = (potPreview * state.commission) / 100;
  const potForWinners = potPreview - houseCut;

  const currencySymbol = state.currency === "USD" ? "$" : "Bs";
  const PERCENT_OPTIONS = Array.from({ length: 21 }, (_, i) => i * 5);

  // 🔧 Construye el payload desde el state (sin validaciones)
  const buildPayload = (): CreateRoomPayload => {
    return {
      name: state.name.trim(),
      currency: state.currency,
      price_per_card: Number(state.ticketPrice) || 0,
      min_players: Number(state.minTicketsToStart) || 0,
      max_tickets: state.maxTickets === "" ? null : Number(state.maxTickets),
      max_per_player: state.maxPerPlayer === "" ? null : Number(state.maxPerPlayer),

      // Si tu backend espera 10 (porcentaje), usa: admin_fee: Number(state.commission)
      admin_fee: Number(state.commission) / 100,

      is_public: !!state.isPublic,
      scheduled_at: state.scheduledAt ? state.scheduledAt : null,
      description: state.description?.trim() || null,

      rounds: state.rounds.map((r, i) => ({
        round: i + 1,
        pattern: r.pattern,
        percent: Number(r.percent) || 0,
      })),
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // ❌ Si no quieres validar nada, comenta/borra este bloque:
    // if (!roundsValid) {
    //   setError(`La suma de % de rondas debe ser ${percentToWinners}% (actual: ${roundsSum}%).`);
    //   return;
    // }
    setError(null);

    const payload = buildPayload();
    console.log("🚀 Payload a enviar (crear sala):", payload);
    // Aquí luego harías: await api.post('/rooms', payload)
  };

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ maxWidth: 1000 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Crear sala
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Fila 1 */}
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
            onChange={(e) => handleChange("currency", e.target.value as State["currency"])}
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
            startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            inputProps: { min: 0, step: "any" },
          }}
          sx={{ minWidth: { sm: 220 } }}
        />
      </Stack>

      {/* Fila 2 */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Mín. cartones para iniciar"
          type="number"
          value={state.minTicketsToStart}
          onChange={(e) => handleChange("minTicketsToStart", Number(e.target.value))}
          InputProps={{ inputProps: { min: 1, step: 1 } }}
        />
        {/* Si luego agregas Máx cartones y Límite por jugador, ponlos aquí */}
      </Stack>

      {/* Fila 3 */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Comisión sala (%)"
          type="number"
          value={state.commission}
          onChange={(e) => handleChange("commission", Number(e.target.value))}
          InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
          helperText="Por defecto 10% (casa)"
          sx={{ maxWidth: { sm: 240 } }}
        />
      </Stack>

      <FormLabel sx={{ mb: 1.5, display: "block", fontWeight: 700 }}>
        Premios (3 ganadores) — repartir {percentToWinners}% del bote
      </FormLabel>

      {/* Rondas */}
      <Stack spacing={1.5} sx={{ mb: 1 }}>
        {state.rounds.map((r, idx) => (
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
                  handleRoundChange(idx, { pattern: e.target.value as Pattern })
                }
              >
                {Object.entries(PATTERN_LABELS).map(([val, label]) => (
                  <MenuItem key={val} value={val}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: { sm: 180 } }}>
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
          </Stack>
        ))}
      </Stack>

      <Typography
        variant="caption"
        color={roundsValid ? "success.main" : "error"}
        sx={{ display: "block", mb: 2 }}
      >
        Suma premios: {roundsSum}% — Debe ser {percentToWinners}% (100% - comisión)
      </Typography>

      {/* Programación / Pública */}
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
          label="Sala pública (visible en el hall)"
          sx={{ ml: { sm: 1 } }}
        />
      </Stack>

      {/* Descripción */}
      <TextField
        label="Descripción (opcional)"
        multiline
        minRows={2}
        fullWidth
        value={state.description}
        onChange={(e) => handleChange("description", e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Preview del bote */}
      <Box
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            label="Tickets (preview)"
            type="number"
            value={state.ticketsPreview}
            onChange={(e) => handleChange("ticketsPreview", Number(e.target.value))}
            InputProps={{ inputProps: { min: 0, step: 1 } }}
            sx={{ width: { sm: 200 } }}
          />
          <Typography variant="body2" sx={{ flex: 1 }}>
            Bote = {state.ticketsPreview} × {currencySymbol}{state.ticketPrice} ={" "}
            <b>{currencySymbol}{(potPreview || 0).toFixed(2)}</b> | Casa ({state.commission}%) ={" "}
            <b>{currencySymbol}{houseCut.toFixed(2)}</b> | Para premios ={" "}
            <b>{currencySymbol}{potForWinners.toFixed(2)}</b>
          </Typography>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {state.rounds.map((r, i) => (
            <Typography key={i} variant="caption">
              Ronda {i + 1} ({PATTERN_LABELS[r.pattern]}): {r.percent}% →{" "}
              <b>
                {currencySymbol}
                {((potForWinners * r.percent) / percentToWinners || 0).toFixed(2)}
              </b>
            </Typography>
          ))}
        </Stack>
      </Box>

      {/* Acciones */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        {/* ❗️Quité el disabled para que siempre puedas hacer el console.log */}
        <Button type="submit" variant="contained">
          Crear sala
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
