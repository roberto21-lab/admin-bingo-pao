// src/Pages/RegisterUser.tsx
import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
    Snackbar,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { createUser } from "../Services/users.service";
// import { createUser } from "../Services/users.service";

const gold = "#d6bf7b";
// const textFieldSx = {
//     "& .MuiOutlinedInput-root": {
//         bgcolor: "#fff",
//         borderRadius: 2,
//         "& .MuiOutlinedInput-notchedOutline": {
//             borderColor: "rgba(214,191,123,0.65)",
//             borderWidth: 2,
//         },
//         "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: gold },
//         "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//             borderColor: "#c79b36",
//             boxShadow: "0 0 0 3px rgba(214,172,75,0.18)",
//         },
//     },
//     "& .MuiInputLabel-root": { color: "#a89563" },
//     "& .MuiInputLabel-root.Mui-focused": { color: "#c79b36" },
// };

export default function RegisterUser() {
    const navigate = useNavigate();

    const [values, setValues] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPw, setShowPw] = React.useState(false);
    const [showPw2, setShowPw2] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string | false>>({});
    const [serverError, setServerError] = React.useState<string | null>(null);
    const [snack, setSnack] = React.useState<{ open: boolean; msg: string }>({
        open: false,
        msg: "",
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues((s) => ({ ...s, [name]: value }));
    };

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    const validate = () => {
        const errs: Record<string, string | false> = {};
        if (!values.name.trim()) errs.name = "Nombre completo requerido";
        if (!values.email.trim()) errs.email = "Correo requerido";
        else if (!validateEmail(values.email)) errs.email = "Correo inválido";

        if (!values.password) errs.password = "Contraseña requerida";
        else if (values.password.length < 8) errs.password = "Mínimo 8 caracteres";

        if (!values.confirmPassword) errs.confirmPassword = "Confirma la contraseña";
        else if (values.password !== values.confirmPassword)
            errs.confirmPassword = "Las contraseñas no coinciden";

        setErrors(errs);
        return Object.values(errs).every((v) => !v);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);
        if (!validate()) return;

        try {
            setLoading(true);
            await createUser({
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
            });
            setSnack({ open: true, msg: "¡Usuario creado con éxito!" });
            setValues({ name: "", email: "", password: "", confirmPassword: "" });
            setTimeout(() => navigate("/users"), 600);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message || err?.message || "Error al crear el usuario";
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box >
            {/* Título al estilo de “Crear Nueva sala…” */}
            <Container >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        fontWeight: 900,
                        letterSpacing: ".04em",
                        color: "#EDEDED",
                        textTransform: "uppercase",
                    }}
                >
                    Crear nuevo usuario
                </Typography>
            </Container>

            {/* barra superior con botón al listado */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#EDEDED" }}
                >
                    Datos del usuario
                </Typography>

                <Button
                    variant="outlined"
                    onClick={() => navigate("/users")}
                    sx={{
                        borderColor: "rgba(214,191,123,0.65)",
                        color: gold,
                        fontWeight: 700,
                        "&:hover": { borderColor: gold, background: "rgba(214,191,123,.08)" },
                    }}
                >
                    Ir al listado
                </Button>
            </Stack>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {serverError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.2}>
                    <TextField
                        name="name"
                        label="Nombre completo"
                        value={values.name}
                        onChange={onChange}
                        fullWidth
                        autoComplete="name"
                        error={!!errors.name}
                        helperText={errors.name || " "}
                    />

                    <TextField
                        name="email"
                        label="Correo electrónico"
                        type="email"
                        value={values.email}
                        onChange={onChange}
                        fullWidth
                        autoComplete="email"
                        error={!!errors.email}
                        helperText={errors.email || " "}
                    />

                    <TextField
                        name="password"
                        label="Contraseña"
                        type={showPw ? "text" : "password"}
                        value={values.password}
                        onChange={onChange}
                        fullWidth
                        autoComplete="new-password"
                        error={!!errors.password}
                        helperText={errors.password || "Mínimo 8 caracteres"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        type="button"
                                        edge="end"
                                        onClick={() => setShowPw(v => !v)}
                                        sx={{ color: "#8c7a3a" }}
                                        aria-label="mostrar/ocultar contraseña"
                                    >
                                        {showPw ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        name="confirmPassword"
                        label="Repite tu contraseña"
                        type={showPw2 ? "text" : "password"}
                        value={values.confirmPassword}
                        onChange={onChange}
                        fullWidth
                        autoComplete="new-password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword || " "}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        type="button"
                                        edge="end"
                                        onClick={() => setShowPw2(v => !v)}
                                        sx={{ color: "#8c7a3a" }}
                                        aria-label="mostrar/ocultar confirmación"
                                    >
                                        {showPw2 ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* ✅ sin onClick; usa type="submit" */}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 0.5, py: 1.3, fontWeight: 800, borderRadius: 999, textTransform: "none",
                            fontSize: "1.05rem",
                            background: "linear-gradient(180deg, #f3d08a 0%, #d6ac4b 100%)",
                            color: "#0b0f1a",
                            boxShadow: "0 8px 20px rgba(214,172,75,0.35)",
                            "&:hover": {
                                background: "linear-gradient(180deg, #f0c56d 0%, #c79b36 100%)",
                                boxShadow: "0 10px 24px rgba(214,172,75,0.45)",
                            },
                        }}
                    >
                        {loading ? "Creando..." : "Crear cuenta"}
                    </Button>
                </Stack>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={2400}
                onClose={() => setSnack({ open: false, msg: "" })}
                message={snack.msg}
            />
        </Box>
    );
}
