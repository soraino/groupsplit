import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { useIndexedDB } from "../shared/indexDBHook";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Fab } from "@mui/material";
import NewTripModal from "../components/NewTrip/NewTripModal";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";

export default function Recent() {
  const { getAllFiles, deleteJSON } = useIndexedDB();
  const navigate = useNavigate();
  const [tripsArr, setTripsArr] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openNewTripModal, setOpenNewTripModal] = useState(false);

  const currTripId = useRef("");

  const loadTrips = async () => {
    const trips = await getAllFiles();
    setTripsArr(trips);
  };

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
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6">{t.tripName}</Typography>
                <Typography variant="subtitle1">
                  Participants: {t.participants.join(", ")}
                </Typography>
              </CardContent>
              <CardActions sx={{ flexDirection: "row-reverse" }}>
                <Button
                  color="error"
                  onClick={() => {
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
      >
        <AssignmentAddIcon sx={{ mr: 1 }} />
        New Trip
      </Fab>
      <NewTripModal
        open={openNewTripModal}
        onClose={() => setOpenNewTripModal(false)}
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
