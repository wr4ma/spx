// js/main.js

/**
 * Main application entry point.
 * Orchestrates the initialization of all modules and the main data fetching flow.
 */

import { initializeFirebasePresence } from './firebase.js';
import { fetchGoogleSheetData } from './api.js';
import { initUI, toggleLoadingOverlay } from './ui.js';
import * as components from './components.js';

// Application state container
const appState = {
    manpowerData: [],
    hourlyData: [],
    operatorListData: [],
    picTasks: [],
    operatorProfiles: [],
    detailedPending: {},
    dashboardMetrics: {},
    contactImages: {}
};

/**
 * Main function to initialize the dashboard.
 */
async function main() {
    toggleLoadingOverlay(true);
    initializeFirebasePresence();
    
    try {
        const data = await fetchGoogleSheetData();
        if (data) {
            // Store fetched data in the application state
            Object.assign(appState, data);

            // Initialize the UI with the fetched data and component renderers
            initUI(appState, components);

            // Perform initial renders for the default visible page (Dashboard)
            components.renderDashboardMetrics(appState.dashboardMetrics);
            components.renderContactImages(appState.contactImages);
            
            // Set default date for filters
            initializeDateFilters();
        } else {
             throw new Error("Failed to fetch or parse data from Google Sheet.");
        }
    } catch (error) {
        console.error("Application failed to initialize:", error);
        // Optionally, display a user-friendly error message on the screen
        document.body.innerHTML = `<div class="text-white text-center p-8">Gagal memuat dasbor. Silakan coba muat ulang halaman.</div>`;
    } finally {
        toggleLoadingOverlay(false);
    }
}

/**
 * Sets the default value of all date input fields to today's date.
 */
function initializeDateFilters() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;

    document.getElementById('filter-date').value = todayFormatted;
    document.getElementById('filter-date-hourly').value = todayFormatted;
    document.getElementById('filter-date-operator').value = todayFormatted;
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', main);
