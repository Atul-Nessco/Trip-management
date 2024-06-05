import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Google Sheets authentication
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_KEYFILE_PATH || './form-testing-425510-3db1d12fdfd1.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

// Function to read data from Google Sheet
async function readSheet() {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID || '1TGMDhxmN7sI2M95SbNLCslk_FP0E_a4ZJm-HnqPe5F8';
    const range = process.env.SPREADSHEET_RANGE || 'Sheet1!A1:E10';

    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return [];
        }

        // Extract header and column-wise data
        const headers = rows[0];
        const columnData = {};

        headers.forEach((header, colIndex) => {
            columnData[header] = rows.slice(1).map(row => row[colIndex]).filter(cell => cell !== undefined && cell !== null);
        });

        return columnData;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error; // Throw the error to be caught in the endpoint
    }
}

// Endpoint to get data from Google Sheets
app.get("/data", async (req, res) => {
  try {
    const data = await readSheet();
    console.log('Data fetched from Google Sheets:', data);
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
