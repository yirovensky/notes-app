import { Alert, Snackbar } from "@mui/material";

interface Props {
  message: string | null;
  onClose: () => void;
}

export default function ErrorSnackbar({ message, onClose }: Props) {
  return (
    <Snackbar
      open={message !== null}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="error" variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}