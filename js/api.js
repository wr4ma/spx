// js/api.js

/**
 * API module for fetching and parsing data from Google Sheets.
 */

import { googleSheetUrl } from './config.js';

/**
 * Fetches data from the Google Sheet URL and parses it into a structured object.
 * @returns {Promise<Object|null>} A promise that resolves to an object containing all parsed data, or null if an error occurs.
 */
export async function fetchGoogleSheetData() {
    try {
        const response = await fetch(googleSheetUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));

        return parseData(rows);

    } catch (error) {
        console.error('There was a problem fetching the Google Sheet data:', error);
        return null;
    }
}

/**
 * Parses the raw CSV rows into a structured data object.
 * @param {string[][]} rows - The 2D array of strings from the CSV.
 * @returns {Object} The structured data object.
 */
function parseData(rows) {
    const data = {};

    // Helper to safely get data from a cell
    const getCell = (r, c) => (rows[r] && rows[r][c] ? rows[r][c].trim().replace(/^"|"$/g, '') : '');

    // Dashboard Metrics
    const projectionText1 = getCell(0, 0);
    const projectionText2 = getCell(2, 0);
    data.dashboardMetrics = {
        fmProjectionDate1: projectionText1.split(':')[1]?.trim() || '',
        fmProjectionValue1: getCell(1, 0),
        fmActualValue1: getCell(5, 0),
        fmProjectionDate2: projectionText2.split(':')[1]?.trim() || '',
        fmProjectionValue2: getCell(3, 0),
        fmActualValue2: getCell(7, 0),
        upcomingDcTotal: getCell(1, 1),
        upcomingDcS01: getCell(3, 1),
        upcomingDcS02: getCell(5, 1),
        upcomingDcS03: getCell(7, 1),
        productivityActualInbound: getCell(1, 3),
        productivityGapInbound: getCell(2, 3),
        productivityActualOutbound: getCell(3, 3),
        productivityGapOutbound: getCell(4, 3),
        pendingPacked: getCell(1, 5),
        pendingLoading: getCell(2, 5),
        dockingAntrian: getCell(1, 7),
        dockingProsesBongkar: getCell(2, 7),
        operatorOutCount: getCell(0, 33),
    };

    // Manpower Plan Data
    data.manpowerData = rows; // Pass the full data for filtering

    // Hourly Performance Data
    data.hourlyData = rows; // Pass the full data for filtering

    // Operator List Data
    data.operatorListData = rows; // Pass the full data for filtering

    // PIC Tasks
    data.picTasks = rows.slice(2)
        .map(row => ({
            name: getCell(rows.indexOf(row), 27),
            isCompleted: getCell(rows.indexOf(row), 28).toLowerCase() === 'true'
        }))
        .filter(task => task.name);

    // Operator Profiles
    data.operatorProfiles = rows.slice(2).map(row => ({
        opsId: getCell(rows.indexOf(row), 44),
        name: getCell(rows.indexOf(row), 45),
        vendor: getCell(rows.indexOf(row), 46),
        role: getCell(rows.indexOf(row), 47),
        photoUrl: getCell(rows.indexOf(row), 48)
    })).filter(op => op.opsId && op.name);

    // Detailed Pending Data
    const innerData = [];
    for(let i=2; i < rows.length; i++) {
        const station = getCell(i, 51);
        if (station) innerData.push({ station, qty: getCell(i, 52) });
        else break;
    }
    const outterData = [];
    for(let i=2; i < rows.length; i++) {
        const station = getCell(i, 53);
        if (station) outterData.push({ station, qty: getCell(i, 54) });
        else break;
    }
    data.detailedPending = {
        innerTotal: getCell(1, 56),
        outterTotal: getCell(2, 56),
        grandTotal: getCell(3, 56),
        lastUpdate: getCell(4, 56),
        innerTable: innerData,
        outterTable: outterData,
    };
    
    // Contact Card Images
    data.contactImages = {
        profile: getCell(0, 48)
    };

    return data;
}
