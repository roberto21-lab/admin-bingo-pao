import {
	Alert,
	Button,
	Container,
	LinearProgress,
	Paper,
	Stack,
	Typography,
	TextField,
	Divider,
	Box,
	MenuItem,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser, type User } from "../Services/users.service";
import { getWalletByUser, type WalletResponse } from "../Services/wallet.service";
import { createAdminTransactionService, updateTransactionStatusService, type CreateAdminTransactionPayload } from "../Services/transactionService";


type EditableUserField = "name" | "email" | "document_number" | "phone" | "bank";

export default function UserDetails() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [seeForm, setSeeForm] = React.useState(false);
	const [user, setUser] = React.useState<User | null>(null);
	console.log("🚀 ~ UserDetails ~ user:", user)
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	// 🔹 estados locales para los campos editables
	const [fieldValues, setFieldValues] = React.useState<Record<EditableUserField, string>>({
		name: user?.name || "",
		email: user?.email || "",
		document_number: user?.profile?.document_number || "",
		phone: user?.bankAccount?.phone_number || "",
		bank: user?.bankAccount?.bank_name || "",
	});

	// 🔹 estados para la sección de wallet
	const [walletOperation, setWalletOperation] = React.useState<"sumar" | "restar">("sumar");
	const [walletAmount, setWalletAmount] = React.useState("");
	const [walletNote, setWalletNote] = React.useState("");

	React.useEffect(() => {
		if (!id) return;
		(async () => {
			try {
				setLoading(true);
				const data = await getUserById(id);
				setUser(data);

				// cuando llegue el usuario, seteamos los valores iniciales de los campos
				setFieldValues({
					name: data.name || "",
					email: (data as any).email || "",
					document_number: data?.profile?.document_number || "",
					phone: data?.bankAccount?.phone_number || "",
					bank: data?.bankAccount?.bank_name || "",
				});
			} catch (err: any) {
				// console.error("Error obteniendo usuario:", err);

			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	// 🔹 función genérica que "envía" la data al backend (por ahora solo consola)
	const sendUpdate = (payload: any) => {
		console.log("📤 Payload enviado al backend (simulado):", payload);
	};

	// 🔹 cambiar el valor de un campo de texto
	const handleFieldChange = (field: EditableUserField, value: string) => {
		setFieldValues((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// 🔹 guardar un solo campo (Nombre, Email, etc.)
	const handleFieldSave = (field: EditableUserField) => {
		if (!id) return;

		const value = fieldValues[field];

		const payload = {
			userId: id,
			type: "update-user-field",
			field,
			value,
		};

		sendUpdate(payload);
	};

	// 🔹 aplicar cambio de saldo de wallet (sumar / restar)
	// const handleWalletSubmit = () => {
	// 	if (!id) return;

	// 	const numericAmount = Number(walletAmount);
	// 	if (isNaN(numericAmount) || numericAmount <= 0) {
	// 		console.warn("Monto inválido");
	// 		return;
	// 	}

	// 	const payload = {
	// 		userId: id,
	// 		type: "wallet-transaction",
	// 		operation: walletOperation,
	// 		amount: numericAmount,
	// 		note: walletNote,
	// 		// más adelante aquí metes wallet_id, currency_id, etc.
	// 	};

	// 	sendUpdate(payload);
	// };

	const [wallet, setWallet] = React.useState<WalletResponse | null>(null);
	const [walletError, setWalletError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!id) return; // por si todavía no hay id en la URL

		const fetchWallet = async () => {
			try {
				setWalletError(null);
				const data = await getWalletByUser(id);
				setWallet(data);
				console.log("💰 Wallet del usuario:", data);
			} catch (err: any) {
				console.error("Error obteniendo wallet:", err);
				setWalletError(
					err?.response?.data?.message ||
					err?.message ||
					"Error al obtener la wallet del usuario"
				);
			}
		};

		fetchWallet();
	}, [id]);


	const handleUpdateCedula = async () => {
		console.log("Actualizar cédula a:", fieldValues.document_number);
		if (!user) return;

		const updated = await updateUser(user._id, {
			document_number: fieldValues.document_number,
		});
		setUser(updated);
	};

	const handleUpdateName = async () => {
		console.log("Actualizar nombre a:", fieldValues.name);
		if (!user) return;

		const updated = await updateUser(user._id, {
			name: fieldValues.name, // 👈 esto es lo que va al back
		});
		setUser(updated);


	};

	const handleUpdateEmail = async () => {
		console.log("Actualizar correo a:", fieldValues.email);
		if (!user) return;

		try {
			const updated = await updateUser(user._id, {
				email: fieldValues.email, // 👈 esto va al back
			});

			setUser(updated);

			// opcional: sincronizar por si el back lo modifica
			// setFieldValues((prev) => ({
			//   ...prev,
			//   email: updated.email || prev.email,
			// }));

			// opcional: snackbar
			// setSnack({
			//   open: true,
			//   msg: "Correo actualizado correctamente",
			// });
		} catch (error: any) {
			console.error("Error actualizando correo:", error);

			// si tu backend manda { message: "El email ya está registrado" }
			const msg =
				error?.response?.data?.message || "Error al actualizar el correo";

			// opcional: snackbar
			// setSnack({
			//   open: true,
			//   msg,
			// });
			alert(msg); // por ahora algo sencillo
		}
	};

	const handleUpdatePhone = async () => {
		console.log("Actualizar teléfono a:", fieldValues.phone);
		if (!user) return;

		try {
			const updated = await updateUser(user._id, {
				phone_number: fieldValues.phone,  // 👈 clave que espera el back
			});

			setUser(updated);

			// opcional: sincronizar por si el back lo modifica
			// setFieldValues((prev) => ({
			//   ...prev,
			//   phone: updated.profile?.phone_number || prev.phone,
			// }));

			// opcional: snackbar
			// setSnack({
			//   open: true,
			//   msg: "Teléfono actualizado correctamente",
			// });
		} catch (error) {
			console.error("Error actualizando teléfono:", error);
			// setSnack({
			//   open: true,
			//   msg: "Error al actualizar el teléfono",
			// });
		}
	};


	// OJO: ajusta estos IDs con los de tu BD
const RECHARGE_TYPE_ID = "ID_DEL_TRANSACTION_TYPE_RECHARGE"; // cámbialo por el real
const WITHDRAW_TYPE_ID = "ID_DEL_TRANSACTION_TYPE_WITHDRAW"; // cámbialo por el real

const handleWalletSubmit = async () => {
  if (!wallet || !wallet._id) {
    console.error("No hay wallet para operar");
    // setSnack({ open: true, msg: "No se encontró la wallet del usuario." });
    return;
  }

  const amountNumber = Number(walletAmount);

  if (isNaN(amountNumber) || amountNumber <= 0) {
    console.error("Monto inválido:", walletAmount);
    // setSnack({ open: true, msg: "Ingresa un monto mayor a 0." });
    return;
  }

  // currency_id puede venir como string o como objeto poblado
  const currency_id =
    typeof wallet.currency_id === "string"
      ? wallet.currency_id
      : wallet.currency_id?._id;

  if (!currency_id) {
    console.error("No se pudo determinar currency_id desde la wallet");
    // setSnack({ open: true, msg: "No se pudo determinar la moneda de la wallet." });
    return;
  }

  const transaction_type_id =
    walletOperation === "sumar" ? RECHARGE_TYPE_ID : WITHDRAW_TYPE_ID;

  try {
    const res = await createAdminTransactionService({
      wallet_id: wallet._id,
      transaction_type_id: "6929f2a6b0d38f1f0ce323ce",
      amount: amountNumber,
      currency_id: "6929f2a1b0d38f1f0ce32374",
    
    });
    console.log("🚀 ~ handleWalletSubmit ~ res:", res)

    console.log("Transacción admin creada:", res.transaction);

  } catch (error) {
    console.error("Error creando transacción admin:", error);
  }
};


	return (
		<Container maxWidth="md" sx={{ py: 3 }}>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{ mb: 2 }}
			>
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
							{(user as any).email}
						</Typography>

						<Stack direction="row" spacing={1}>
							<Button
								variant="contained"
								color="primary"
								size="small"
								onClick={() => {
									setSeeForm((prev) => !prev);
								}}
							>
								{seeForm ? "Ocultar formulario" : "Editar"}
							</Button>
							<Button
								variant="outlined"
								color="error"
								size="small"
								onClick={() => {
									// por ahora no hace nada
									console.log("🗑️ Aquí iría la lógica para eliminar usuario");
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

				{seeForm && user && (
					<Box sx={{ mt: 3 }}>
						<Divider sx={{ mb: 2 }} />

						<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
							Datos del usuario
						</Typography>

						{/* Nombre */}
						{/* Nombre */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 1.5 }}
						>
							<Typography sx={{ width: 140, fontWeight: 600 }}>
								Nombre:
							</Typography>
							<TextField
								size="small"
								fullWidth
								value={fieldValues.name}
								onChange={(e) => handleFieldChange("name", e.target.value)}
							/>
							<Button
								variant="contained"
								size="small"
								onClick={() => handleUpdateName()}
							>
								Guardar
							</Button>
						</Stack>


						{/* Correo */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 1.5 }}
						>
							<Typography sx={{ width: 140, fontWeight: 600 }}>
								Correo:
							</Typography>
							<TextField
								size="small"
								fullWidth
								value={fieldValues.email}
								onChange={(e) => handleFieldChange("email", e.target.value)}
							/>
							<Button
								variant="contained"
								size="small"
								onClick={handleUpdateEmail}
							>
								Guardar
							</Button>
						</Stack>


						{/* Cédula */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 1.5 }}
						>
							<Typography sx={{ width: 140, fontWeight: 600 }}>
								Cédula:
							</Typography>
							<TextField
								size="small"
								fullWidth
								value={fieldValues.document_number}
								onChange={(e) => handleFieldChange("document_number", e.target.value)}
							/>
							<Button
								variant="contained"
								size="small"
								onClick={() => handleUpdateCedula()}
							>
								Guardar
							</Button>
						</Stack>

						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 1.5 }}
						>
							<Typography sx={{ width: 140, fontWeight: 600 }}>
								Teléfono:
							</Typography>
							<TextField
								size="small"
								fullWidth
								value={fieldValues.phone}
								onChange={(e) => handleFieldChange("phone", e.target.value)}
							/>
							<Button
								variant="contained"
								size="small"
								onClick={() => handleUpdatePhone()}
							>
								Guardar
							</Button>
						</Stack>


						{/* Banco */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 2 }}
						>
							<Typography sx={{ width: 140, fontWeight: 600 }}>
								Banco:
							</Typography>
							<TextField
								size="small"
								fullWidth
								value={user?.bankAccount?.bank_name || ""}
								onChange={(e) => handleFieldChange("bank", e.target.value)}
							/>
							<Button
								variant="contained"
								size="small"
								onClick={() => handleFieldSave("bank")}
							>
								Guardar
							</Button>
						</Stack>

						{/* ---------------- DATOS DE LA WALLET ---------------- */}
						<Divider sx={{ my: 2 }} />
						<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
							Datos de la wallet
						</Typography>

						<Typography variant="body2" sx={{ mb: 1 }}>
							Saldo actual:{" "}
							<strong>
								{wallet?.balance ?? 0}
							</strong>{" "}
							{wallet?.currency_id.code
								|| "BS"}
						</Typography>

						<Typography variant="body2" sx={{ mb: 1 }}>
							Saldo congelado:{" "}
							<strong>
								{wallet?.frozen_balance ?? 0}
							</strong>{" "}
							{wallet?.currency_id.code
								|| "BS"}
						</Typography>

						<Stack spacing={1.5} sx={{ maxWidth: 600 }}>
							<Stack direction="row" spacing={1}>
								<TextField
									select
									label="Operación"
									size="small"
									sx={{ width: 160 }}
									value={walletOperation}
									onChange={(e) =>
										setWalletOperation(e.target.value as "sumar" | "restar")
									}
								>
									<MenuItem value="sumar">Recarga de saldo</MenuItem>
									<MenuItem value="restar">Retiro de saldo</MenuItem>
								</TextField>

								<TextField
									label="Monto"
									size="small"
									type="number"
									fullWidth
									value={walletAmount}
									onChange={(e) => setWalletAmount(e.target.value)}
								/>
							</Stack>

							<TextField
								label="Nota (opcional)"
								size="small"
								multiline
								minRows={2}
								value={walletNote}
								onChange={(e) => setWalletNote(e.target.value)}
							/>

							<Box>
								<Button
									variant="contained"
									size="small"
									onClick={handleWalletSubmit}
								>
									Aplicar cambio de saldo
								</Button>
							</Box>
						</Stack>

					</Box>
				)}
			</Paper>
		</Container>
	);
}


