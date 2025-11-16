import * as React from "react";
import { Box, Button, Container, Stack, useTheme } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ViewListIcon from "@mui/icons-material/ViewList";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

type FooterProps = {
  createLabel?: string;
  createTo: string;
  otherLabel?: string;
  otherTo: string;
  userLabel?: string;
  userTo?: string;
};

export default function Footer({
  createLabel = "Crear sala",
  createTo,
  otherLabel = "Salas",
  otherTo,
  userLabel = "Nuevo usuario",
  userTo = "/register-user",
}: FooterProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        position: "sticky",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar + 1,
        pb: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            // Glassy bar
            bgcolor: (t) =>
              alpha(
                t.palette.mode === "dark"
                  ? t.palette.common.black
                  : t.palette.common.white,
                0.6
              ),
            backdropFilter: "saturate(160%) blur(14px)",
            border: (t) =>
              `1px solid ${alpha(t.palette.divider, 0.6)}`,
            borderRadius: 3,
            boxShadow:
              "0 8px 24px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08)",
            p: 1,
            mb: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={() => navigate(createTo)}
              startIcon={<AddCircleIcon />}
              sx={{
                borderRadius: 999,
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: 0.25,
                boxShadow: "0 6px 18px rgba(0,0,0,.20)",
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                {createLabel}
              </Box>
            </Button>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              onClick={() => navigate(otherTo)}
              startIcon={<ViewListIcon />}
              sx={{
                borderRadius: 999,
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: 0.25,
                borderColor: alpha(theme.palette.text.primary, 0.2),
                "&:hover": { borderColor: alpha(theme.palette.text.primary, 0.35) },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                {otherLabel}
              </Box>
            </Button>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              onClick={() => navigate(userTo)}
              startIcon={<PersonAddAlt1Icon />}
              sx={{
                borderRadius: 999,
                py: 1.1,
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: 0.25,
                borderColor: alpha(theme.palette.text.primary, 0.2),
                "&:hover": { borderColor: alpha(theme.palette.text.primary, 0.35) },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                {userLabel}
              </Box>
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
