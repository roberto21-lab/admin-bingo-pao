import * as React from "react";
import { Box, Button, Container, Stack } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useNavigate } from "react-router-dom";

type FooterProps = {
  createLabel?: string;
  createTo: string;
  otherLabel?: string;
  otherTo: string;
};

export default function Footer({
  createLabel = "Crear sala",
  createTo,
  otherLabel = "Ver salas",
  otherTo,
}: FooterProps) {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: "background.paper",
        py: 1.25,
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" spacing={1.25} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => navigate(createTo)}
          >
            {createLabel}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => navigate(otherTo)}
          >
            {otherLabel}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
