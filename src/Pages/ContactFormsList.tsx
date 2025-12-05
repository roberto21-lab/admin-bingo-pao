// src/Pages/ContactFormsList.tsx
import * as React from "react";
import {
  Alert,
  Container,
  IconButton,
  LinearProgress,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import {
  getContactForms,
  type ContactFormListItem,
} from "../Services/contactForms.service";

// Extiendo lo que viene del backend por si luego le agregas created_at
type ContactFormRow = ContactFormListItem & {
  created_at?: string; // opcional por ahora (tu controlador no lo manda)
};

export default function ContactFormsList() {
  const navigate = useNavigate();

  const [forms, setForms] = React.useState<ContactFormRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // filtros/paginado
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  console.log("🚀 ~ ContactFormsList ~ forms:", forms);

  // 🔹 Cargar formularios desde el backend
  React.useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);

        // page/limit aquí son del backend, independientes del paginado del front
        const data = await getContactForms({ page: 1, limit: 50 });

        // Si luego en el back agregas created_at,
        // aquí simplemente será parte de "data"
        setForms(data);
      } catch (err: any) {
        console.error(err);
        setError("Error al obtener formularios de contacto");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // 🔹 filtro en cliente por email o título
  const filtered = React.useMemo(() => {
    if (!query.trim()) return forms;
    const q = query.toLowerCase();
    return forms.filter(
      (f) =>
        f.email.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q)
    );
  }, [forms, query]);

  // 🔹 paginado en cliente
  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "answered":
        return "Respondido";
      case "in_progress":
        return "En proceso";
      default:
        return status;
    }
  };

  // 👉 Navegar al detalle usando el _id que viene del back
  const onView = (f: ContactFormRow) => {
    navigate(`/contacts/${f._id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
        spacing={1.5}
      >
        <Typography variant="h6" fontWeight={800}>
          Formularios de contacto
        </Typography>

        <TextField
          size="small"
          placeholder="Buscar por correo o título…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 260, width: { xs: "100%", sm: "auto" } }}
        />
      </Stack>

      <Paper variant="outlined">
        {loading && <LinearProgress />}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Correo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    (Sin resultados)
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((f) => (
                  <TableRow key={f._id} hover>
                    <TableCell>{f.email}</TableCell>
                    <TableCell>{f.title}</TableCell>
                    <TableCell>{translateStatus(f.status)}</TableCell>
                    {/* Por ahora, como el back no envía created_at, mostramos "-" */}
                    <TableCell>{formatDate(f.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => onView(f)}
                        aria-label="ver"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Filas por página"
        />
      </Paper>
    </Container>
  );
}
