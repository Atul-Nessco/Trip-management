import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Multer Configuration
const audioFilesPath = path.join(__dirname, "uploads");
const multer = Multer({
  storage: Multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, audioFilesPath);
    },
    filename: (req, file, callback) => {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 10024 * 10024,
  },
});

// Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEYFILE_PATH,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const driveService = google.drive({ version: "v3", auth });
const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.SPREADSHEET_ID;
const writeRange = process.env.SPREADSHEET_WRITE_RANGE || "Sheet2!A1:Z";
const readRange = process.env.SPREADSHEET_READ_RANGE || "Sheet1!A:Z";

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`MongoDB connected: ${mongoUri}`))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas and Models
const counterSchema = new mongoose.Schema({
  _id: String,
  sequence_value: Number,
});
const Counter = mongoose.model("Counter", counterSchema);

const formDataSchema = new mongoose.Schema(
  {
    planId: String,
    requestDate: String,
    trequestDate: String,
    brand: String,
    purpose: String,
    requesterName: String,
    department: String,
    materialName: String,
    specification: String,
    qualityGrade: String,
    qualityRemarks: String,
    quantity: String,
    unit: String,
    priority: String,
    isVendorRecommended: Boolean,
    vendorName: String,
    vendorPhoneNumber: String,
    selectedDate: String,
    remarks: String,
    driveLinks: [{ name: String, link: String }],
  },
  { timestamps: true }
);
const FormData = mongoose.model("FormData", formDataSchema);

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
}

async function generatePlanId() {
  const sequenceValue = await getNextSequenceValue("planId");
  return `Pl-${String(sequenceValue).padStart(10, "0")}`;
}

const createGoogleDriveFolder = async (folderName, parentId) => {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });
  return response.data.id;
};

const findFolderByName = async (folderName, parentId) => {
  const response = await driveService.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id, name)",
  });

  return response.data.files.length ? response.data.files[0].id : null;
};

const uploadToGoogleDrive = async (file, folderId) => {
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });
  fs.unlinkSync(file.path);
  return {
    name: file.originalname,
    link: `https://drive.google.com/uc?id=${response.data.id}`,
  };
};

async function writeToSheet(data) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: writeRange,
    });

    const lastRowNumber = response.data.values ? response.data.values.length + 1 : 2;
    const startRow = lastRowNumber;
    const endRow = startRow + 1;
    const range = `Sheet2!A${startRow}:Z${endRow}`;

    let driveLinksString = data.driveLinks.map((linkData) => `"${linkData.link}", "${linkData.name}"`).join(",\n");

    const sheetData = [
      data.planId,
      data.requestDate,
      data.trequestDate,
      data.brand,
      data.purpose,
      data.requesterName,
      data.department,
      data.materialName,
      data.specification,
      data.qualityGrade,
      data.qualityRemarks,
      data.quantity,
      data.unit,
      data.priority,
      data.isVendorRecommended,
      data.vendorName,
      data.vendorPhoneNumber,
      data.selectedDate,
      data.remarks,
      driveLinksString,
    ];

    const writeResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [sheetData], // Use the array with `planId` as the first element
      },
    });

    console.log("Data successfully written to Google Sheets:", writeResponse.data);
    return writeResponse.data;
  } catch (error) {
    console.error("Error writing data to Google Sheets:", error);
    throw error;
  }
}

async function writeToMongo(data) {
  try {
    const formData = new FormData(data);
    const result = await formData.save();
    console.log("Data successfully written to MongoDB:", result);
    return result;
  } catch (error) {
    console.error("Error writing data to MongoDB:", error);
    throw error;
  }
}

async function readSheet() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: readRange,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return [];
    }
    const headers = rows[0];
    const columnData = {};
    headers.forEach((header, colIndex) => {
      columnData[header] = rows
        .slice(1)
        .map((row) => row[colIndex])
        .filter((cell) => cell !== undefined && cell !== "" && cell !== null);
    });

    return columnData;
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    throw error;
  }
}

async function addUnitOfMeasurementIfNeeded(unit) {
  try {
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:Z1', // Fetch the header row
    });

    const headers = sheetData.data.values[0];
    const uomIndex = headers.indexOf('UoM');

    if (uomIndex === -1) {
      console.error('UoM column not found in the sheet.');
      return;
    }

    const columnRange = `Sheet1!${String.fromCharCode(65 + uomIndex)}2:${String.fromCharCode(65 + uomIndex)}`;
    const columnData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: columnRange,
    });

    const existingUnits = columnData.data.values ? columnData.data.values.flat() : [];
    if (!existingUnits.includes(unit)) {
      const newRange = `Sheet1!${String.fromCharCode(65 + uomIndex)}${existingUnits.length + 2}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: newRange,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[unit]],
        },
      });
      console.log(`Unit of measurement "${unit}" added to Google Sheets.`);
    } else {
      console.log(`Unit of measurement "${unit}" already exists.`);
    }
  } catch (error) {
    console.error('Error adding unit of measurement to Google Sheets:', error);
    throw error;
  }
}

app.post("/submit", multer.array("files"), async (req, res) => {
  try {
    console.log("Request files:", req.files);
    const formData = req.body;
    console.log("Form data:", formData);
    const planId = await generatePlanId();
    formData.planId = planId;
    const parentFolderId = "10PvIYDvVVFWlqOrQIZyyck6Zt-5O0KFO";
    const folderId = await createGoogleDriveFolder(planId, parentFolderId);
    const driveLinks = [];
    for (const file of req.files) {
      const linkData = await uploadToGoogleDrive(file, folderId);
      driveLinks.push(linkData);
    }
    formData.driveLinks = driveLinks;
    await writeToSheet(formData);
    await writeToMongo(formData);
    res.status(200).json({ folderId, driveLinks });
  } catch (error) {
    console.error("Error during /submit:", error);
    res.status(500).json({ error: "Failed to submit data" });
  }
});

app.get("/data", async (req, res) => {
  try {
    const data = await readSheet();
    console.log("Data fetched from Google Sheets:", data);
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.delete("/delete-file-from-google-drive/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      res.status(400).send("File ID is required.");
      return;
    }
    await driveService.files.delete({
      fileId: fileId,
    });
    res.status(200).send("File deleted from Google Drive successfully.");
  } catch (err) {
    console.error("Error during file deletion:", err);
    res.status(500).send("An error occurred while deleting the file from Google Drive.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
