// src/Pages/RegisterUser.tsx
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
    Alert,
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getRolesService } from "../Services/roles.service";
import { createUser } from "../Services/users.service";

const gold = "#d6bf7b";

type Role = "user" | "admin" | "premium";

const inputSx = {
    "& .MuiOutlinedInput-root": {
        bgcolor: "rgba(10, 13, 25, 0.9)",
        borderRadius: 2,
        color: "#EDEDED",
        transition: "all 0.25s ease",
        "& fieldset": {
            borderColor: "rgba(214,191,123,0.35)",
        },
        "&:hover fieldset": {
            borderColor: gold,
            boxShadow: "0 0 0 1px rgba(214,191,123,0.25)",
        },
        "&.Mui-focused fieldset": {
            borderColor: gold,
            boxShadow:
                "0 0 0 1px rgba(214,191,123,0.5), 0 0 16px rgba(214,191,123,0.25)",
        },
    },
    "& .MuiInputLabel-root": {
        color: "rgba(237,237,237,0.7)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: gold,
    },
    "& .MuiFormHelperText-root": {
        color: "rgba(237,237,237,0.6)",
    },
};

export default function RegisterUser() {
    const navigate = useNavigate();

    const [values, setValues] = React.useState<{
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        role: string;
    }>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });

    const [roles, setRoles] = React.useState<Role[]>([]);
    const [defaultRoleId, setDefaultRoleId] = React.useState<string>("");

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

        if (!values.confirmPassword)
            errs.confirmPassword = "Confirma la contraseña";
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
                role: values.role,        // 👈 aquí ya va el _id del rol
            } as any);

            setSnack({ open: true, msg: "¡Usuario creado con éxito!" });

            setValues({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: defaultRoleId || "",  // 👈 volvemos al rol por defecto (user)
            });

            setTimeout(() => navigate("/users"), 600);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Error al crear el usuario";
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };


    console.log("🚀 ~ RegisterUser ~ roles:", roles)

    React.useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data: any = await getRolesService();
                setRoles(data);

                // buscar el rol "user" para dejarlo como default
                const userRole = data.find((r: any) => r.name === "user");
                if (userRole) {
                    setDefaultRoleId(userRole._id);
                    setValues(prev => ({
                        ...prev,
                        role: userRole._id,      // 👈 guardamos el id por defecto
                    }));
                }
            } catch (e) {
                console.error("Error cargando roles:", e);
            }
        };

        fetchRoles();
    }, []);


    return (
        <Box sx={{ maxWidth: 620, mx: "auto", pb: 4 }}>
            {/* Título principal */}
            <Typography
                variant="h4"
                align="center"
                sx={{
                    fontWeight: 900,
                    letterSpacing: ".18em",
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    mb: 3,
                }}
            >
                Crear nuevo usuario
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    px: 3,
                    py: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(7,10,20,0.95)",
                    border: "1px solid rgba(214,191,123,0.3)",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
                }}
            >
                {/* Header sección + botón listado */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "#EDEDED" }}
                        >
                            Datos del usuario
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "rgba(237,237,237,0.6)" }}
                        >
                            Completa la información para crear un nuevo acceso.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/users")}
                        sx={{
                            borderColor: "rgba(214,191,123,0.65)",
                            color: gold,
                            fontWeight: 700,
                            borderRadius: 999,
                            px: 2.5,
                            "&:hover": {
                                borderColor: gold,
                                background: "rgba(214,191,123,.08)",
                            },
                        }}
                    >
                        Ir al listado
                    </Button>
                </Stack>

                <Divider
                    sx={{
                        mb: 2.5,
                        borderColor: "rgba(237,237,237,0.08)",
                    }}
                />

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
                            sx={inputSx}
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
                            sx={inputSx}
                        />

                        {/* Select Rol */}
                        <TextField
                            select
                            name="role"
                            label="Rol"
                            value={values.role}
                            onChange={onChange}
                            fullWidth
                            helperText="Selecciona el rol del usuario"
                            sx={inputSx}
                        >
                            {roles.map((role: any) => (
                                <MenuItem key={role._id} value={role._id}>
                                    {role.name === "user"
                                        ? "Usuario"
                                        : role.name === "admin"
                                            ? "Admin"
                                            : role.name}
                                </MenuItem>
                            ))}
                        </TextField>


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
                            sx={inputSx}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            type="button"
                                            edge="end"
                                            onClick={() => setShowPw((v) => !v)}
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
                            sx={inputSx}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            type="button"
                                            edge="end"
                                            onClick={() => setShowPw2((v) => !v)}
                                            sx={{ color: "#8c7a3a" }}
                                            aria-label="mostrar/ocultar confirmación"
                                        >
                                            {showPw2 ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 0.5,
                                py: 1.3,
                                fontWeight: 800,
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
                            {loading ? "Creando..." : "Crear cuenta"}
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            <Snackbar
                open={snack.open}
                autoHideDuration={2400}
                onClose={() => setSnack({ open: false, msg: "" })}
                message={snack.msg}
            />
        </Box>
    );
}
