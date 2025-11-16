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
  | "full";

const PATTERN_LABELS: Record<Pattern, string> = {
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
  { pattern: "vertical",   percent: 30 },
  { pattern: "full",       percent: 20 },
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundsValid) {
      setError(`La suma de % de rondas debe ser ${percentToWinners}% (actual: ${roundsSum}%).`);
      return;
    }
    setError(null);
    // TODO: enviar "state" a tu acción de creación
  };

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ maxWidth: 1000 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Crear sala
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Fila 1: Nombre / Moneda / Precio */}
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

      {/* Fila 2: Mín / Máx / Límite jugador */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Mín. cartones para iniciar"
          type="number"
          value={state.minTicketsToStart}
          onChange={(e) => handleChange("minTicketsToStart", Number(e.target.value))}
          InputProps={{ inputProps: { min: 1, step: 1 } }}
        />
        <TextField
          label="Máx. cartones (opcional)"
          type="number"
          value={state.maxTickets}
          onChange={(e) =>
            handleChange("maxTickets", e.target.value === "" ? "" : Number(e.target.value))
          }
          InputProps={{ inputProps: { min: 1, step: 1 } }}
        />
        <TextField
          label="Límite por jugador (opcional)"
          type="number"
          value={state.maxPerPlayer}
          onChange={(e) =>
            handleChange("maxPerPlayer", e.target.value === "" ? "" : Number(e.target.value))
          }
          InputProps={{ inputProps: { min: 1, step: 1 } }}
        />
      </Stack>

      {/* Fila 3: Comisión */}
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

      {/* Premios / Rondas */}
      <FormLabel sx={{ mb: 1.5, display: "block", fontWeight: 700 }}>
        Premios (3 ganadores) — repartir {percentToWinners}% del bote
      </FormLabel>

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
                  <MenuItem key={val} value={val}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={`Ronda ${idx + 1} — %`}
              type="number"
              value={r.percent}
              onChange={(e) => handleRoundChange(idx, { percent: Number(e.target.value) })}
              InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              sx={{ width: { sm: 180 } }}
            />
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

      {/* Vista previa del bote */}
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
        <Button type="submit" variant="contained" disabled={!roundsValid}>
          Crear sala
        </Button>
        <Button type="button" variant="outlined" onClick={() => handleChange("rounds", DEFAULT_ROUNDS)}>
          Reset premios
        </Button>
      </Stack>
    </Box>
  );
}
