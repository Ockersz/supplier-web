import React, { useLayoutEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Collapse,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { format } from "date-fns";
import Joyride, { STATUS, EVENTS } from "react-joyride";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const LatexOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [latexOrders, setLatexOrders] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [subRows, setSubRows] = useState({});
  const [subRowSnapshots, setSubRowSnapshots] = useState({});
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const fetchLatexOrders = async () => {
      try {
        const response = await axiosInstance.get("/latex-orders");
        if (response.status === 200) {
          const data = response.data;
          setLatexOrders(data);

          const initialSubRows = {};
          const initialSnapshots = {};

          data.forEach((order) => {
            const orderNum = order.num;
            const rows = (order.ltxinfor || []).map((info) => ({
              id: info.id,
              date: new Date(info.date),
              companyId: info.companyId || 3,
              orderNumber: info.ponum || orderNum,
              tankNumber: info.tnkno || "",
              quantity: info.qty || "",
              productionDate: new Date(info.proddate),
              tsc: info.tsc || "",
              drc: info.drc || "",
              vfa: info.vfano || "",
              ph: info.ph || "",
              nh3: info.ammonia || "",
              mst: info.mst || "",
            }));

            initialSubRows[orderNum] = rows;
            initialSnapshots[orderNum] = rows.map((r) => ({ ...r }));
          });

          setSubRows(initialSubRows);
          setSubRowSnapshots(initialSnapshots);
        } else {
          toast.error("Failed to fetch Latex Orders.");
        }
      } catch (err) {
        console.error("Error fetching:", err);
        toast.error("Failed to fetch Latex Orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatexOrders();
  }, []);

  const toggleRow = (num) => {
    setExpandedRows((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const handleAddSubRow = (orderNum) => {
    const newRow = {
      id: null,
      date: new Date(),
      companyId: 3, // Default company ID
      orderNumber: orderNum,
      tankNumber: "",
      quantity: "",
      productionDate: null,
      tsc: "",
      drc: "",
      vfa: "",
      ph: "",
      nh3: "",
      mst: "",
    };

    setSubRows((prev) => ({
      ...prev,
      [orderNum]: [...(prev[orderNum] || []), newRow],
    }));

    setSubRowSnapshots((prev) => ({
      ...prev,
      [orderNum]: [...(prev[orderNum] || []), { ...newRow }],
    }));
  };

  const handleSubRowChange = async (orderNum, index, field, value) => {
    const updated = [...(subRows[orderNum] || [])];
    updated[index][field] = value;
    setSubRows((prev) => ({ ...prev, [orderNum]: updated }));
  };
  const handleDeleteSubRow = (orderNum, index) => {
    const row = subRows[orderNum]?.[index];

    if (!row) return;

    // Case: New unsaved row (no ID) — remove directly
    if (!row.id) {
      const updated = [...(subRows[orderNum] || [])];
      updated.splice(index, 1);
      setSubRows((prev) => ({ ...prev, [orderNum]: updated }));

      const snapshot = [...(subRowSnapshots[orderNum] || [])];
      snapshot.splice(index, 1);
      setSubRowSnapshots((prev) => ({ ...prev, [orderNum]: snapshot }));
    } else {
      // Case: Existing row with ID — send delete request
      axiosInstance
        .post("/latex-orders/delete-sub-row", { id: row.id })
        .then((res) => {
          if (res.status === 200) {
            const updated = [...(subRows[orderNum] || [])];
            updated.splice(index, 1);
            setSubRows((prev) => ({ ...prev, [orderNum]: updated }));

            const snapshot = [...(subRowSnapshots[orderNum] || [])];
            snapshot.splice(index, 1);
            setSubRowSnapshots((prev) => ({ ...prev, [orderNum]: snapshot }));

            toast.success("Row deleted successfully.");
          } else {
            toast.error("Failed to delete row.");
          }
        })
        .catch((err) => {
          console.error("Error deleting row:", err);
          toast.error("Error deleting row.");
        });
    }
  };

  const handleSaveSubRow = async (orderNum, row, index) => {
    try {
      const payload = {
        id: row.id,
        companyId: 3,
        ponum: row.orderNumber,
        itemmasterId:
          latexOrders.find((o) => o.num === orderNum)?.itemmasterId || null,
        date: format(row.date, "yyyy-MM-dd"),
        tnkno: row.tankNumber,
        proddate: format(row.productionDate, "yyyy-MM-dd"),
        qty: row.quantity,
        tsc: row.tsc,
        drc: row.drc,
        vfano: row.vfa,
        ph: row.ph,
        ammonia: row.nh3,
        mst: row.mst,
      };

      const url = "/latex-orders/save-sub-row";

      const response = await axiosInstance.post(url, payload);

      if (response.status === 200 && response.data?.ltxinfor) {
        const newRow = {
          id: response.data.ltxinfor.id,
          date: new Date(response.data.ltxinfor.date),
          orderNumber: orderNum,
          tankNumber: response.data.ltxinfor.tnkno || "",
          quantity: response.data.ltxinfor.qty || "",
          productionDate: new Date(response.data.ltxinfor.proddate),
          tsc: response.data.ltxinfor.tsc || "",
          drc: response.data.ltxinfor.drc || "",
          vfa: response.data.ltxinfor.vfano || "",
          ph: response.data.ltxinfor.ph || "",
          nh3: response.data.ltxinfor.ammonia || "",
          mst: response.data.ltxinfor.mst || "",
        };

        const updated = [...(subRows[orderNum] || [])];
        updated[index] = newRow;
        setSubRows((prev) => ({ ...prev, [orderNum]: updated }));

        const updatedSnapshot = [...(subRowSnapshots[orderNum] || [])];
        updatedSnapshot[index] = { ...newRow };
        setSubRowSnapshots((prev) => ({
          ...prev,
          [orderNum]: updatedSnapshot,
        }));

        toast.success("Row saved successfully.");
      } else {
        toast.error("Failed to save row.");
      }
    } catch (err) {
      console.error("Error saving row:", err);
      toast.error("Error saving row.");
    }
  };

  const handleSaveAll = async () => {
    const dirtyRows = [];
    const dirtyIndexes = [];

    Object.keys(subRows).forEach((orderNum) => {
      subRows[orderNum].forEach((row, index) => {
        const snapshot = subRowSnapshots[orderNum]?.[index];
        if (JSON.stringify(row) !== JSON.stringify(snapshot)) {
          dirtyRows.push({ ...row });
          dirtyIndexes.push({ orderNum, index });
        }
      });
    });

    if (dirtyRows.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    const formattedRows = dirtyRows.map((row) => ({
      id: row.id,
      companyId: 3,
      ponum: row.orderNumber,
      itemmasterId:
        latexOrders.find((o) => o.num === row.orderNumber)?.itemmasterId ||
        null,
      date: format(row.date, "yyyy-MM-dd"),
      tnkno: row.tankNumber,
      proddate: format(row.productionDate, "yyyy-MM-dd"),
      qty: row.quantity,
      tsc: row.tsc,
      drc: row.drc,
      vfano: row.vfa,
      ph: row.ph,
      ammonia: row.nh3,
      mst: row.mst,
    }));

    try {
      const response = await axiosInstance.post(
        "/latex-orders/save-batch-sub-rows",
        formattedRows
      );

      if (response.status === 200 && Array.isArray(response.data?.ltxinfor)) {
        const refreshedSubRows = { ...subRows };
        const refreshedSnapshots = { ...subRowSnapshots };

        response.data.ltxinfor.forEach((info) => {
          const orderNum = info.ponum;
          const updatedRow = {
            id: info.id,
            date: info.date ? new Date(info.date) : null,
            orderNumber: orderNum,
            tankNumber: info.tnkno || "",
            quantity: info.qty || "",
            productionDate: info.proddate ? new Date(info.proddate) : null,
            tsc: info.tsc || "",
            drc: info.drc || "",
            vfa: info.vfano || "",
            ph: info.ph || "",
            nh3: info.ammonia || "",
            mst: info.mst || "",
          };

          const index = subRows[orderNum]?.findIndex((r) => r.id === info.id);
          if (index !== -1) {
            refreshedSubRows[orderNum][index] = updatedRow;
            refreshedSnapshots[orderNum][index] = { ...updatedRow };
          }
        });

        setSubRows(refreshedSubRows);
        setSubRowSnapshots(refreshedSnapshots);

        toast.success("All changes saved.");
      } else {
        toast.error("Failed to save all changes.");
      }
    } catch (err) {
      console.error("Batch save failed:", err);
      toast.error("Error saving changes.");
    }
  };

  const isRowDirty = (orderNum, index) => {
    const current = subRows[orderNum]?.[index];
    const snapshot = subRowSnapshots[orderNum]?.[index];
    if (!current || !snapshot) return true;
    return JSON.stringify(current) !== JSON.stringify(snapshot);
  };

  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourAddedRow, setTourAddedRow] = useState(null); // For cleanup after tour

  const steps = [
    {
      target: "#latex-order-title",
      content: "This is where all your latex orders are listed.",
    },
    {
      target: ".expand-icon-btn",
      content: "Click here to expand a row and view more details.",
    },
    {
      target: ".add-subrow-btn",
      content: "Click here to add a new sub row entry for this order.",
    },
    {
      target: ".subrow-input",
      content: "Fill in the latex tank details in each input field.",
    },
    {
      target: ".save-row-btn",
      content: "Click 'Save' to store the sub row entry.",
    },
  ];

  const handleJoyrideCallback = ({ type, status, index }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED, STATUS.PAUSED].includes(status)) {
      if (tourAddedRow) {
        const { orderNum, index } = tourAddedRow;

        const updated = [...(subRows[orderNum] || [])];
        updated.splice(index, 1);
        setSubRows((prev) => ({ ...prev, [orderNum]: updated }));

        const snapshot = [...(subRowSnapshots[orderNum] || [])];
        snapshot.splice(index, 1);
        setSubRowSnapshots((prev) => ({ ...prev, [orderNum]: snapshot }));

        setTourAddedRow(null);
      }

      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER && index === 0) {
      const expandBtn = document.querySelectorAll(".expand-icon-btn")?.[0];
      expandBtn?.click();

      const waitForExpanded = setInterval(() => {
        const addBtn = document.querySelector(".add-subrow-btn");
        if (addBtn) {
          clearInterval(waitForExpanded);

          const orderNum = latexOrders[0]?.num;
          const subRowList = subRows[orderNum] || [];

          if (subRowList.length === 0) {
            addBtn.click();

            // Wait a bit to ensure state is updated
            setTimeout(() => {
              const updatedSubRows = subRows[orderNum] || [];
              setTourAddedRow({
                orderNum,
                index: updatedSubRows.length - 1, // Fix here
              });
            }, 300);
          }

          setStepIndex(1);
        }
      }, 200);
    }

    if (type === EVENTS.STEP_AFTER && index === 1) {
      setStepIndex(2);
    }

    if (type === EVENTS.STEP_AFTER && index === 2) {
      setStepIndex(3);
    }

    if (type === EVENTS.STEP_AFTER && index === 3) {
      setStepIndex(4);
    }

    if (type === EVENTS.STEP_AFTER && index === 4) {
      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
      setStepIndex(0);
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      if (tourAddedRow) {
        const { orderNum, index } = tourAddedRow;

        const updated = [...(subRows[orderNum] || [])];
        updated.splice(index, 1);
        setSubRows((prev) => ({ ...prev, [orderNum]: updated }));

        const snapshot = [...(subRowSnapshots[orderNum] || [])];
        snapshot.splice(index, 1);
        setSubRowSnapshots((prev) => ({ ...prev, [orderNum]: snapshot }));

        setTourAddedRow(null);
      }

      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography id="latex-order-title" variant="h5" gutterBottom>
            Latex Orders
          </Typography>
          <IconButton onClick={() => setRunTour(true)} aria-label="help">
            <HelpOutlineIcon />
          </IconButton>
        </Box>
        {!loading && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAll}
              disabled={Object.keys(subRows).length === 0}
            >
              Save All Changes
            </Button>
          </Box>
        )}
        {loading ? (
          <CircularProgress />
        ) : isMobile ? (
          <Box>
            {latexOrders.map((order) => (
              <Card key={order.num} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={10}>
                      <Typography variant="subtitle1">
                        Order #{order.num}
                      </Typography>
                      <Typography variant="body2">{order.itmdesc}</Typography>
                    </Grid>
                    <Grid item xs={2} textAlign="right">
                      <IconButton onClick={() => toggleRow(order.num)}>
                        {expandedRows[order.num] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Collapse
                    in={expandedRows[order.num]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Divider sx={{ my: 1 }} />
                    {(subRows[order.num] || []).map((row, j) => (
                      <Box key={j} sx={{ mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <DatePicker
                              label="Date"
                              value={row.date}
                              onChange={(newVal) =>
                                handleSubRowChange(order.num, j, "date", newVal)
                              }
                              renderInput={(params) => (
                                <TextField {...params} fullWidth />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <DatePicker
                              label="Production Date"
                              value={row.productionDate}
                              onChange={(newVal) =>
                                handleSubRowChange(
                                  order.num,
                                  j,
                                  "productionDate",
                                  newVal
                                )
                              }
                              renderInput={(params) => (
                                <TextField {...params} fullWidth />
                              )}
                            />
                          </Grid>
                          {Object.entries(row).map(([field, value]) =>
                            field !== "date" &&
                            field !== "productionDate" &&
                            field !== "orderNumber" ? (
                              <Grid item xs={6} key={field}>
                                <TextField
                                  fullWidth
                                  label={field.toUpperCase()}
                                  value={value}
                                  onChange={(e) =>
                                    handleSubRowChange(
                                      order.num,
                                      j,
                                      field,
                                      e.target.value
                                    )
                                  }
                                />
                              </Grid>
                            ) : null
                          )}
                          <Grid item xs={12} textAlign="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                disabled={!isRowDirty(order.num, j)}
                                onClick={() =>
                                  handleSaveSubRow(order.num, row, j)
                                }
                              >
                                Save
                              </Button>
                              <Button
                                color="error"
                                size="small"
                                onClick={() => handleDeleteSubRow(order.num, j)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Box textAlign="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddSubRow(order.num)}
                      >
                        Add Row
                      </Button>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Order #</TableCell>
                  <TableCell>Item Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Received</TableCell>
                  <TableCell align="right">Pending</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latexOrders.map((order, i) => (
                  <React.Fragment key={i}>
                    <TableRow hover onClick={() => toggleRow(order.num)}>
                      <TableCell>
                        <IconButton className="expand-icon-btn">
                          {expandedRows[order.num] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{order.num}</TableCell>
                      <TableCell>{order.itmdesc}</TableCell>
                      <TableCell align="right">
                        {Number(order.qty).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {Number(order.received_qty).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {Number(order.diff).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedRows[order.num]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mb: 2,
                              }}
                            >
                              <Button
                                className="add-subrow-btn"
                                variant="outlined"
                                onClick={() => handleAddSubRow(order.num)}
                              >
                                Add Row
                              </Button>
                            </Box>
                            {(subRows[order.num] || []).length > 0 && (
                              <LocalizationProvider
                                dateAdapter={AdapterDateFns}
                              >
                                <TableContainer
                                  component={Paper}
                                  sx={{ mb: 2 }}
                                >
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        {[
                                          "Date",
                                          "Order #",
                                          "Latex Tank No",
                                          "Qty (Kg)",
                                          "Production Date",
                                          "TSC",
                                          "DRC",
                                          "VFA No",
                                          "PH",
                                          "NH3 %",
                                          "MST (sec)",
                                          "Actions",
                                        ].map((col) => (
                                          <TableCell key={col}>{col}</TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {subRows[order.num]
                                        .filter((row) => row.companyId !== 300) // Exclude deleted rows
                                        .map((row, j) => (
                                          <TableRow key={j}>
                                            {Object.entries(row).map(
                                              ([field, value]) => {
                                                if (
                                                  field === "id" ||
                                                  field === "companyId" ||
                                                  field === "itemmasterId" ||
                                                  field === "num" ||
                                                  field === "companyName"
                                                ) {
                                                  return null; // Skip id and orderNumber
                                                }
                                                if (
                                                  field === "date" ||
                                                  field === "productionDate"
                                                ) {
                                                  return (
                                                    <TableCell key={field}>
                                                      <DatePicker
                                                        value={value}
                                                        onChange={(newVal) =>
                                                          handleSubRowChange(
                                                            order.num,
                                                            j,
                                                            field,
                                                            newVal
                                                          )
                                                        }
                                                        renderInput={(
                                                          params
                                                        ) => (
                                                          <TextField
                                                            {...params}
                                                            variant="standard"
                                                            size="small"
                                                          />
                                                        )}
                                                        format="dd/MM/yyyy"
                                                        className="subrow-input"
                                                      />
                                                    </TableCell>
                                                  );
                                                }
                                                return (
                                                  <TableCell key={field}>
                                                    <TextField
                                                      variant="standard"
                                                      className="subrow-input"
                                                      size="small"
                                                      value={value}
                                                      onChange={(e) =>
                                                        handleSubRowChange(
                                                          order.num,
                                                          j,
                                                          field,
                                                          e.target.value
                                                        )
                                                      }
                                                      disabled={
                                                        field === "orderNumber"
                                                      }
                                                    />
                                                  </TableCell>
                                                );
                                              }
                                            )}
                                            <TableCell>
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                              >
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  color="primary"
                                                  className="save-row-btn"
                                                  disabled={
                                                    !isRowDirty(order.num, j)
                                                  }
                                                  onClick={() =>
                                                    handleSaveSubRow(
                                                      order.num,
                                                      row,
                                                      j
                                                    )
                                                  }
                                                >
                                                  Save
                                                </Button>
                                                <Button
                                                  color="error"
                                                  size="small"
                                                  onClick={() =>
                                                    handleDeleteSubRow(
                                                      order.num,
                                                      j
                                                    )
                                                  }
                                                >
                                                  Delete
                                                </Button>
                                              </Stack>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </LocalizationProvider>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 9999,
            primaryColor: "#1976d2",
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default LatexOrders;
