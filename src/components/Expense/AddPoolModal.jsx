import { Box, Button, Modal, Typography } from "@mui/material";
import { useRef, useState } from "react";
import CurrencyField from "./CurrencyField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function AddPoolModal({ open, topUp, onClose }) {
    const topUpDate = useRef(topUp?.date);
    const totalTopUp = useRef(topUp?.total ?? 0);

    const [disable, setDisable] = useState(false);

    const handleClose = () => {
        onClose(null);
    }

    const handleSave = () => {
        setDisable(true);
        const topUp = {
            description: "Top up",
            date: topUpDate.current,
            total: totalTopUp.current,
            isExpense: false
        }
        onClose(topUp)
    }

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
                    Top up
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        disabled={disable}
                        defaultValue={topUpDate.current != null ? dayjs(topUpDate.current) : null}
                        sx={{ marginBottom: 1 }}
                        onChange={val => {
                            topUpDate.current = val.toJSON()
                        }}
                    />
                </LocalizationProvider>
                <CurrencyField
                    label="Total"
                    disabled={disable}
                    step={0.1}
                    min={0}
                    defaultValue={totalTopUp.current}
                    onValueChange={(val, e) => {
                        totalTopUp.current = val;
                    }}
                />
                <Box sx={{ marginTop: 4 }}>

                    <Button
                        disabled={disable}
                        sx={{ float: "right" }}
                        variant="contained"
                        onClick={handleSave}
                    >
                        {topUp == null ? "Top up" : "Update Top up"}
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
    )
}