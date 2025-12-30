// src/Pages/loadRequest.tsx
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  getTransactionsService,
  type Transaction,
} from "../Services/transactionService";

type SegmentValue = "in_progress" | "completed" | "rejected";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// 🔹 Status lógico a partir del status real de la transacción
const getLogicalStatus = (t: Transaction): SegmentValue => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = String((t as any)?.status ?? "").toLowerCase();

  // null o "pending" → En progreso
  if (!raw || raw === "pending") return "in_progress";
  if (raw === "completed") return "completed";
  if (raw === "rejected") return "rejected";

  // fallback
  return "in_progress";
};

export default function LoadRequest() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [query, setQuery] = React.useState("");
  const [segment, setSegment] = React.useState<SegmentValue>("in_progress");

  // paginación frontend (por segmento)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    getTransactionsService({ page: 1, limit: 200 }) // 👈 sube el limit si quieres ver “todas”
      .then((data) => {
        console.log("DATA COMPLETA:", data);
        console.log("DOCS:", data.docs);

        // ✅ solo usamos transactions (fuente única de verdad)
        setTransactions(data.docs ?? []);
      })
      .catch((err) => {
        console.error(err);
        setTransactions([]);
      });
  }, []);

  React.useEffect(() => {
    setPage(0);
  }, [segment, query]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onView = (t: Transaction) => {
    // OJO: en tu data real estás usando "id" (no _id). Te dejo fallback.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (t as any)._id ?? (t as any).id;
    navigate(`/purchase/${id}`);
  };

  // 🔹 1) Filtramos por búsqueda
  const filteredBySearch = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((t) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bank = (t as any).metadata?.bankName ?? "";
      const ref =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t as any).metadata?.refCode ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t as any).metadata?.reference_code ??
        "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typeName = (t as any).transaction_type?.name ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userName = (t as any).wallet_id?.user_id?.name ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userEmail = (t as any).wallet_id?.user_id?.email ?? "";

      return [bank, ref, typeName, userName, userEmail].some((field) =>
        String(field).toLowerCase().includes(q)
      );
    });
  }, [transactions, query]);

  // 🔹 2) Separación por status
  const inProgress = React.useMemo(
    () => filteredBySearch.filter((t) => getLogicalStatus(t) === "in_progress"),
    [filteredBySearch]
  );
  const completed = React.useMemo(
    () => filteredBySearch.filter((t) => getLogicalStatus(t) === "completed"),
    [filteredBySearch]
  );
  const rejected = React.useMemo(
    () => filteredBySearch.filter((t) => getLogicalStatus(t) === "rejected"),
    [filteredBySearch]
  );

  // 🔹 3) Data actual por tab
  const currentData = React.useMemo(() => {
    if (segment === "in_progress") return inProgress;
    if (segment === "completed") return completed;
    return rejected;
  }, [segment, inProgress, completed, rejected]);

  // 🔹 4) Paginado sobre el estado actual
  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return currentData.slice(start, start + rowsPerPage);
  }, [currentData, page, rowsPerPage]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Solicitudes de recarga
        </Typography>
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Buscar por nombre, banco o referencia…"
        value={query}
        onChange={handleQuery}
        size="small"
        sx={{ width: "100%", mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabs */}
      <Stack sx={{ mb: 1, width: "100%" }}>
        <ToggleButtonGroup
          value={segment}
          exclusive
          onChange={(_, value) => value && setSegment(value)}
          size="small"
          sx={{ width: "100%", display: "flex" }}
        >
          <ToggleButton value="in_progress" sx={{ flex: 1 }}>
            En progreso ({inProgress.length})
          </ToggleButton>
          <ToggleButton value="completed" sx={{ flex: 1 }}>
            Completadas ({completed.length})
          </ToggleButton>
          <ToggleButton value="rejected" sx={{ flex: 1 }}>
            Rechazadas ({rejected.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          mt: 1,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Nombre / Banco</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Monto
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  (Sin registros para este estado)
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              paged.map((t: any) => {
                const amount = Number(t.amount ?? 0);
                const date = new Date(t.created_at);

                const logical = getLogicalStatus(t);
                let statusLabel = "En progreso";
                let statusColor: "default" | "success" | "warning" | "error" =
                  "warning";

                if (logical === "completed") {
                  statusLabel = "Completado";
                  statusColor = "success";
                } else if (logical === "rejected") {
                  statusLabel = "Rechazado";
                  statusColor = "error";
                } else {
                  statusLabel = "En progreso";
                  statusColor = "warning";
                }

                // nombre/email desde tu estructura real
                const userName =
                  t.wallet_id?.user_id?.name ?? t.user_name ?? "Usuario";
                const userEmail =
                  t.wallet_id?.user_id?.email ?? t.user_email ?? "";

                // banco/ref desde metadata
                const bank = t.metadata?.bankName ?? "";
                const ref =
                  t.metadata?.refCode ?? t.metadata?.reference_code ?? "";

                const rowKey = t._id ?? t.id;

                return (
                  <TableRow sx={{ cursor: "pointer" }} 
                        onClick={() => onView(t)}
                  
                  key={rowKey} hover>
                    <TableCell>
                      <strong>{userName}</strong>
                      <div style={{ fontSize: 12, color: "#777" }}>
                        {userEmail}
                      </div>
                      {(bank || ref) && (
                        <div style={{ fontSize: 12, color: "#777" }}>
                          {bank ? `Banco: ${bank}` : ""}
                          {bank && ref ? " — " : ""}
                          {ref ? `Ref: ${ref}` : ""}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor}
                        variant={statusColor === "warning" ? "outlined" : "filled"}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {formatMoney(amount)} {t.currency ?? ""}
                    </TableCell>

                    <TableCell>{date.toLocaleString()}</TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="ver"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Paginador */}
        <TablePagination
          component="div"
          count={currentData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>
    </Container>
  );
}
