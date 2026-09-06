import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import CreateableAutocomplete from "./CreatableAutocomplete";
import CurrencyField from "./CurrencyField";

export default function ExpenseModal({ open, expense, category, onClose }) {
  const expenseDesc = useRef(expense?.description ?? "");
  const totalExpense = useRef(expense?.total ?? 0);
  const expenseCategory = useRef(expense?.category ?? null);
  const expenseDate = useRef(expense?.date);

  const [disable, setDisable] = useState(false)
  const handleClose = () => {
    onClose(null);
  };

  const handleSave = () => {
    setDisable(true)
    const expense = {
      description: expenseDesc.current,
      total: totalExpense.current,
      category: expenseCategory.current,
      date: expenseDate.current,
      isExpense: true
    }
    onClose(expense);
  };

  return (
    <Modal
      open={open}
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
        <CreateableAutocomplete
          disabled={disable}
          defaultValue={expenseCategory.current}
          options={category}
          onChange={(val) => {
            expenseCategory.current = val
          }} />

        <TextField
          fullWidth
          label="Expense description"
          variant="outlined"
          sx={{ marginBottom: 1 }}
          disabled={disable}
          defaultValue={expenseDesc.current}
          onChange={(e) => {
            expenseDesc.current = e.target.value;
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disabled={disable}
            defaultValue={expenseDate.current != null? dayjs(expenseDate.current) : null}
            sx={{ marginBottom: 1 }}
            onChange={val => {
              expenseDate.current = val.toJSON()
            }}
          />
        </LocalizationProvider>
        <CurrencyField
          label="Total"
          disabled={disable}
          step={0.1}
          min={0}
          defaultValue={totalExpense.current}
          onValueChange={(val, e) => {
            totalExpense.current = val;
          }}
        />
        <Box sx={{ marginTop: 4 }}>

          <Button
            disabled={disable}
            sx={{ float: "right" }}
            variant="contained"
            onClick={handleSave}
          >
            {expense == null ? "Add Expense": "Update Expense"}
          </Button>
          <Button
            disabled={disable}
            sx={{ float: "right", marginRight: 1 }}
            variant="outlined"
            onClick={handleClose}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
