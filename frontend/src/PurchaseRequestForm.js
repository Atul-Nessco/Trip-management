import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Box,
  Autocomplete,
  InputAdornment,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const MeasurementSelector = ({ unit, setUnit, options }) => {
  const [customUnit, setCustomUnit] = useState(unit);
  const [isCustom, setIsCustom] = useState(unit === "");

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue !== "Others") {
      setCustomUnit(selectedValue);
      setUnit(selectedValue);
      setIsCustom(false);
    } else {
      setCustomUnit("");
      setUnit("");
      setIsCustom(true);
    }
  };

  const handleTextChange = (e) => {
    setCustomUnit(e.target.value);
    setUnit(e.target.value);
  };

  return (
    <Box display="flex" alignItems="center">
      <Select
        value={isCustom ? "Others" : customUnit}
        onChange={handleSelectChange}
        inputProps={{
          id: "unit-selector",
        }}
        displayEmpty
        disableUnderline
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      {isCustom && (
        <TextField
          value={unit}
          onChange={handleTextChange}
          placeholder="Enter custom unit"
          margin="dense"
          style={{ marginLeft: 8 }}
        />
      )}
    </Box>
  );
};

const PurchaseRequestForm = (props) => {
  const [unit, setUnit] = useState("kg");
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
  };

  const theme = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [requestDate, setRequestDate] = useState("");
  const [trequestDate, settrequestedDate] = useState("");
  const [brand, setBrand] = useState("");
  const [purpose, setPurpose] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [qualityGrades, setQualityGrades] = useState([]);
  const [unitsOfMeasurement, setUnitsOfMeasurement] = useState([]);
  const [priority, setPriority] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [selectedQualityGrade, setSelectedQualityGrade] = useState(null);
  const [materialName, setMaterialName] = useState("");
  const [specification, setSpecification] = useState("");
  const [qualityRemarks, setQualityRemarks] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isVendorRecommended, setIsVendorRecommended] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorPhoneNumber, setVendorPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  const handleCountryChange = (event, value) => {
    setSelectedCountry(value);
  };

  const handleStateChange = (event, value) => {
    setSelectedState(value);
  };

  const handleCityChange = (event, value) => {
    setSelectedCity(value);
  };

  const handleClearMaterialName = () => {
    setMaterialName("");
  };

  const handleCheckboxChange = (event) => {
    setIsVendorRecommended(event.target.checked);
  };

  const getColor = () => (theme.palette.mode === "dark" ? "whte" : "black");
  useEffect(() => {
    axios
      .get("http://localhost:8000/data")
      .then((response) => {
        const { data } = response;
        if (data && Array.isArray(data.data.RD)) {
          setDepartments(data.data.RD);
        }
        if (data && Array.isArray(data.data.QD)) {
          setQualityGrades(data.data.QD);
        }
        if (data && Array.isArray(data.data.UoM)) {
          // Assuming 'UM' is the key for units of measurement in the response
          setUnitsOfMeasurement(data.data.UoM);
        }
        if (data && Array.isArray(data.data.Priority)) {
          setPriorities(data.data.Priority);
        } else {
          console.error(
            "Data structure is incorrect or one of the fields is empty:",
            data
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  const [files, setFiles] = useState([]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      preview: URL.createObjectURL(file),
      data: file,
      urls: [],
      googleDriveFileId: null,
    }));
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  const handleDialogSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("requestDate", requestDate);
    formData.append("trequestDate", trequestDate);
    formData.append("brand", brand);
    formData.append("purpose", purpose);
    formData.append("requesterName", requesterName);
    formData.append("department", selectedCity);
    formData.append("materialName", materialName);
    formData.append("specification", specification);
    formData.append("qualityGrade", selectedQualityGrade);
    formData.append("qualityRemarks", qualityRemarks);
    formData.append("quantity", quantity);
    formData.append("unit", unit);
    formData.append("priority", priority);
    formData.append("isVendorRecommended", isVendorRecommended);
    formData.append("vendorName", vendorName);
    formData.append("vendorPhoneNumber", vendorPhoneNumber);
    formData.append("selectedDate", selectedDate);
    files.forEach((file) => {
      formData.append("files", file.data);
    });
    alert(JSON.stringify(formData));
    try {
      const response = await axios.post(
        "http://localhost:8000/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Form submitted successfully:", response.data);
      setIsDialogOpen(false); // Close the dialog on successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <div>
      <Dialog fullWidth maxWidth="md" open={isDialogOpen}>
        <DialogTitle
          style={{ isplay: "flex", alignItems: "center", fontWeight: "bold" }}
        >
          Purchase Request Form TEST
        </DialogTitle>
        <DialogContent>
          <form
            style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: getColor(),
                      },
                    "& .MuiInputBase-input": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: getColor(),
                    },
                    "& .MuiPickersBasePicker-pickerView": {
                      width: "600px",
                    },
                  }}
                  fullWidth
                  required
                  label="Request Date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    required
                    fullWidth
                    label="Requester Name"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: getColor(),
                      },
                    "& .MuiInputBase-input": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: getColor(),
                    },
                  }}
                  required
                  id="combo-box-city"
                  options={departments}
                  getOptionLabel={(option) => option}
                  onChange={handleCityChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Requester Department *" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Material Name"
                    value={materialName}
                    required
                    onChange={(e) => setMaterialName(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            aria-label="clear"
                            onClick={handleClearMaterialName}
                          >
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    required
                    label="Specification"
                    value={specification}
                    onChange={(e) => setSpecification(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: getColor(),
                      },
                    "& .MuiInputBase-input": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: getColor(),
                    },
                  }}
                  id="combo-box-quality-grade"
                  options={qualityGrades}
                  getOptionLabel={(option) => (option ? option.toString() : "")}
                  value={selectedQualityGrade}
                  onChange={(event, newValue) => {
                    setSelectedQualityGrade(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Quality Grade" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Quality Remarks (if any)"
                    value={qualityRemarks}
                    onChange={(e) => setQualityRemarks(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Brand Name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Box>
                  <input
                    fullWidth
                    name="file"
                    id="file"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                  />
                  <Grid container spacing={2} mt={2}>
                    {files.map((file, index) => (
                      <Grid item key={index}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          <img
                            src={file.preview}
                            alt="preview"
                            style={{
                              width: "100px",
                              height: "100px",
                              marginBottom: "10px",
                            }}
                          />
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDelete(index)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <MeasurementSelector
                    value={unit}
                    handleUnitChange={handleUnitChange}
                    unit={unit}
                    setUnit={setUnit}
                    options={unitsOfMeasurement}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Purpose"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: getColor(),
                        },
                      "& .MuiInputBase-input": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root": {
                        color: getColor(),
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: getColor(),
                      },
                    }}
                    fullWidth
                    label="Target Date"
                    required
                    value={trequestDate}
                    onChange={(e) => settrequestedDate(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: getColor(),
                      },
                    "& .MuiInputBase-input": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: getColor(),
                    },
                  }}
                  id="combo-box-priority"
                  options={priorities}
                  getOptionLabel={(option) => option}
                  value={priority}
                  onChange={(event, newValue) => {
                    setPriority(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Priority" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Checkbox
                  checked={isVendorRecommended}
                  onChange={handleCheckboxChange}
                />{" "}
                Recommended Vendor
              </Grid>

              {isVendorRecommended && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <TextField
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: getColor(),
                            },
                          "& .MuiInputBase-input": {
                            color: getColor(),
                          },
                          "& .MuiInputLabel-root": {
                            color: getColor(),
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: getColor(),
                          },
                        }}
                        fullWidth
                        label="Vendor Name"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <TextField
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: getColor(),
                            },
                          "& .MuiInputBase-input": {
                            color: getColor(),
                          },
                          "& .MuiInputLabel-root": {
                            color: getColor(),
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: getColor(),
                          },
                        }}
                        fullWidth
                        label="Phone Number"
                        required
                        value={vendorPhoneNumber}
                        onChange={(e) => setVendorPhoneNumber(e.target.value)}
                      />
                    </Box>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12}>
                <TextField
                  sx={{
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: getColor(),
                      },
                    "& .MuiInputBase-input": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root": {
                      color: getColor(),
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: getColor(),
                    },
                  }}
                  id="outlined-multiline-static"
                  label="Remarks"
                  multiline
                  rows={4}
                  fullWidth
                  value={remarks}
                  onChange={handleRemarksChange}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            style={{
              backgroundColor: getColor(),
              color: theme.palette.background.paper,
            }}
            onClick={handleDialogSubmit}
            type="submit"
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseRequestForm;
