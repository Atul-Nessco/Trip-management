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
  Tooltip,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import LinearProgress from "@mui/material/LinearProgress";
import ClearSharpIcon from "@mui/icons-material/ClearSharp";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import Typography from "@mui/material/Typography";

function LinearProgressBar() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <LinearProgress sx={{ width: "100%" }} />
    </Box>
  );
}
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
  const [selectedCity, setSelectedCity] = useState("");
  const [isVendorRecommended, setIsVendorRecommended] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorPhoneNumber, setVendorPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [tooltipText, setTooltipText] = useState("Copy link");

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
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
      .get("http://api.nesscoindustries.com/data")
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
          console.log(
            "Data structure is incorrect or one of the fields is empty:",
            data
          );
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  }, []);
  const [files, setFiles] = useState([]);
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      data: file,
      preview: URL.createObjectURL(file),
      type: file.type,
      progress: 0,
    }));
    setFiles(selectedFiles);
    setUploadProgress(Array(selectedFiles.length).fill(0));
  };
  const [urls, setUrls] = useState([]);
  const handleDelete = async (index) => {
    const fileToDelete = files[index];
    const fileId = fileToDelete.googleDriveFileId;
    if (!fileId) {
      setFiles(files.filter((_, i) => i !== index));
      return;
    }
    try {
      const response = await fetch(
        `http://api.nesscoindustries.com/delete-file-from-google-drive/${String(fileId)}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        console.log("Failed to delete file:", response.statusText);
        setDeleting(false);
        return;
      }
      setFiles(files.filter((_, i) => i !== index));
    } catch (error) {
      console.log("Error occurred during file deletion:", error);
    } finally {
      setDeleting(false);
    }
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
    formData.append("remarks", remarks);

    files.forEach((file) => {
      formData.append("files", file.data);
    });

    setUploading(true);
    try {
      const response = await axios.post(
        "http://api.nesscoindustries.com/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const totalFilesSize = files.reduce(
              (acc, file) => acc + file.data.size,
              0
            );
            const progress = Math.round((loaded / totalFilesSize) * 100);
            setUploadProgress(progress);
          },
        }
      );

      if (response && response.data && response.data.driveLinks) {
        const driveLinks = response.data.driveLinks;
        setFiles((prevFiles) =>
          prevFiles.map((file, index) => ({
            ...file,
            googleDriveFileId: driveLinks[index].link.split("=")[1],
          }))
        );
      } else {
        console.log("Unexpected response format:", response.data);
      }
      console.log("Files uploaded successfully");
    } catch (error) {
      console.log("Error occurred during file upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (fileId) => {
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    window.open(driveUrl, "_blank");
  };

  const handleCopyLink = (fileId) => {
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    navigator.clipboard
      .writeText(driveUrl)
      .then(() => {
        setTooltipText("Link copied!");
        setTimeout(() => {
          setTooltipText("Copy link");
        }, 2000);
      })
      .catch(() => {
        setTooltipText("Failed to copy");
        setTimeout(() => {
          setTooltipText("Copy link");
        }, 2000);
      });
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
                  <form onSubmit={handleDialogSubmit}>
                    <TextField
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor: "black",
                          },
                        "& .MuiInputBase-input": {
                          color: "black",
                        },
                        "& .MuiInputLabel-root": {
                          color: "black",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "black",
                        },
                      }}
                      fullWidth
                      name="file"
                      id="file"
                      type="file"
                      inputProps={{ multiple: true }} // Set multiple attribute
                      onChange={handleFileChange}
                    />
                    <Grid container spacing={4} mt={2}>
                      {files.map((file, index) => (
                        <Grid item key={index}>
                          <Box position="relative" display="inline-block">
                            {file.type.startsWith("image/") && (
                              <img
                                src={file.preview}
                                alt={`File Preview ${index + 1}`}
                                style={{
                                  maxWidth: "100px",
                                  minHeight: "100px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  height: "100px",
                                  padding: "5px",
                                  paddingBottom: "25px",
                                  border: "1px solid rgba(255, 255, 255, .25)",
                                  borderRadius: "20px",
                                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                                  boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.25)",
                                  backdropFilter: "blur(15px)",
                                }}
                              />
                            )}
                            {file.type.startsWith("video/") && (
                              <video
                                src={file.preview}
                                controls
                                style={{
                                  maxWidth: "100px",
                                  minHeight: "100px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  height: "100px",
                                  padding: "5px",
                                  paddingBottom: "25px",
                                  border: "1px solid rgba(255, 255, 255, .25)",
                                  borderRadius: "20px",
                                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                                  boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.25)",
                                  backdropFilter: "blur(15px)",
                                }}
                              />
                            )}
                            {file.type === "application/pdf" && (
                              <embed
                                src={file.preview}
                                type="application/pdf"
                                style={{
                                  maxWidth: "100px",
                                  minHeight: "100px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  height: "100px",
                                  padding: "5px",
                                  paddingBottom: "25px",
                                  border: "1px solid rgba(255, 255, 255, .25)",
                                  borderRadius: "20px",
                                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                                  boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.25)",
                                  backdropFilter: "blur(15px)",
                                }}
                              />
                            )}
                            {!uploading && (
                             <Tooltip title="Delete" arrow>
                             <Button
                               variant="contained"
                               disableRipple
                               onClick={() => handleDelete(index)}
                               style={{
                                 position: "absolute",
                                 background: "transparent",
                                 border: "none",
                                 boxShadow: "none",
                                 padding: 0,
                                 zIndex: 1,
                                 bottom: "2px",
                                 left: "-10px",
                                 color: "black",
                               }}
                             >
                               <ClearSharpIcon style={{ color: "#ff7e5f" }} />
                             </Button>
                           </Tooltip>
                            )}
                            {file.googleDriveFileId && (
                              <>
                                <Tooltip arrow title="Preview">
                                  <Button
                                    variant="contained"
                                    disableRipple
                                    onClick={() =>
                                      handlePreview(file.googleDriveFileId)
                                    }
                                    style={{
                                      position: "absolute",
                                      background: "transparent",
                                      border: "none",
                                      boxShadow: "none",
                                      padding: 0,
                                      zIndex: 1,
                                      bottom: "2px",
                                      right: "30px",
                                      color: "black",
                                    }}
                                  >
                                    <VisibilitySharpIcon />
                                  </Button>
                                </Tooltip>

                                <Tooltip arrow title={tooltipText}>
                                  <Button
                                  size="small"
                                    variant="contained"
                                    disableRipple
                                    onClick={() =>
                                      handleCopyLink(file.googleDriveFileId)
                                    }
                                    style={{
                                      position: "absolute",
                                      background: "transparent",
                                      border: "none",
                                      boxShadow: "none",
                                      padding: 0,
                                      zIndex: 1,
                                      bottom: "2px",
                                      right: "-10px",
                                      color: "black",
                                    }}
                                  >
                                    <FileCopyIcon />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    {uploading && (
                      <Box sx={{ width: "100%", marginTop: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                        />
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${Math.round(uploadProgress)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </form>
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
