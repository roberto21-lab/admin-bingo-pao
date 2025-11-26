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
  Typography
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  getWithdrawTransactionsService,
  type Transaction
} from "../Services/transactionService";

type SegmentValue = "in_progress" | "completed" | "rejected";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const getLogicalStatus = (t: any): SegmentValue => {
  const raw = t?.status_id?.name?.toLowerCase?.();

  if (!raw || raw === "pending") return "in_progress";
  if (raw === "completed") return "completed";
  if (raw === "rejected") return "rejected";

  return "in_progress";
};

export default function WithdrawalRequest() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [query, setQuery] = React.useState("");
  const [segment, setSegment] = React.useState<SegmentValue>("in_progress");
  const [page, setPage] = React.useState(0);          
  const [rowsPerPage, setRowsPerPage] = React.useState(10); 

  React.useEffect(() => {
    getWithdrawTransactionsService()
      .then(setTransactions)
      .catch((err) => {
        console.error("Error obteniendo transacciones", err);
      });
  }, []);

  React.useEffect(() => {
    setPage(0);
  }, [segment, query]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onView = (t: any) => {
    navigate(`/purchase/${t._id}`);
  };

  const filteredBySearch = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((t: any) => {
      const bank = t.metadata?.bankName ?? "";
      const ref =
        t.metadata?.refCode ?? t.metadata?.reference_code ?? "";
      const typeName = t.transaction_type_id?.name ?? "";
      const userName = t.wallet_id?.user_id?.name ?? "";

      return [bank, ref, typeName, userName].some((field) =>
        field.toLowerCase().includes(q)
      );
    });
  }, [transactions, query]);

  const inProgress = filteredBySearch.filter(
    (t) => getLogicalStatus(t) === "in_progress"
  );
  const completed = filteredBySearch.filter(
    (t) => getLogicalStatus(t) === "completed"
  );
  const rejected = filteredBySearch.filter(
    (t) => getLogicalStatus(t) === "rejected"
  );

  let currentData: any[] = [];
  let currentTitle = "";

  if (segment === "in_progress") {
    currentData = inProgress;
    currentTitle = "En progreso";
  } else if (segment === "completed") {
    currentData = completed;
    currentTitle = "Completadas";
  } else {
    currentData = rejected;
    currentTitle = "Rechazadas";
  }

  if (segment === "in_progress") {
    currentData = inProgress;
    currentTitle = "En progreso";
  } else if (segment === "completed") {
    currentData = completed;
    currentTitle = "Completadas";
  } else {
    currentData = rejected;
    currentTitle = "Rechazadas";
  }

  const paginatedData =
    currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Solicitudes de retiro
        </Typography>


      </Stack>

      <TextField
        placeholder="Buscar por nombre, banco o referencia…"
        value={query}
        onChange={handleQuery}
        size="small"
        sx={{ width: '100%', mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Stack sx={{ mb: 1, width: "100%" }}>
        <ToggleButtonGroup
          value={segment}
          exclusive
          onChange={(_, value) => {
            if (value) setSegment(value);
          }}
          size="small"
          sx={{
            width: "100%",
            display: "flex",
          }}
        >
          <ToggleButton
            value="in_progress"
            sx={{ flex: 1 }}   
          >
            En progreso ({inProgress.length})
          </ToggleButton>

          <ToggleButton
            value="completed"
            sx={{ flex: 1 }}
          >
            Completadas ({completed.length})
          </ToggleButton>

          <ToggleButton
            value="rejected"
            sx={{ flex: 1 }}
          >
            Rechazadas ({rejected.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>


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
            {currentData.length === 0 ? (
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
              paginatedData.map((t: any) => {      
                const amount = Number(
                  t.amount?.$numberDecimal ?? t.amount ?? 0
                );
                const date = new Date(t.created_at ?? t.updatedAt);

                const name =
                  t.metadata?.bankName ||
                  t.metadata?.reference_code ||
                  t.metadata?.refCode ||
                  t.transaction_type_id?.name ||
                  "Transacción";

                const rawStatus = t.status_id?.name?.toLowerCase?.();
                let statusLabel = "Sin estado";
                let statusColor:
                  | "default"
                  | "success"
                  | "warning"
                  | "error" = "default";

                if (!rawStatus) {
                  statusLabel = "Pendiente";
                  statusColor = "warning";
                } else if (rawStatus === "completed") {
                  statusLabel = "Completado";
                  statusColor = "success";
                } else if (rawStatus === "rejected") {
                  statusLabel = "Rechazado";
                  statusColor = "error";
                } else {
                  statusLabel = t.status_id.name;
                }

                return (
                  <TableRow key={t._id} hover>
                    {/* Nombre / Banco */}
                    <TableCell>
                      <strong>
                        {t.wallet_id?.user_id?.name ?? "Usuario"}
                      </strong>
                      <div style={{ fontSize: 12, color: "#777" }}>
                        {name}
                        {t.metadata?.refCode ||
                          t.metadata?.reference_code ? (
                          <>
                            {" "}
                            — Ref:{" "}
                            {t.metadata.refCode ??
                              t.metadata.reference_code}
                          </>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor}
                        variant={
                          statusColor === "default" ? "outlined" : "filled"
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      {formatMoney(amount)} {t.currency_id?.symbol ?? ""}
                    </TableCell>

                    <TableCell>{date.toLocaleString()}</TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => onView(t)}
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
