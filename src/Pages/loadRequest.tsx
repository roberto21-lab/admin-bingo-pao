// src/Pages/loadRequest.tsx
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import {
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
  Typography,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

type LoadRequestRow = {
  id: string;
  name: string;
  amount: number; // monto solicitado
  createdAt: string;
};

const NAMES = [
  "María Pérez","Juan Gómez","Ana López","Carlos Ruiz","Luis Torres",
  "Gabriela Díaz","Pedro Aguilar","Lucía Romero","Andrés Castillo","Sofía Herrera",
  "Diego Rivas","Valentina Soto","Miguel Navarro","Daniela Fuentes","Jorge Medina",
  "Camila Vargas","Ricardo Paredes","Paola Márquez","Fernando Silva","Adriana León"
];

// 👉 20 registros mock
const MOCK_ROWS: LoadRequestRow[] = Array.from({ length: 20 }, (_, i) => {
  const base = 20 + i;
  return {
    id: String(i + 1),
    name: NAMES[i],
    amount: (base % 7) * 10 + 15, // montos variados
    createdAt: new Date(Date.now() - i * 86400000).toISOString(), // días hacia atrás
  };
});

export default function LoadRequest() {
  const navigate = useNavigate();

  // estado base
  const [rows] = React.useState<LoadRequestRow[]>(MOCK_ROWS);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const onView = (r: LoadRequestRow) => {
    navigate(`/purchase/${r.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Solicitudes de recarga
        </Typography>

        <TextField
          placeholder="Buscar por nombre…"
          value={query}
          onChange={handleQuery}
          size="small"
          sx={{ minWidth: { xs: "100%", sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  (Sin registros)
                </TableCell>
              </TableRow>
            ) : (
              paged.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{formatMoney(r.amount)}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onView(r)} aria-label="ver">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]} // fijo a 10
        />
      </TableContainer>
    </Container>
  );
}
