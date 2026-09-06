import { useParams } from "react-router";
import { useIndexedDB } from "../shared/indexDBHook";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Card, CardActions, CardContent, Divider, Fab, Grid, IconButton, Modal, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpenseModal from "../components/Expense/ExpenseModal";
import dayjs from "dayjs";
import AddPoolModal from "../components/Expense/AddPoolModal";

export default function Trip() {
  const { id: expenseId } = useParams();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false)
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const { saveJSON, getJSON } = useIndexedDB();
  const expense = useRef({
    tripName: "",
    category: [],
    expenses: [],
  });
  const selectedExpenseIdx = useRef(null)
  const selectedExpense = useRef(null)

  async function loadTripExpense() {
    expense.current = { ...expense.current, ...await getJSON(expenseId) };
    expense.current.expenses.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  const handleDeleteExpense = async () => {
    if(selectedExpenseIdx.current == null) return;
    expense.current.expenses = expense.current.expenses.filter((val, i) => i != selectedExpenseIdx.current );
    await saveJSON(expenseId, JSON.stringify(expense.current));
    selectedExpenseIdx.current = null;
    setIsOpenDeleteModal(false)
  }

  const handleUpdateExpenseModalOpen = (idx) => {
    selectedExpense.current = expense.current.expenses[idx];
    selectedExpenseIdx.current = idx;
    if(selectedExpense.current.isExpense)
      setIsExpenseModalOpen(true);
    else
      setIsTopupModalOpen(true);
  }

  const handleExpenseModalClose = async (val) => {
    if (val == null) {
      setIsExpenseModalOpen(false);
      return;
    }

    if ((val.category != null || val.category.trim().length > 0) &&
      !expense.current.category.some(v => v == val.category)) {
      expense.current.category.push(val.category);
    }

    if (selectedExpenseIdx.current == null) {
      expense.current.expenses.push(val)
    } else {
      expense.current.expenses[selectedExpenseIdx.current] = val;
    }

    expense.current.expenses.sort((a, b) => {
      console.log(a.date, b.date);
      return new Date(b.date) - new Date(a.date)
    });

    await saveJSON(expenseId, JSON.stringify(expense.current));

    // firing last so it can update the UI
    setIsExpenseModalOpen(false);
    selectedExpenseIdx.current = null;
    selectedExpense.current = null
  }

  const handleTopupModalClose = async (val) => {
    if (val == null) {
      setIsTopupModalOpen(false);
      return
    }

    if (selectedExpenseIdx.current == null) {
      expense.current.expenses.push(val)
    } else {
      expense.current.expenses[selectedExpenseIdx.current] = val;
    }

    expense.current.expenses.sort((a, b) => {
      console.log(a.date, b.date);
      return new Date(b.date) - new Date(a.date)
    });

    await saveJSON(expenseId, JSON.stringify(expense.current));

    // firing last so it can update the UI
    setIsTopupModalOpen(false);
    selectedExpenseIdx.current = null;
    selectedExpense.current = null;
  }

  useEffect(() => {
    loadTripExpense();
  }, []);

  return (
    <>
      <Paper sx={{ padding: 2, position: "sticky", top: 0 }} elevation={2} >
        <Typography variant="h5">{expense.current.tripName}</Typography>
      </Paper>
      <Stack direction="row"
        sx={{
          marginTop: 2,
          justifyContent: "space-between",
          alignItems: "flex-end"
        }}>
        <Typography variant="h4" gutterBottom >
          Group Pool: ${
            expense.current.expenses.reduce((acc, curr) => {
              if (curr.isExpense == null || curr.isExpense)
                acc -= curr.total
              else
                acc += curr.total
              return acc;
            }, 0)
          }
        </Typography>
        <Typography variant="h4" gutterBottom >
          <IconButton onClick={() => { setIsTopupModalOpen(true) }}>
            < AddIcon />
          </IconButton>
        </Typography>
      </Stack>
      <Divider sx={{ marginBottom: 2 }} />
      {
        expense.current.expenses.map((expense, idx) =>
          <Box
            key={`${expense.description}-${idx}-${expense.date}`}
            sx={{ padding: 1 }}
            onClick={() => { handleUpdateExpenseModalOpen(idx) }}
          >
            <Stack direction="row" spacing={1}>
              <Box sx={{ bgcolor: "#7cbbff", padding: 1, maxWidth: "40px" }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.primary",
                    fontWeight: "700",
                    fontSize: "20px",
                    lineHeight: 1,
                  }}>
                  {dayjs(expense.date).format("MMM").toUpperCase()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.primary",
                    fontWeight: "700",
                    fontSize: "32px",
                    lineHeight: 1,
                  }}>
                  {dayjs(expense.date).format("DD")}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container>
                  <Grid size={8}>
                    <Typography
                      variant="h5"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                      component="div">
                      {expense.description}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{ textAlign: "right" }}
                      variant="h6" component="div"
                      color={(expense.isExpense == null || expense.isExpense) ?
                        "error" :
                        "success"}>
                      ${expense.total}
                    </Typography>
                  </Grid>
                </Grid>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-end"
                  }}>
                  <Typography gutterBottom sx={{ color: 'text.secondary' }}>
                    {expense.category}
                  </Typography>
                  <Button
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectedExpenseIdx.current = idx
                      setIsOpenDeleteModal(true)
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Stack>
            <Divider />
          </Box>
        )
      }

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: "20px", right: "20px" }}
        onClick={() => { setIsExpenseModalOpen(true) }}
      >
        <AddIcon />
      </Fab>

      {isExpenseModalOpen ? <ExpenseModal
        open={isExpenseModalOpen}
        expense={selectedExpense.current}
        category={expense.current.category}
        onClose={handleExpenseModalClose} /> : null}

      {isTopupModalOpen ? <AddPoolModal
        open={isTopupModalOpen}
        topUp={selectedExpense.current}
        onClose={handleTopupModalClose}
      /> : null}

      <Modal
        open={isOpenDeleteModal}
        onClose={() => {
          setIsOpenDeleteModal(false);
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
          <Typography variant="subtitle1">
            Are you sure you want to delete this item.
          </Typography>
          <Typography
            variant="caption"
            sx={{ marginBottom: 2, fontStyle: "italic" }}
          >
            Press anywhere else to dismiss this.
          </Typography>
          <Button
            sx={{ float: "right", marginTop: 1 }}
            variant="contained"
            onClick={handleDeleteExpense}
          >
            Delete
          </Button>
        </Box>
      </Modal>
    </>
  );
}
