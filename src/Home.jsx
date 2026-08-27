import {
  Paper,
  Typography,
  Box,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
} from "@mui/material";
import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useIndexedDB } from "./shared/indexDBHook";

export default function Home() {
  const participants = useRef([]);
  const participantInput = useRef("");
  const tripName = useRef("");
  const [open, setOpen] = useState(false);
  const [_, updateUI] = useState(Date.now);

  const { saveJSON } = useIndexedDB();

  const StartTrip = async () => {
    participants.current.push("Tang Family");
    const newTripJson = {
      tripName: tripName.current,
      participants: participants.current,
      groupPot: 0,
      expenses:[]
    };
    await saveJSON(uuid(), JSON.stringify(newTripJson));
  };

  return (
    <>
      <Paper sx={{ padding: 2 }} elevation={2}>
        <Typography variant="h5">New Trip</Typography>
      </Paper>
      <Box sx={{ marginTop: 2, paddingX: 1 }}>
        <TextField
          fullWidth
          label="Trip Name"
          variant="outlined"
          onChange={(e) => {
            tripName.current = e.target.value;
          }}
        />
        <TableContainer component={Paper} sx={{ marginY: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participant Name</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  Group Pot
                </TableCell>
                <TableCell component="th" scope="row">
                  <Button variant="contained" color="error" disabled>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  Tang Family
                </TableCell>
                <TableCell component="th" scope="row">
                  <Button variant="contained" color="error" disabled>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
              {participants.current.map((p, index) => (
                <TableRow key={index + "" + p}>
                  <TableCell component="th" scope="row">
                    {p}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        participants.current = participants.current.filter(
                          (_, i) => index != i
                        );
                        updateUI(Date.now);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          sx={{
            float: "right",
            position: "sticky",
            bottom: "80px",
            marginLeft: 2,
          }}
          variant="contained"
          onClick={StartTrip}
        >
          Start Trip
        </Button>
        <Button
          sx={{ float: "right", position: "sticky", bottom: "80px" }}
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          Add Participant
        </Button>
      </Box>
      <Modal
        open={open}
        onClose={() => {
          participantInput.current = "";
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
            Add new participant
          </Typography>
          <TextField
            fullWidth
            label="Participant Name"
            variant="outlined"
            onChange={(e) => {
              participantInput.current = e.target.value;
            }}
          />
          <Button
            sx={{ float: "right", marginTop: 1 }}
            variant="contained"
            onClick={() => {
              participants.current.push(participantInput.current);
              console.log(participants.current);
              participantInput.current = "";
              setOpen(false);
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </>
  );
}
