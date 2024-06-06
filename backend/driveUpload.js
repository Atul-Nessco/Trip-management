import express from "express";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import Multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("_filename", import.meta.url);
console.log("_filename", __filename);
console.log("_filename", __dirname); 
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
const audioFilesPath = path.join(__dirname, "audio-files");
console.log(audioFilesPath); //this will give C:\Users\pc\Desktop\date4\Temp1\day4\backend\backend
const multer = Multer({
  storage: Multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, audioFilesPath);
    },
    filename: function (req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
const authenticateGoogle = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "storage-testing-425306-f151aec4ab82.json"),
    scopes: "https://www.googleapis.com/auth/drive",
  });
  return auth;
};
const createGoogleDriveFolder = async (folderName, parentId, auth) => {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const driveService = google.drive({ version: "v3", auth });
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });
  return response.data.id;
};

const findFolderByName = async (folderName, parentId, auth) => {
  const driveService = google.drive({ version: "v3", auth });

  const response = await driveService.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id, name)",
  });

  return response.data.files.length ? response.data.files[0].id : null;
};

const uploadToGoogleDrive = async (file, folderId, auth) => {
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };
  const driveService = google.drive({ version: "v3", auth });
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });
  return response.data.id;
};
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted");
    }
  });
};
const uploadToSheet = async (url) => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  const sheets = google.sheets({ auth, version: "v4" });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: "1EmnOIMSgNwg4O2nvTAT-kIbZpuNQnO9_Po4aV026Cqg",
    range: "A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[url]], // Make sure the URL is wrapped in an array
    },
  });
  return response;
};

app.post(
  "/upload-files-to-google-drive",
  multer.array("files"),
  async (req, res) => {
    try {
      const { name, tag } = req.body;
      if (!name || !tag) {
        res.status(400).send("Name and tag are required.");
        return;
      }
      if (!req.files || req.files.length === 0) {
        res.status(400).send("No files uploaded.");
        return;
      }
      const auth = authenticateGoogle();
      const parentFolderId = "10PvIYDvVVFWlqOrQIZyyck6Zt-5O0KFO";
      let tagFolderId = await findFolderByName(tag, parentFolderId, auth);
      if (!tagFolderId) {
        tagFolderId = await createGoogleDriveFolder(tag, parentFolderId, auth);
      }
      let folderId = await findFolderByName(name, tagFolderId, auth);
      if (!folderId) {
        folderId = await createGoogleDriveFolder(name, tagFolderId, auth);
      }
      const fileIds = [];
      for (const file of req.files) {
        const fileId = await uploadToGoogleDrive(file, folderId, auth);
        fileIds.push(fileId);

        deleteFile(file.path);
      }
      const urls = fileIds.map(fileId => `https://drive.google.com/uc?id=${fileId}`).join('\n');
      await uploadToSheet(urls);

      res.status(200).json({ folderId, fileIds });
    } catch (err) {
      console.error("Error during file upload:", err);
      res.status(500).send("An error occurred while uploading the files.");
    }
  }
);

app.post("/delete-file-from-google-drive/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      res.status(400).send("File ID is required.");
      return;
    }
    const auth = authenticateGoogle();

    const driveService = google.drive({ version: "v3", auth });

    await driveService.files.delete({
      fileId: fileId,
    });

    res.status(200).send("File deleted from Google Drive successfully.");
  } catch (err) {
    console.error("Error during file deletion:", err);
    res
      .status(500)
      .send("An error occurred while deleting the file from Google Drive.");
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
