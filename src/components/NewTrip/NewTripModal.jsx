import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { v4 as uuid } from "uuid";
import { useIndexedDB } from "../../shared/indexDBHook";
import { useRef } from "react";

export default function NewTripModal(open, onClose) {
  const tripName = useRef("");
  const { saveJSON } = useIndexedDB();

  const handleSave = async () => {
    const newTripJson = {
      tripName: tripName.current,
      expenses: [],
    };
    await saveJSON(uuid(), JSON.stringify(newTripJson));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        tripName.current = "";
        onClose();
      }}
    >
      <Box
        sx={{
          padding: 3,
          width: "80%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Add new trip
        </Typography>
        <TextField
          fullWidth
          label="Trip Name"
          variant="outlined"
          sx={{ marginBottom: 2 }}
          onChange={(e) => {
            tripName.current = e.target.value;
          }}
        />
        <Button variant="contained" sx={{ float: "right" }} onClick={handleSave}>
          Add trip
        </Button>
      </Box>
    </Modal>
  );
}
