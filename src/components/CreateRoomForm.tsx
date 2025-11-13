// src/components/CreateRoomForm.tsx
import * as React from "react";
import {
  Box, TextField, MenuItem, Select, InputLabel, FormControl,
  FormControlLabel, Switch, Typography, InputAdornment, Button, Stack, Alert,
  Grid, RadioGroup, Radio, FormLabel
} from "@mui/material";

type PrizeModel = "fixed" | "percent";
type PriceMode = "autoFromPrize" | "manual";

type FormState = {
  name: string;
  currency: "Bs" | "USD";
  ticketPrice: number | "";
  minTicketsToStart: number | "";
  maxTickets?: number | "";
  maxPerPlayer?: number | "";
  prizeModel: PrizeModel;
  // --- FIXED MODEL ---
  prizeFixedAmount?: number | "";
  priceMode: PriceMode;        // ⬅️ NUEVO: auto/manual
  ticketsBase: number;         // ⬅️ NUEVO: divisor (default 100)
  // --- PERCENT MODEL ---
  prizePercent: { horizontal: number; vertical: number; diagonal: number; full: number; };
  commission: number; // %
  scheduledAt?: string; // ISO local datetime
  isPublic: boolean;
  description?: string;
};

const DEFAULT_PERCENT = { horizontal: 15, vertical: 15, diagonal: 20, full: 50 };

export default function CreateRoomForm({
  onSubmit,
}: {
  onSubmit?: (payload: any) => void;
}) {
  const [state, setState] = React.useState<FormState>({
    name: "",
    currency: "Bs",
    ticketPrice: "",
    minTicketsToStart: "",
    maxTickets: "",
    maxPerPlayer: "",
    prizeModel: "percent",
    prizeFixedAmount: "",
    priceMode: "autoFromPrize", // ⬅️ por defecto, calculado
    ticketsBase: 100,           // ⬅️ por defecto, 100 cartones
    prizePercent: { ...DEFAULT_PERCENT },
    commission: 10,
    scheduledAt: "",
    isPublic: true,
    description: "",
  });

  const [error, setError] = React.useState<string>("");

  const percentSum =
    state.prizePercent.horizontal +
    state.prizePercent.vertical +
    state.prizePercent.diagonal +
    state.prizePercent.full;

  const handleChange = (key: keyof FormState, value: any) =>
    setState((s) => ({ ...s, [key]: value }));

  const handlePercentChange = (k: keyof FormState["prizePercent"], v: number) =>
    setState((s) => ({ ...s, prizePercent: { ...s.prizePercent, [k]: v } }));

  // ⬅️ Auto-cálculo: ticketPrice = premio / ticketsBase (si fixed + autoFromPrize)
  React.useEffect(() => {
    if (
      state.prizeModel === "fixed" &&
      state.priceMode === "autoFromPrize" &&
      state.prizeFixedAmount &&
      state.ticketsBase > 0
    ) {
      const price = Number(state.prizeFixedAmount) / Number(state.ticketsBase);
      // redondeo a 2 decimales, ajusta si quieres más precisión
      const rounded = Math.round(price * 100) / 100;
      setState((s) => ({ ...s, ticketPrice: isFinite(rounded) ? rounded : "" }));
    }
  }, [state.prizeModel, state.priceMode, state.prizeFixedAmount, state.ticketsBase]);

  const submit = (e: React.FormEvent) => {
    console.log('=============', e)
    e.preventDefault();
    setError("");

    // Validaciones mínimas
    if (!state.name.trim()) return setError("El nombre de la sala es requerido.");
    if (!state.ticketPrice || Number(state.ticketPrice) <= 0)
      return setError("El precio del cartón debe ser mayor a 0.");
    if (!state.minTicketsToStart || Number(state.minTicketsToStart) <= 0)
      return setError("El mínimo de cartones para iniciar debe ser mayor a 0.");

    if (state.prizeModel === "fixed") {
      if (!state.prizeFixedAmount || Number(state.prizeFixedAmount) <= 0)
        return setError("El premio fijo debe ser mayor a 0.");
      if (state.priceMode === "autoFromPrize" && (!state.ticketsBase || state.ticketsBase <= 0))
        return setError("Los cartones base deben ser mayores a 0.");
    } else {
      if (percentSum !== 100)
        return setError("La distribución por porcentaje debe sumar 100%.");
    }

    const payload = {
      name: state.name.trim(),
      currency: state.currency,
      ticketPrice: Number(state.ticketPrice),
      minTicketsToStart: Number(state.minTicketsToStart),
      maxTickets: state.maxTickets ? Number(state.maxTickets) : undefined,
      maxPerPlayer: state.maxPerPlayer ? Number(state.maxPerPlayer) : undefined,
      commissionPercent: Number(state.commission),
      prize:
        state.prizeModel === "fixed"
          ? {
              model: "fixed" as const,
              total: Number(state.prizeFixedAmount),
              priceMode: state.priceMode,
              ticketsBase: state.ticketsBase,
            }
          : {
              model: "percent" as const,
              distribution: { ...state.prizePercent },
            },
      scheduledAt: state.scheduledAt || undefined,
      isPublic: state.isPublic,
      description: state.description?.trim() || undefined,
    };
    console.log('payload', payload)
    if (onSubmit) onSubmit(payload);
    else console.log("CreateRoom payload:", payload);
  };

  const currencySymbol = state.currency === "USD" ? "$" : "Bs";

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

      <Grid container spacing={2}>
        {/* Nombre */}
          <TextField
            label="Nombre de la sala"
            fullWidth
            value={state.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

        {/* Moneda */}
          <FormControl fullWidth>
            <InputLabel>Moneda</InputLabel>
            <Select
              label="Moneda"
              value={state.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <MenuItem value="Bs">Bs</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </Select>
          </FormControl>

        {/* Precio del cartón */}
          <TextField
            label="Precio del cartón"
            type="number"
            fullWidth
            value={state.ticketPrice}
            onChange={(e) => handleChange("ticketPrice", Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
              inputProps: { min: 0, step: "any" },
            }}
            disabled={state.prizeModel === "fixed" && state.priceMode === "autoFromPrize"}
            helperText={
              state.prizeModel === "fixed" && state.priceMode === "autoFromPrize"
                ? `Se calcula como ${currencySymbol}${state.prizeFixedAmount || 0} ÷ ${
                    state.ticketsBase
                  }`
                : undefined
            }
          />

        {/* Mínimo para iniciar */}
          <TextField
            label="Mín. cartones para iniciar"
            type="number"
            fullWidth
            value={state.minTicketsToStart}
            onChange={(e) => handleChange("minTicketsToStart", Number(e.target.value))}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
          />

        {/* Máximo y límite por jugador */}
          <TextField
            label="Máx. cartones (opcional)"
            type="number"
            fullWidth
            value={state.maxTickets}
            onChange={(e) => handleChange("maxTickets", Number(e.target.value))}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
          />

          <TextField
            label="Límite por jugador (opcional)"
            type="number"
            fullWidth
            value={state.maxPerPlayer}
            onChange={(e) => handleChange("maxPerPlayer", Number(e.target.value))}
            InputProps={{ inputProps: { min: 1, step: 1 } }}
          />

        {/* Comisión */}
          <TextField
            label="Comisión sala (%)"
            type="number"
            fullWidth
            value={state.commission}
            onChange={(e) => handleChange("commission", Number(e.target.value))}
            InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
          />

        {/* Modelo de premio */}
          <FormControl fullWidth>
            <InputLabel>Modelo de premio</InputLabel>
            <Select
              label="Modelo de premio"
              value={state.prizeModel}
              onChange={(e) => handleChange("prizeModel", e.target.value as PrizeModel)}
            >
              <MenuItem value="fixed">Fijo (monto total)</MenuItem>
              <MenuItem value="percent">Porcentaje del bote</MenuItem>
            </Select>
          </FormControl>

        {/* Si es premio fijo: monto + modo cálculo + tickets base */}
        {state.prizeModel === "fixed" ? (
          <>
              <TextField
                label="Premio total (fijo)"
                type="number"
                fullWidth
                value={state.prizeFixedAmount}
                onChange={(e) => handleChange("prizeFixedAmount", Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                  inputProps: { min: 0, step: "any" },
                }}
              />

              <FormLabel component="legend" sx={{ mb: 1 }}>
                Cálculo del precio del cartón
              </FormLabel>
              <RadioGroup
                row
                value={state.priceMode}
                onChange={(_, v) => handleChange("priceMode", v as PriceMode)}
              >
                <FormControlLabel
                  value="autoFromPrize"
                  control={<Radio />}
                  label={`Desde premio: precio = ${currencySymbol}premio ÷ cartones base`}
                />
                <FormControlLabel value="manual" control={<Radio />} label="Manual" />
              </RadioGroup>

              <TextField
                label="Cartones base"
                type="number"
                fullWidth
                value={state.ticketsBase}
                onChange={(e) => handleChange("ticketsBase", Number(e.target.value))}
                InputProps={{ inputProps: { min: 1, step: 1 } }}
                disabled={state.priceMode !== "autoFromPrize"}
                helperText={
                  state.priceMode === "autoFromPrize"
                    ? `Ej.: ${currencySymbol}${state.prizeFixedAmount || 0} ÷ ${
                        state.ticketsBase
                      } = ${currencySymbol}${state.ticketPrice || 0}`
                    : undefined
                }
              />
          </>
        ) : (
          <>
            {/* Porcentaje del bote */}
              <TextField
                label="Horizontal (%)"
                type="number"
                fullWidth
                value={state.prizePercent.horizontal}
                onChange={(e) => handlePercentChange("horizontal", Number(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
              <TextField
                label="Vertical (%)"
                type="number"
                fullWidth
                value={state.prizePercent.vertical}
                onChange={(e) => handlePercentChange("vertical", Number(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
              <TextField
                label="Diagonal (%)"
                type="number"
                fullWidth
                value={state.prizePercent.diagonal}
                onChange={(e) => handlePercentChange("diagonal", Number(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
              <TextField
                label="Full (%)"
                type="number"
                fullWidth
                value={state.prizePercent.full}
                onChange={(e) => handlePercentChange("full", Number(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
              <Typography variant="caption" color={percentSum === 100 ? "success.main" : "error"}>
                Suma actual: {percentSum}% {percentSum !== 100 && "— debe sumar 100%"}
              </Typography>
          </>
        )}

        {/* Programación / Pública */}
          <TextField
            label="Programar inicio (opcional)"
            type="datetime-local"
            fullWidth
            value={state.scheduledAt}
            onChange={(e) => handleChange("scheduledAt", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={state.isPublic}
                onChange={(e) => handleChange("isPublic", e.target.checked)}
              />
            }
            label="Sala pública (visible en el hall)"
          />

        {/* Descripción */}
          <TextField
            label="Descripción (opcional)"
            multiline
            minRows={2}
            fullWidth
            value={state.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
      </Grid>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained">Crear sala</Button>
        {state.prizeModel === "percent" && (
          <Button
            type="button"
            onClick={() => setState((s) => ({ ...s, prizePercent: { ...DEFAULT_PERCENT } }))}
          >
            Reset % premios
          </Button>
        )}
      </Stack>
    </Box>
  );
}
