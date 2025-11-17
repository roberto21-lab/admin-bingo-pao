
import {
	Alert,
	Button,
	Container,
	LinearProgress,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, type User } from "../Services/users.service";

export default function UserDetails() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!id) return;
		(async () => {
			try {
				setLoading(true);
				const data = await getUserById(id);
				setUser(data);
			} catch (err: any) {
				console.error(err);
				setError(err?.response?.data?.message || err?.message || "Error al cargar el usuario");
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	return (
		<Container maxWidth="md" sx={{ py: 3 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
				<Typography variant="h6" fontWeight={800}>
					Detalle de usuario
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

				{!loading && !error && user && (
					<>
						<Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
							{user.name}
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
							{user.email}
						</Typography>

						<Stack direction="row" spacing={1}>
							<Button
								variant="contained"
								color="primary"
								size="small"
								onClick={() => {
									// por ahora no hace nada
								}}
							>
								Editar
							</Button>
							<Button
								variant="outlined"
								color="error"
								size="small"
								onClick={() => {
									// por ahora no hace nada
								}}
							>
								Eliminar
							</Button>
						</Stack>
					</>
				)}

				{!loading && !error && !user && (
					<Typography>No se encontró el usuario.</Typography>
				)}
			</Paper>
		</Container>
	);
}
