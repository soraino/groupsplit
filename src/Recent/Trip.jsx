import { useParams } from "react-router";
import { useIndexedDB } from "../shared/indexDBHook";
import { useEffect, useRef } from "react";
import { Box, Fab, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpenseModal from "../components/Expense/ExpenseModal";

export default function Trip() {
  const { id: expenseId } = useParams();
  const { saveJSON, getJSON } = useIndexedDB();

  const expense = useRef({
    tripName: "",
    category: [],
    expenses: [],
  });

  const loadTripExpense = async () => {
    expense.current = await getJSON(expenseId);
  };
  useEffect(() => {
    loadTripExpense();
  }, []);

  return (
    <>
      <Paper sx={{ padding: 2, position: "sticky", top: 0 }} elevation={2}>
        <Typography variant="h5">{expense.current.tripName}</Typography>
      </Paper>
      <Box></Box>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: "80px", right: "50px" }}
      >
        <AddIcon />
      </Fab>
      <ExpenseModal open={true} category={expense.current.category} onClose={() => {}}/>
    </>
  );
}
