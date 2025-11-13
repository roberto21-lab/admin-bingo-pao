// src/pages/Rooms.tsx
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    type SelectChangeEvent
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

type Row = {
  id: string;
  user: string;
  qty: number;
};

const MOCK_OPTIONS = ["Sala A (prueba)", "Sala B (prueba)", "Sala C (prueba)"];
const MOCK_ROWS: Row[] = [
  { id: "1", user: "María Pérez", qty: 5 },
  { id: "2", user: "Juan Gómez", qty: 2 },
  { id: "3", user: "Ana López", qty: 8 },
  { id: "4", user: "Carlos Ruiz", qty: 1 },
];

export default function Rooms() {
  const [room, setRoom] = React.useState(MOCK_OPTIONS[0]);
  const [rows, setRows] = React.useState<Row[]>(MOCK_ROWS);
const navigate = useNavigate();
  const handleChange = (e: SelectChangeEvent<string>) => {
    setRoom(e.target.value as string);
    setRows(MOCK_ROWS); // demo
  };

const onView = (r: Row) => navigate(`/purchase/${r.id}`);


  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Salas / Participantes
        </Typography>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Sala</InputLabel>
          <Select label="Sala" value={room} onChange={handleChange}>
            {MOCK_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Cantidad de cartones</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nombre del usuario</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  (Sin registros)
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.qty}</TableCell>
                  <TableCell>{r.user}</TableCell>
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
      </TableContainer>
    </Container>
  );
}
