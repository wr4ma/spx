// js/config.js

/**
 * Configuration file for the Bandung DC Monitoring Dashboard.
 * Contains constants for Firebase and Google Sheets.
 */

// Firebase configuration object. Replace with your project's configuration.
export const firebaseConfig = {
    apiKey: "AIzaSyAI4L6OfH_xbwae7yKYKv81V7w7m4zW4Es",
    authDomain: "bandung-monitoring-dashboard.firebaseapp.com",
    databaseURL: "https://bandung-monitoring-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bandung-monitoring-dashboard",
    storageBucket: "bandung-monitoring-dashboard.appspot.com",
    messagingSenderId: "213657068868",
    appId: "1:213657068868:web:c4d3abb788663545a2a311",
    measurementId: "G-ZXSBFQWNG8"
};

// Google Sheet configuration
const googleSheetId = '19SS9GPTAkEoEQbw9QEaUMDtNKUuAqotZdRW7UoYaNDQ';
const googleSheetGid = '443866641';

// The final URL to fetch the Google Sheet data as a CSV.
export const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/export?format=csv&gid=${googleSheetGid}`;
