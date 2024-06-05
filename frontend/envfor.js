import React, { useContext, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import TripModal from "./TripForTable.js";
import DataContex from "./Context/DataContex.js";
import NestedModal from "./MainModal.js";

const TripPlanEd = (props) => {
    const { planid } = useParams();
    const [details, setDetails] = useState([]);
    const [filteredDetails, setFilteredDetails] = useState([]);
    const [editClickState, setEditClickState] = useState(false);
    const [editDate, setEditDate] = useState("");
    const [editDay, setEditDay] = useState("");
    const [editCountry, setEditCountry] = useState("");
    const [editState, setEditState] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editClientName, setEditClientName] = useState("");
    const [editPurpose, setEditPurpose] = useState("");
    const [editRemarks, setEditRemarks] = useState("");
    const [editisDelete, setEditIsDelete] = useState(false);
    const [idforEdit, setId] = useState("");
    const [Eopen, setEOpen] = useState(false);
    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/getData?PlanId=${planid}`);
            const responseData = response.data;
            if (Array.isArray(responseData)) {
                setDetails(responseData);
                setFilteredDetails(responseData);
            } else {
                console.error("Unexpected data format:", responseData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };
    useEffect(() => {
        if (planid) {
            fetchData();
        }
    }, [planid]);

    const deleteData = async (id, plan) => {
        try {
            await axios.delete(`http://localhost:4000/deleteData/${id}`);
            setDetails(details.filter((item) => item._id !== id));
            setFilteredDetails(filteredDetails.filter((item) => item._id !== id));
            toast.success(`🎉✨ Your plan ID ${plan} has been successfully deleted! ✨🎉`);
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Error deleting item. Please try again.");
        }
    };

    const submitTableData = async () => {
        try {
            const tripTableData = convertToObjects(props.saveDataParent);
            const { employeeID: employee, employeeName: employeename, type, dept: department, SRNumber: sno } = props;
            await axios.post("http://localhost:4000/tripData", {
                PlanId: planid,
                tripTableData,
                employee,
                employeename,
                type,
                department,
                sno,
            });
            toast.success(`✨ Your plan ID ${planid} has been generated successfully! 🎉`);
            fetchData();
        } catch (error) {
            console.error("Error submitting data:", error);
            toast.error("Error submitting data. Please try again.");
        }
        props.settableData([]);
        props.setsaveDataParent([]);
    };

    const convertToObjects = (array) => {
        const objeArray = [];
        for (let i = 0; i < array.length; i++) {
            const innerArray = array[i];
            const obj = {};
            for (let j = 0; j < innerArray.length; j++) {
                switch (j) {
                    case 0:
                        obj.Date = innerArray[j];
                        break;
                    case 1:
                        obj.Country = innerArray[j];
                        break;
                    case 2:
                        obj.State = innerArray[j];
                        break;
                    case 3:
                        obj.City = innerArray[j];
                        break;
                    case 4:
                        obj.ClientName = innerArray[j];
                        break;
                    case 5:
                        obj.Purpose = innerArray[j];
                        break;
                    case 6:
                        obj.Remarks = innerArray[j];
                        break;
                    case 7:
                        obj.Day = innerArray[j];
                        break;
                    default:
                        break;
                }
            }
            objeArray.push(obj);
        }
        return objeArray;
    };
    const { allData, SetAllData, Row, setRow, cindex, setCindex } = useContext(DataContex);
    const handleEdit = (row) => {
        const { Date, Day, Country, State, City, ClientName, Purpose, Remarks, isDelete, _id } = row;
        const rowData = { Date, Day, Country, State, City, ClientName, Purpose, Remarks, isDelete, _id };
        setRow(rowData);
        alert(row)
        setEditDate(Date);
        setEditDay(Day);
        setEditCountry(Country);
        setEditState(State);
        setEditCity(City);
        setEditClientName(ClientName);
        setEditPurpose(Purpose);
        setEditRemarks(Remarks);
        setEditIsDelete(isDelete);
        setId(_id);
        setEditClickState(true);
    };
    const updateTableData = async () => {
        alert(cindex)
        const itemToUpdate = allData.find(item => item._id === cindex);
        if(!itemToUpdate) {
            console.error("itemToUpdate is undefined");
            toast.error("Item to update not found.");
            return;
        }
        const { Country, State, City, ClientName, Purpose, Remarks, _id } = itemToUpdate;
        try {
            const id = _id;
            const dataToUpdate = {
                Country,
                State,
                City,
                ClientName,
                Purpose,
                Remarks,
                _id
            };
            const response = await fetch(`http://localhost:4000/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToUpdate),
            });
            if (response.ok) {
                props.settableData((prevData) => {
                    const updatedData = prevData.map((rowData) => {
                        return rowData;
                    });
                    return updatedData;
                });

                toast.success(`data update successfully`)
            } else {
                console.error("Failed to update trip data:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating trip data:", error);
        }
    }; const fieldNames = ["Date", "Country", "State", "City", "Client Name", "Purpose", "Remarks", "SRNumber"];
    const modifiedTableData = props.tableData.map(data => {
        const newData = {};
        data.forEach((value, index) => {
            newData[fieldNames[index]] = value;
        });
        return newData;
    });
    const mainData = [...filteredDetails, ...modifiedTableData];
    useEffect(() => {
        SetAllData(mainData);
    }, [SetAllData, mainData]);
    const [preOpen, setpreOpen] = useState(false);
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginTop: "10rem",
            }}
        >
            <div className="maintTripHomeTable">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TableContainer component={Paper} style={{ maxHeight: "400px", background: props.check ? "" : "#f2f2f2" }}>
                            <Table aria-label="simple table" size="small">
                                <TableHead style={{ backgroundColor: props.check ? "black" : "#F4F6F6 " }}>
                                    <TableRow>
                                        {["Sr", "Date", "Country", "State", "City", "ClientName", "Purpose", "Remarks", "Actions"].map((header, index) => (
                                            <TableCell
                                                key={index}
                                                align="left"
                                                style={{
                                                    border: "1px solid #ddd",
                                                    fontWeight: "bold",
                                                    padding: "8px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allData.map((row, index) =>
                                        !row.isDelete ? (
                                            <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                {[index + 1, row.Date, row.Country, row.State, row.City, row.ClientName, row.Purpose, row.Remarks].map(
                                                    (data, dataIndex) => (
                                                        <TableCell
                                                            key={dataIndex}
                                                            align="left"
                                                            style={{
                                                                border: "1px solid #ddd",
                                                                padding: "8px",
                                                                maxWidth: "100px",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {data}
                                                        </TableCell>
                                                    )
                                                )}
                                                <TableCell
                                                    align="left"
                                                    style={{
                                                        border: "1px solid #ddd",
                                                        padding: "8px",
                                                    }}
                                                >
                                                    <IconButton color="primary">
                                                        <EditIcon
                                                            style={{ color: props.check ? "white" : "black" }}
                                                            onClick={() => handleEdit(row)}
                                                        />
                                                        <TripModal
                                                            idforEdit={idforEdit}
                                                            dates={editDate}
                                                            days={editDay}
                                                            Country={editCountry}
                                                            State={editState}
                                                            City={editCity}
                                                            ClientName={editClientName}
                                                            Purpose={editPurpose}
                                                            Remarks={editRemarks}
                                                            isDelete={editisDelete}
                                                            check={props.check}
                                                            tableData={props.tableData}
                                                            settableData={props.settableData}
                                                            editClickState={editClickState}
                                                            setEditClickState={setEditClickState}
                                                            updateTableData={updateTableData}
                                                            type={"doNotOpen"}
                                                            types={"newthing"}
                                                        />

                                                    </IconButton>
                                                    <IconButton
                                                        color="secondary"
                                                        aria-label="delete"
                                                        onClick={() => deleteData(row._id, row.PlanId)}
                                                    >
                                                        <DeleteIcon
                                                            style={{ color: props.check ? "white" : "black" }}
                                                        />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ) : null
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", margin: "15px" }}>
                {
                    cindex === -1 ? <Button
                        style={{ backgroundColor: props.check ? "white" : "black" }}
                        variant="contained"
                        onClick={submitTableData}
                        size="medium"
                    >
                        Submit
                    </Button> : <Button
                        style={{ backgroundColor: props.check ? "white" : "black" }}
                        variant="contained"
                        onClick={updateTableData}
                        size="medium"
                    >
                        Update
                    </Button>

                }

                <Button
                    style={{ marginLeft: "20px", backgroundColor: props.check ? "white" : "black" }}
                    variant="contained"
                    size="medium"
                    onClick={() => props.setsaveDataParent([])}
                >
                    Clear
                </Button>
            </div>
            <ToastContainer style={{ marginTop: "5rem" }} />
        </div>
    );
};

export default TripPlanEd;
