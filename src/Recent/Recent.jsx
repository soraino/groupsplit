import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useIndexedDB } from "../shared/indexDBHook";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Fab } from "@mui/material";
import NewTripModal from "../components/NewTrip/NewTripModal";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import { ShareOutlined } from "@mui/icons-material";
import * as ExcelJs from "exceljs";

export default function Recent() {
  const { getAllFiles, deleteJSON, getJSON } = useIndexedDB();
  const navigate = useNavigate();
  const [tripsArr, setTripsArr] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openNewTripModal, setOpenNewTripModal] = useState(false);

  const currTripId = useRef("");

  const loadTrips = async () => {
    const trips = await getAllFiles();
    setTripsArr(trips);
  };

  const handleNewTripModalClose = (id) => {
    setOpenNewTripModal(false)
    if (id != null) {
      navigate(`trip/${id}`);
    }
  }

  async function handleShareExcel(tripId) {
    const tripData = await getJSON(tripId);
    const excelData = createExcelData(tripData);
    const excelDataBuffer = await excelData.xlsx.writeBuffer();

    if (!canBrowserShareFiles()) {
      const blob = new Blob([excelDataBuffer], { type: 'application/octet-stream' });
      // Create Blob and download link  
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test.xlsx';
      a.click();

      // Cleanup  
      URL.revokeObjectURL(url);
      return;
    }
    const excelFile = new File(
      [excelDataBuffer],
      `${tripData.tripName} expense.xlsx`,
      { type: 'application/octet-stream' })
    await navigator.share({ title: "Expense excel", files: [excelFile] });

  }
  
  function canBrowserShareFiles() {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    // Create some test data with a file, to check if the browser supports
    // sharing it.
    const testFile = new File(["foo"], "foo.txt", { type: "text/plain" });
    const data = { files: [testFile] };

    return navigator.canShare(data);
  }

  function createExcelData(tripData) {

    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");
    worksheet.addRow([`${tripData.tripName} Expenses`]);

    // creating the header
    const headerRow = worksheet.addRow(["Date", "Category", "Description", "Total"]);
    tripData.expenses.forEach(e => {

      worksheet.addRow([
        new Date(e.date),
        e.isExpense ? e.category : "top up",
        e.description,
        e.isExpense ? -e.total : e.total])
    });
    const totalCell = worksheet.getCell(`D${worksheet.rowCount + 1}`);
    totalCell.value = { formula: `SUM(D3:D${tripData.expenses.length + 2})` };

    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    totalCell.font = { bold: true };
    worksheet.getColumn('A').numFmt = 'dd-mm-yyyy'; // Date  
    worksheet.getColumn('D').numFmt = `#,##0.00 "${tripData.currency}"`; // Currency  
    return workbook;
  }

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <>
      <Paper sx={{ padding: 2, position: "sticky", top: 0 }} elevation={2}>
        <Typography variant="h5">Recents</Typography>
      </Paper>
      <Box sx={{ marginTop: 2, paddingX: 1 }}>
        {tripsArr.map((t) => {
          return (
            <Card
              variant="outlined"
              key={t.id}
              onClick={() => {
                navigate(`trip/${t.id}`);
              }}
            >
              <CardContent sx={{ height: "100%" }} >
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="h6">{t.tripName}</Typography>
                  <IconButton onClick={(e) => {
                    e.stopPropagation();
                    handleShareExcel(t.id);
                  }}>
                    <ShareOutlined />
                  </IconButton>
                </Stack>
              </CardContent>
              <CardActions sx={{ flexDirection: "row-reverse" }}>
                <Button
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDeleteModal(true);
                    currTripId.current = t.id;
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>
      <Fab
        variant="extended"
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: "80px", right: "50px" }}
        onClick={() => setOpenNewTripModal(true)}
      >
        <AssignmentAddIcon sx={{ mr: 1 }} />
        New Trip
      </Fab>
      <NewTripModal
        open={openNewTripModal}
        onClose={(id) => {
          handleNewTripModalClose(id)
        }}
      />
      <Modal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
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
            Are you sure you want to delete this trip.
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
            onClick={async () => {
              await deleteJSON(currTripId.current);
              setOpenDeleteModal(false);
              await loadTrips();
            }}
          >
            Delete
          </Button>
        </Box>
      </Modal>
    </>
  );
}
