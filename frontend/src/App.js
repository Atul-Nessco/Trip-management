import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import "./App.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PurchaseRequestForm from "./PurchaseRequestForm";


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });
  const backgroundClassName = darkMode ? "background dark-mode" : "background";

  return (
       <ThemeProvider theme={theme}>
        <Paper>
          <PurchaseRequestForm/>
        </Paper>
      </ThemeProvider>
  );
}
export default App;
