import {
	Alert,
	Box,
	Button,
	Container,
	Divider,
	LinearProgress,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAdminTransactionService } from "../Services/transactionService";
import { getUserById, updateUser, type User } from "../Services/users.service";
import { getWalletByUser, type WalletResponse } from "../Services/wallet.service";


type EditableUserField = "name" | "email" | "document_number" | "phone" | "bank";


const BANKS = [
	"Banco de Venezuela",
	"Banco Provincial",
	"Banesco",
	"Mercantil",
	"BOD",
	"Banco del Tesoro",
	"Bancamiga",
];


export default function UserDetails() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [seeForm, setSeeForm] = React.useState(false);
	const [user, setUser] = React.useState<User | null>(null);
	console.log("🚀 ~ UserDetails ~ user:", user)
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	const [adminCode, setAdminCode] = React.useState("");

	const [fieldValues, setFieldValues] = React.useState<Record<EditableUserField, string>>({
		name: user?.name || "",
		email: user?.email || "",
		document_number: user?.profile?.document_number || "",
		phone: user?.bankAccount?.phone_number || "",
		bank: user?.bankAccount?.bank_name || "",
	});

	const [walletOperation, setWalletOperation] = React.useState<"sumar" | "restar">("sumar");
	const [walletAmount, setWalletAmount] = React.useState("");
	const [walletNote, setWalletNote] = React.useState("");
	const [refCode, setRefCode] = React.useState("");

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
					document_number: data?.bankAccount?.document_number || "",
					phone: data?.bankAccount?.phone_number || "",
					bank: data?.bankAccount?.bank_name || "",
				});
				setAdminCode(data.bankAccount?.admin_code || "");
			} catch (err: any) {
				// console.error("Error obteniendo usuario:", err);

			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	const sendUpdate = (payload: any) => {
		console.log("📤 Payload enviado al backend (simulado):", payload);
	};

	const handleFieldChange = (field: EditableUserField, value: string) => {
		setFieldValues((prev) => ({
			...prev,
			[field]: value,
		}));
	};

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

	const [wallet, setWallet] = React.useState<WalletResponse | null>(null);
	const [walletError, setWalletError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!id) return;

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
		alert("Nombre actualizado con éxito");


	};

	const handleUpdateEmail = async () => {
		console.log("Actualizar correo a:", fieldValues.email);
		if (!user) return;

		try {
			const updated = await updateUser(user._id, {
				email: fieldValues.email,
			});

			setUser(updated);
			// mandar alerta de éxito
			alert("Correo actualizado con éxito");

		} catch (error: any) {
			console.error("Error actualizando correo:", error);

			const msg =
				error?.response?.data?.message || "Error al actualizar el correo";

			alert(msg);
		}
	};

	const handleUpdatePhone = async () => {
		console.log("Actualizar teléfono a:", fieldValues.phone);
		if (!user) return;

		try {
			const updated = await updateUser(user._id, {
				phone_number: fieldValues.phone,
			});

			setUser(updated);
			// mandar alerta de éxito
			alert("Teléfono actualizado con éxito");


		} catch (error) {
			console.error("Error actualizando teléfono:", error);

		}
	};

	type WalletOperation = "sumar" | "restar";

	const RECHARGE_TYPE_ID = "6929f2a6b0d38f1f0ce323ce"; // Recarga
	const WITHDRAW_TYPE_ID = "6929f2a6b0d38f1f0ce323d1"; // Retiro

	const TX_TYPE_BY_OPERATION: Record<WalletOperation, string> = {
		sumar: RECHARGE_TYPE_ID,
		restar: WITHDRAW_TYPE_ID,
	};

const handleWalletSubmit = async () => {
	const isAdminTransaction = true; // para que el backend sepa que es admin

  if (!wallet || !wallet._id) {
    console.error("No hay wallet para operar");
    return;
  }

  const amountNumber = Number(walletAmount);

  if (isNaN(amountNumber) || amountNumber <= 0) {
    console.error("Monto inválido:", walletAmount);
    return;
  }

  const currency_id =
    typeof wallet.currency_id === "string"
      ? wallet.currency_id
      : wallet.currency_id?._id;

  if (!currency_id) {
    console.error("No se pudo determinar currency_id desde la wallet");
    return;
  }

  const transaction_type_id = TX_TYPE_BY_OPERATION[walletOperation];

  // 👇 Aquí armamos tu metadata
  const metadata = {
    refCode: refCode || "",                     // si quieres, crea un estado refCode
    bankName: fieldValues.bank || "",           // "Bancamiga", "Banesco", etc.
    payerDocType: "V",                          // luego lo puedes volver dinámico
    payerDocId: fieldValues.document_number || "",
    payerPhone: fieldValues.phone || "",
    amount: amountNumber.toString(),            // como string en metadata
    paidAt: new Date().toISOString(),          // o un valor que elijas desde un input
    notes: walletNote || "",
    voucherPreview: null,
    voucherFile: null,
    // Extra opcional: info del admin que hizo el movimiento
    // adminName: userAuth?.name,
    // adminId: userAuth?.id,
  };

  try {
    await createAdminTransactionService({
      wallet_id: wallet._id,
      transaction_type_id,
      amount: amountNumber,
      currency_id,
      isAdminTransaction,             // para que el backend sepa que es admin
      metadata,
    });

    alert("Transacción creada con éxito");
    setWalletAmount("");
    setWalletNote("");

    const updatedWallet = await getWalletByUser(wallet.user_id);
    setWallet(updatedWallet);
  } catch (error) {
    console.error("Error creando transacción admin:", error);
  }
};


	const handleUpdateBank = async () => {
		console.log("Actualizar banco a:", fieldValues.bank);
		if (!user) return;

		try {
			const updated = await updateUser(user._id, {
				bank_name: fieldValues.bank,   // 👈 esto es lo que espera el back
			});

			setUser(updated);

			alert("Banco actualizado con éxito");
		} catch (error) {
			console.error("Error actualizando banco:", error);
			alert("Error al actualizar el banco");
		}
	};




	return (
		<Container sx={{ py: 3 }}>
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
								sx={{
									width: "100%",
								}}
								value={fieldValues.name}
								onChange={(e) => handleFieldChange("name", e.target.value)}
							/>
							<Button
								variant="contained"
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
								sx={{
									width: "100%",
								}}
								value={fieldValues.email}
								onChange={(e) => handleFieldChange("email", e.target.value)}
							/>
							<Button
								variant="contained"
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
								sx={{
									width: "100%",
								}}
								value={fieldValues.document_number}
								onChange={(e) => handleFieldChange("document_number", e.target.value)}
							/>
							<Button
								variant="contained"
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
								sx={{
									width: "100%",
								}}
								value={fieldValues.phone}
								onChange={(e) => handleFieldChange("phone", e.target.value)}
							/>
							<Button
								variant="contained"
								onClick={() => handleUpdatePhone()}
							>
								Guardar
							</Button>
						</Stack>


						{/* Banco */}
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
								select                     // 👈 importante
								sx={{
									width: "100%",
								}}
								value={fieldValues.bank}
								onChange={(e) => handleFieldChange("bank", e.target.value)}
							>
								{BANKS.map((bank) => (
									<MenuItem key={bank} value={bank}>
										{bank}
									</MenuItem>
								))}
							</TextField>
							<Button
								variant="contained"
								onClick={handleUpdateBank}
							>
								Guardar
							</Button>
						</Stack>


						{/* ---------------- DATOS DE LA WALLET ---------------- */}
						<Divider sx={{ my: 2 }} />
						<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
							Datos de la wallet
						</Typography>

						<Box sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}>
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

						</Box>


						<Stack spacing={1.5} >
							<Stack direction="row" spacing={1}>
								<TextField
									select
									label="Operación"
									size="small"
									sx={{ width: "300px" }}
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
									fullWidth
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


