import { Modal, ModalDialog, DialogTitle, DialogContent, Button, Typography, Box } from "@mui/joy";

export default function AnnounceModal({ open, setOpen, announce }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; announce: string }) {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog layout="center" sx={{ minWidth: 300, p: 2 }}>

        <DialogContent>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              borderRadius: 1,
              p: 2,
              mb: 2,
              backgroundColor: "neutral.softBg",
            }}
          >
            <Typography level="h4" component="h3" textColor="neutral.900"
            sx={{
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}>
              {announce}
            </Typography>
          </Box>
          <Button onClick={() => setOpen(false)} variant="solid" color="primary">
            Close
          </Button>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};
