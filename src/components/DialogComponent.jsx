import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const DialogComponent = ({ open, close, title, content, actions }) => {
  return (
    <>
      <Dialog open={open} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Dialog>
    </>
  );
};

export default DialogComponent;
