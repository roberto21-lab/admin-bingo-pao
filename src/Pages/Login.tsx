import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import BingoLogo from "../components/BingoLogo";
import { loginService } from "../Services/auth.service";

// 🎨 Colores / estilos compartidos
const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    "& fieldset": {
      borderColor: "#e6cf8a",
    },
    "&:hover fieldset": {
      borderColor: "#d6ac4b",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#d6ac4b",
    },
  },
  "& .MuiInputBase-input": {
    color: "#0b0f1a",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root": {
    color: "#d6ac4b",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#d6ac4b",
  },
};

export default function Login() {
  const [values, setValues] = React.useState({
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string | false>>(
    {}
  );
  const [serverError, setServerError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  };

  const handleTogglePw = () => setShowPw((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // validación básica rápida
    const newErrors: Record<string, string> = {};
    if (!values.email) newErrors.email = "El email es requerido";
    if (!values.password) newErrors.password = "La contraseña es requerida";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await loginService({
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/"); // o a /panel, /rooms, etc.
    } catch (err: any) {
      console.error(err);
      setServerError(
        err?.response?.data?.message ||
          err.message ||
          "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",                // 👈 solo flex
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(180deg, #0b1220, #0a0f1a 40%, #0b1020)",
      }}
    >
      {/* Contenedor central responsivo */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* HEADER / LOGO */}
        <Stack spacing={1.2} textAlign="center" sx={{ width: "100%" }}>
          <Typography
            sx={{
              fontSize: { xs: 44, sm: 64 },
              fontWeight: 900,
              letterSpacing: "0.14em",
              lineHeight: 1,
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            BINGO
          </Typography>

          <Box sx={{ textAlign: "center", mb: 1 }}>
            <BingoLogo size={96} />
          </Box>

          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 800,
              color: "#EDEDED",
              mt: 0.5,
            }}
          >
            Login
          </Typography>
        </Stack>

        {/* CARD DEL FORM */}
        <Paper
          elevation={20}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            bgcolor: "#fff",
            boxShadow: "0 16px 48px rgba(0,0,0,.25)",
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            {serverError && (
              <Typography color="error" textAlign="center">
                {serverError}
              </Typography>
            )}

            <TextField
              name="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={onChange}
              fullWidth
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email || " "}
              sx={textFieldSx}
            />

            <TextField
              name="password"
              label="Contraseña"
              type={showPw ? "text" : "password"}
              value={values.password}
              onChange={onChange}
              fullWidth
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password || "Mínimo 4 caracteres"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      sx={{ color: "#8c7a3a" }}
                      onClick={handleTogglePw}
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.4,
                fontWeight: 700,
                borderRadius: 999,
                textTransform: "none",
                fontSize: "1.05rem",
                background:
                  "linear-gradient(180deg, #f3d08a 0%, #d6ac4b 100%)",
                color: "#0b0f1a",
                boxShadow: "0 8px 20px rgba(214,172,75,0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(180deg, #f0c56d 0%, #c79b36 100%)",
                  boxShadow: "0 10px 24px rgba(214,172,75,0.45)",
                },
              }}
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>

            <Divider />

            {/* Aquí luego puedes poner "¿No tienes cuenta? Crear cuenta", etc. */}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
