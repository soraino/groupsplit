import React, { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import { Box, Stack, Typography } from '@mui/material';

export default function DateRangePicker({ onDateRangeChange, disabled }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const startDateObj = startDate ? dayjs(startDate) : null;
    const endDateObj = endDate ? dayjs(endDate) : null;

    const handleStartDateChange = (newDate) => {
        let finalStart = newDate;
        let finalEnd = endDateObj;

        // If end date exists and new start date is after it, swap them
        if (newDate && endDateObj && newDate.isAfter(endDateObj)) {
            finalStart = endDateObj;
            finalEnd = newDate;
        }

        setStartDate(finalStart);
        setEndDate(finalEnd);

        if (onDateRangeChange) {
            onDateRangeChange({
                startDate: finalStart?.toJSON(),
                endDate: finalEnd?.toJSON()
            });
        }
    };

    const handleEndDateChange = (newDate) => {
        let finalStart = startDateObj;
        let finalEnd = newDate;

        // If start date exists and new end date is before it, swap them
        if (newDate && startDateObj && newDate.isBefore(startDateObj)) {
            finalStart = newDate;
            finalEnd = startDateObj;
        }

        setStartDate(finalStart);
        setEndDate(finalEnd);

        if (onDateRangeChange) {
            onDateRangeChange({
                startDate: finalStart?.toJSON(),
                endDate: finalEnd?.toJSON()
            });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack>
                <Box>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                    >
                        Start date
                    </Typography>
                    <DatePicker
                        value={startDate}
                        onChange={handleStartDateChange}
                        disabled={disabled}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                            },
                        }}
                    />
                </Box>

                <Box sx={{ marginTop: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                    >
                        End date
                    </Typography>
                    <DatePicker
                        value={endDate}
                        onChange={handleEndDateChange}
                        disabled={disabled}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                            },
                        }}
                    />
                </Box>
            </Stack>
        </LocalizationProvider>
    );
}