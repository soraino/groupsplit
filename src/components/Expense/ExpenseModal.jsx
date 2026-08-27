import {
  Autocomplete,
  Box,
  Button,
  FilledInput,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRef } from "react";

export default function ExpenseModal({ open, expense, category, onClose }) {
  const expenseName = useRef("");
  const totalExepnse = useRef("");

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
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
          Add new expense
        </Typography>

        <TextField
          fullWidth
          label="Category"
          variant="outlined"
          sx={{ marginBottom: 1 }}
          onChange={(e) => {
            expenseName.current = e.target.value;
          }}
        />
        <Autocomplete
          freeSolo
          resetHighlightOnMouseLeave
          options={category}
          renderInput={(params) => <TextField {...params} label="Category" />}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.title
          }
          // this demo demonstrates how the value parameter can be either an object (same type as option) or a string
          // it could become a string if, for example, you press "Enter" in the input field
          isOptionEqualToValue={(option, value) => {
            if (typeof value === "string") {
              return option.title === value;
            }
            return option.title === value.title;
          }}
        />

        <TextField
          fullWidth
          label="Expense description"
          variant="outlined"
          sx={{ marginBottom: 1 }}
          onChange={(e) => {
            expenseName.current = e.target.value;
          }}
        />
        <TextField
          label="Total"
          variant="outlined"
          sx={{ marginBottom: 1 }}
          onChange={(e) => {
            totalExepnse.current = e.target.value;
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker />
        </LocalizationProvider>
        <Button
          sx={{ float: "right", marginTop: 1 }}
          variant="contained"
          onClick={async () => {
            setOpen(false);
          }}
        >
          Add Expense
        </Button>
      </Box>
    </Modal>
  );
}
