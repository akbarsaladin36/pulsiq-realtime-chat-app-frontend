import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const DialogComponent = ({
  open,
  close,
  title,
  content,
  actions,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Dialog>
    </>
  );
};

export default DialogComponent;
