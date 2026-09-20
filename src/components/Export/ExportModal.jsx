import { useRef, useState } from "react";
import { useIndexedDB } from "../../shared/indexDBHook";
import { Box, Button, Modal, Typography } from "@mui/material";
import DateRangePicker from "./DateRangePicker";
import { jsPDF } from "jspdf";
import { applyPlugin } from 'jspdf-autotable'
import dayjs from "dayjs";

export default function ExportModal({ open, tripId, onClose }) {

    const [dateRange, setDateRange] = useState({});

    const { getJSON } = useIndexedDB();

    const handleClose = () => {
        onClose();
    }
    const handleExport = () => {
        handleShare(tripId);
    }

    const handleDateRangeChange = (val) => {
        setDateRange(val)
    }

    async function handleShare(tripId) {
        const tripData = await getJSON(tripId);
        const prepData = prepExportData(tripData);
        const pdf = createPdf(prepData,
            dateRange.startDate,
            dateRange.endDate,
            tripData.tripName,
            tripData.currency
        )

        const pdfFile = new File(
            [pdf.output("blob")],
            `${tripData.tripName} expense.pdf`,
            { type: 'application/pdf' });

        const canShareActualFile = navigator.canShare && navigator.canShare({ files: [pdfFile] });

        if (canShareActualFile) {
            try {
                await navigator.share({ title: "Expense excel", files: [pdfFile] });
                return;
            } catch (e) {
                console.log(e);
                console.log("Can't share for some reason default to download");
            }
        }

        const blob = new Blob([pdf.output("blob")], { type: 'application/pdf' });
        // Create Blob and download link  
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tripData.tripName} expense.xlsx`;
        a.click();

        // Cleanup  
        URL.revokeObjectURL(url);
    }

    function prepExportData(tripData) {

        tripData.expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

        const tables = tripData.expenses.reduce((acc, curr) => {
            if (!acc.ret[curr.date]) {
                acc.ret[curr.date] = {
                    topups: [],
                    expenses: [],
                    leftovers: acc.leftovers
                }
            }

            if (curr.isExpense) {
                acc.ret[curr.date].expenses.push(curr)
                acc.ret[curr.date].leftovers += -curr.total
                acc.leftovers += -curr.total
            } else {
                acc.ret[curr.date].topups.push(curr)
                acc.ret[curr.date].leftovers += curr.total
                acc.leftovers += curr.total
            }

            return acc;
        }, { ret: {}, leftovers: 0 }).ret;
        return tables;
    }

    function createPdf(prepData, startDate, endDate, tripName, currency) {
        const PageConfig = {
            page: {
                width: 210,
                height: 297,
                format: "a4",
                unit: "mm",
                orientation: "portrait",
            },
            margins: { top: 20, left: 20, right: 20, bottom: 20 },
            colors: {
                primary: [43, 118, 192],
                text: [0, 0, 0],
                muted: [150, 150, 150],
                border: [222, 226, 230],
                bgLight: [248, 249, 250],
            },
            fonts: { default: 12, small: 8, medium: 10, large: 16, title: 20 },
        };
        applyPlugin(jsPDF)
        const pdfDoc = new jsPDF({
            orientation: PageConfig.page.orientation,
            unit: PageConfig.page.unit,
            format: PageConfig.page.format,
        });

        let yPosition = PageConfig.margins.top;

        // Title setting
        pdfDoc.setFontSize(PageConfig.fonts.title);
        yPosition += 2;
        pdfDoc.text(tripName, PageConfig.margins.left, yPosition);
        yPosition += 13;

        let prevDayTotal = 0;
        Object.keys(prepData).forEach((date) => {
            if (new Date(date) < new Date(startDate) || new Date(date) > new Date(endDate)) {
                prevDayTotal = prepData[date].leftovers;
                return;
            }

            // Normal text size and color
            pdfDoc.setFont(undefined, "normal");
            pdfDoc.setFontSize(PageConfig.fonts.medium);
            pdfDoc.setTextColor(...PageConfig.colors.text);
            pdfDoc.text(`Date: ${dayjs(date).format("MMMM DD, YYYY (dddd)")}`, PageConfig.margins.left, yPosition);

            const prevTotalText = `Previous total: ${prevDayTotal} ${currency}`;
            const textWidth = pdfDoc.getTextWidth(prevTotalText);
            const rightColumnX = (PageConfig.page.width - (textWidth + PageConfig.margins.right));
            pdfDoc.text(prevTotalText, rightColumnX, yPosition);
            yPosition += 5;

            const tableContent = [];
            prepData[date].topups.forEach((e) => {
                tableContent.push([
                    e.description,
                    "top up",
                    e.total]
                )
            })
            prepData[date].expenses.forEach((e) => {
                tableContent.push([
                    e.description,
                    e.category,
                    -e.total]
                )
            })

            pdfDoc.autoTable({
                startY: yPosition,
                head: [["Description", "Category", "Total"]],
                body: tableContent,
                theme: "striped",
                margin: { ...PageConfig.margins },
                headStyles: {
                    fillColor: PageConfig.colors.primary,
                    textColor: 255,
                    fontStyle: "bold",
                },
                styles: {
                    fontSize: PageConfig.fonts.medium,
                    cellPadding: 5,
                },
                columnStyles: {
                    2: { halign: "right" }
                },
            });
            yPosition = pdfDoc.lastAutoTable.finalY + 10;
            const rightMargin = PageConfig.page.width - PageConfig.margins.right;

            pdfDoc.setFontSize(PageConfig.fonts.default);
            pdfDoc.setFont(undefined, "bold");
            pdfDoc.setTextColor(...PageConfig.colors.text);
            pdfDoc.text(`Total pool leftover: ${prepData[date].leftovers} ${currency}`, rightMargin, yPosition, { align: "right" });

            prevDayTotal = prepData[date].leftovers;

            const totalPageLeft = yPosition % (PageConfig.page.height - (PageConfig.margins.top + PageConfig.margins.bottom));
            if (totalPageLeft > 15)
                yPosition += 15

            else
                yPosition += totalPageLeft + (PageConfig.margins.top + PageConfig.margins.bottom)
        })
        return pdfDoc;
    }

    return <Modal
        open={open}
        onClose={onClose}
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
                Export expenses
            </Typography>

            <DateRangePicker
                onDateRangeChange={handleDateRangeChange}
            />
            <Box sx={{ marginTop: 4 }}>

                <Button
                    disabled={dateRange.startDate == null || dateRange.endDate == null}
                    sx={{ float: "right" }}
                    variant="contained"
                    onClick={handleExport}
                >
                    Export
                </Button>
            </Box>
        </Box>
    </Modal>
}