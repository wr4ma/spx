import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, onValue, onDisconnect, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentContainer = document.getElementById('content-container');
    
    const date1Label = document.getElementById('date-1-label');
    const fmProjectionValue1 = document.getElementById('fm-projection-value-1');
    const fmActualValue1 = document.getElementById('fm-actual-value-1');
    
    const date2Label = document.getElementById('date-2-label');
    const fmProjectionValue2 = document.getElementById('fm-projection-value-2');
    const fmActualValue2 = document.getElementById('fm-actual-value-2');

    const upcomingDcTotal = document.getElementById('upcoming-dc-total');
    const upcomingDcS01 = document.getElementById('upcoming-dc-s01');
    const upcomingDcS02 = document.getElementById('upcoming-dc-s02');
    const upcomingDcS03 = document.getElementById('upcoming-dc-s03');
    
    const operatorOutCount = document.getElementById('operator-out-count');
    
    const onlineCountEl = document.getElementById('online-count');

    const pendingPackedData = document.getElementById('pending-packed-data');
    const pendingLoadingData = document.getElementById('pending-loading-data');
    const actualInboundData = document.getElementById('actual-inbound-data');
    const actualOutboundData = document.getElementById('actual-outbound-data');
    const gapInboundData = document.getElementById('gap-inbound-data');
    const gapOutboundData = document.getElementById('gap-outbound-data');
    const antrianData = document.getElementById('antrian-data');
    const prosesBongkarData = document.getElementById('proses-bongkar-data');
    const manpowerDateInput = document.getElementById('filter-date');
    const manpowerApplyFilterBtn = document.getElementById('apply-filter-btn');
    const hourlyDateInput = document.getElementById('filter-date-hourly');
    const hourlyApplyFilterBtn = document.getElementById('apply-filter-btn-hourly');
    const picTaskList = document.getElementById('pic-task-list');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshMessage = document.getElementById('refresh-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    const searchInput = document.getElementById('ops-id-search-input');
    const profileCard = document.getElementById('operator-profile-card');
    const notFoundMessage = document.getElementById('profile-not-found');
    const profileImage = document.getElementById('profile-image');
    const profileOpsId = document.getElementById('profile-opsid');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileVendor = document.getElementById('profile-vendor');

    let manpowerData = [];
    let hourlyData = [];
    let operatorData = [];
    let operatorProfileData = [];
    let detailedPendingData = {};

    const initializeFirebasePresence = () => {
         const firebaseConfig = {
            apiKey: "AIzaSyAI4L6OfH_xbwae7yKYKv81V7w7m4zW4Es",
            authDomain: "bandung-monitoring-dashboard.firebaseapp.com",
            databaseURL: "https://bandung-monitoring-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "bandung-monitoring-dashboard",
            storageBucket: "bandung-monitoring-dashboard.appspot.com",
            messagingSenderId: "213657068868",
            appId: "1:213657068868:web:c4d3abb788663545a2a311",
            measurementId: "G-ZXSBFQWNG8"
        };

        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const database = getDatabase(app);

            const presenceRef = ref(database, 'presence');

            signInAnonymously(auth)
                .then(({ user }) => {
                    const myConnectionsRef = ref(database, `presence/${user.uid}`);
                    
                    const connectedRef = ref(database, '.info/connected');

                    onValue(connectedRef, (snap) => {
                        if (snap.val() === true) {
                            set(myConnectionsRef, true);
                            onDisconnect(myConnectionsRef).remove();
                        }
                    });
                })
                .catch((error) => {
                    console.error("Firebase anonymous sign-in failed", error);
                });
            
            onValue(presenceRef, (snap) => {
                const count = snap.exists() ? snap.size : 0;
                if (onlineCountEl) {
                    onlineCountEl.textContent = count;
                }
            });

        } catch (error) {
            console.error("Firebase initialization failed:", error);
            if (onlineCountEl) {
                onlineCountEl.textContent = 'N/A';
            }
        }
    };

    initializeFirebasePresence();
    
    const googleSheetId = '19SS9GPTAkEoEQbw9QEaUMDtNKUuAqotZdRW7UoYaNDQ';
    const googleSheetGid = '443866641';
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/export?format=csv&gid=${googleSheetGid}`;

    async function fetchGoogleSheetData() {
        try {
            const response = await fetch(googleSheetUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            const rows = data.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));

            const formatNumber = (value) => {
                const cleanedValue = (value || '').trim().replace(/^"|"$/g, '').replace(/,/g, '');
                const numericValue = parseInt(cleanedValue, 10);
                if (isNaN(numericValue)) return value;
                return numericValue.toLocaleString('id-ID');
            };

            if (rows[0] && rows[0][0] && rows[1] && rows[1][0]) {
                const projectionText1 = rows[0][0].trim().replace(/^"|"$/g, '');
                const projectionDateStr1 = projectionText1.split(':')[1]?.trim() || '';
                date1Label.textContent = projectionDateStr1;
                fmProjectionValue1.textContent = formatNumber(rows[1][0]);
            }
            if (rows[4] && rows[4][0] && rows[5] && rows[5][0]) {
                fmActualValue1.textContent = formatNumber(rows[5][0]);
            }
            if (rows[2] && rows[2][0] && rows[3] && rows[3][0]) {
                const projectionText2 = rows[2][0].trim().replace(/^"|"$/g, '');
                const projectionDateStr2 = projectionText2.split(':')[1]?.trim() || '';
                date2Label.textContent = projectionDateStr2;
                fmProjectionValue2.textContent = formatNumber(rows[3][0]);
            }
            if (rows[6] && rows[6][0] && rows[7] && rows[7][0]) {
                fmActualValue2.textContent = formatNumber(rows[7][0]);
            }

            if (rows[1] && rows[1][1]) upcomingDcTotal.textContent = formatNumber(rows[1][1]);
            if (rows[3] && rows[3][1]) upcomingDcS01.textContent = formatNumber(rows[3][1]);
            if (rows[5] && rows[5][1]) upcomingDcS02.textContent = formatNumber(rows[5][1]);
            if (rows[7] && rows[7][1]) upcomingDcS03.textContent = formatNumber(rows[7][1]);

            if (rows[0] && rows[0][33]) operatorOutCount.textContent = formatNumber(rows[0][33]);
            
            const productivityData = { actualInbound: rows[1][3], gapInbound: rows[2][3], actualOutbound: rows[3][3], gapOutbound: rows[4][3] };
            if (productivityData.actualInbound) actualInboundData.textContent = formatNumber(productivityData.actualInbound);
            if (productivityData.actualOutbound) actualOutboundData.textContent = formatNumber(productivityData.actualOutbound);
            if (productivityData.gapInbound) gapInboundData.textContent = formatNumber(productivityData.gapInbound);
            if (productivityData.gapOutbound) gapOutboundData.textContent = formatNumber(productivityData.gapOutbound);

            const pendingData = { pendingPacked: rows[1][5], pendingLoading: rows[2][5], antrian: rows[1][7], prosesBongkar: rows[2][7] };
            if (pendingData.pendingPacked) pendingPackedData.textContent = formatNumber(pendingData.pendingPacked);
            if (pendingData.pendingLoading) pendingLoadingData.textContent = formatNumber(pendingData.pendingLoading);
            if (pendingData.antrian) antrianData.textContent = formatNumber(pendingData.antrian);
            if (pendingData.prosesBongkar) prosesBongkarData.textContent = formatNumber(pendingData.prosesBongkar);

            const opsCol = 44;
            const nameCol = 45;
            const vendorCol = 46;
            const roleCol = 47;
            const photoCol = 48;
            
            operatorProfileData = rows.slice(2).map(row => ({
                opsId: (row[opsCol] || '').trim(),
                name: (row[nameCol] || '').trim(),
                vendor: (row[vendorCol] || '').trim(),
                role: (row[roleCol] || '').trim(),
                photoUrl: (row[photoCol] || '').trim()
            }));
            
            const innerData = [];
            const outterData = [];
            for(let i=2; i < rows.length; i++) {
                const station = rows[i][51] ? rows[i][51].trim() : '';
                if (station) {
                    innerData.push({ station: station, qty: formatNumber(rows[i][52]) });
                } else {
                    break;
                }
            }
            for(let i=2; i < rows.length; i++) {
                const station = rows[i][53] ? rows[i][53].trim() : '';
                if (station) {
                    outterData.push({ station: station, qty: formatNumber(rows[i][54]) });
                } else {
                    break;
                }
            }

            detailedPendingData = {
                inner: rows[1][56] ? formatNumber(rows[1][56]) : 'N/A',
                outter: rows[2][56] ? formatNumber(rows[2][56]) : 'N/A',
                total: rows[3][56] ? formatNumber(rows[3][56]) : 'N/A',
                lastUpdate: rows[4][56] ? rows[4][56].trim() : 'N/A',
                innerTable: innerData,
                outterTable: outterData,
            };

            manpowerData = rows.slice(1);
            hourlyData = rows.slice(1);
            operatorData = rows;
            
            const currentVisibleContent = document.querySelector('#content-container > div:not(.hidden)');
            if (currentVisibleContent) {
                 if (currentVisibleContent.id === 'reports-content') initializeManpowerPlan();
                 else if (currentVisibleContent.id === 'settings-content') initializeHourlyReport();
                 else if (currentVisibleContent.id === 'pictask-content') fetchPicTasks();
                 else if (currentVisibleContent.id === 'operator-list-content') initializeOperatorList();
                 else if (currentVisibleContent.id === 'detailed-pending-content') renderDetailedPendingPage(detailedPendingData);
            }

        } catch (error) {
            console.error('There was a problem fetching the Google Sheet data:', error);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    const renderDetailedPendingPage = (data) => {
        document.getElementById('pending-inner-total').textContent = data.inner;
        document.getElementById('pending-outter-total').textContent = data.outter;
        document.getElementById('pending-grand-total').textContent = data.total;
        document.getElementById('pending-last-update').textContent = `Last Update : ${data.lastUpdate}`;

        const innerTableBody = document.getElementById('detailed-pending-inner-body');
        if (innerTableBody) {
            innerTableBody.innerHTML = '';
            data.innerTable.forEach(item => {
                const row = `<tr><td class="px-6 py-4 text-left">${item.station}</td><td class="px-6 py-4 font-bold">${item.qty}</td></tr>`;
                innerTableBody.innerHTML += row;
            });
        }

        const outterTableBody = document.getElementById('detailed-pending-outter-body');
        if (outterTableBody) {
            outterTableBody.innerHTML = '';
            data.outterTable.forEach(item => {
                const row = `<tr><td class="px-6 py-4 text-left">${item.station}</td><td class="px-6 py-4 font-bold">${item.qty}</td></tr>`;
                outterTableBody.innerHTML += row;
            });
        }
    }
    
    const searchOperator = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query === '') {
            profileCard.classList.add('hidden');
            notFoundMessage.classList.add('hidden');
            return;
        }

        const result = operatorProfileData.find(op => op.opsId.toLowerCase() === query);

        if (result) {
            profileOpsId.textContent = result.opsId;
            profileName.textContent = result.name;
            profileRole.textContent = result.role;
            profileVendor.textContent = `Vendor: ${result.vendor}`;
            const photoIdMatch = result.photoUrl.match(/id=([a-zA-Z0-9_-]+)/);
            if (photoIdMatch && photoIdMatch[1]) {
                profileImage.src = `https://lh3.googleusercontent.com/d/${photoIdMatch[1]}`;
            } else {
                profileImage.src = 'https://placehold.co/400x400/374151/E5E7EB?text=Photo';
            }
            
            profileCard.classList.remove('hidden');
            notFoundMessage.classList.add('hidden');
        } else {
            profileCard.classList.add('hidden');
            notFoundMessage.classList.remove('hidden');
        }
    };
    
    searchInput.addEventListener('input', searchOperator);
    
    const renderHourlyTable = (data) => {
        const tableHead = document.getElementById('hourly-table-head');
        const tableBody = document.getElementById('hourly-table-body');
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length <= 1) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-gray-400">Tidak ada data untuk tanggal yang dipilih.</td></tr>`;
            return;
        }

        const formatNumber = (value) => {
            const cleanedValue = value.trim().replace(/^"|"$/g, '').replace(/,/g, '');
            const numericValue = parseInt(cleanedValue, 10);
            if (isNaN(numericValue)) return value;
            return numericValue.toLocaleString('id-ID');
        };

        const headerRow = document.createElement('tr');
        for (let j = 9; j <= 15; j++) {
            const th = document.createElement('th');
            th.textContent = data[0][j] ? data[0][j].trim().replace(/^"|"$/g, '') : '';
            th.scope = 'col';
            th.classList.add('px-6', 'py-3', 'text-center');
            headerRow.appendChild(th);
        }
        tableHead.appendChild(headerRow);
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length > 15) {
                const newRow = document.createElement('tr');
                for (let j = 9; j <= 15; j++) {
                    const cell = document.createElement('td');
                    let cellText = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                    
                    if (j > 10) {
                        cell.textContent = formatNumber(cellText);
                    } else {
                        cell.textContent = cellText;
                    }

                    newRow.appendChild(cell);
                }
                tableBody.appendChild(newRow);
            }
        }
    };
    
    const filterHourlyData = () => {
        const dateInput = document.getElementById('filter-date-hourly');
        const selectedDate = dateInput.value;

        if (!selectedDate) {
            renderHourlyTable(hourlyData);
            return;
        }

        const filteredData = [hourlyData[0]];
        const datePartsSelected = selectedDate.split('-');
        const selectedDateNormalized = `${datePartsSelected[0]}-${datePartsSelected[1]}-${datePartsSelected[2]}`;

        for (let i = 1; i < hourlyData.length; i++) {
            const row = hourlyData[i];
            const rowDateStr = row[9] ? row[9].trim().replace(/^"|"$/g, '') : '';
            
            if (!rowDateStr) continue;

            const datePartsSheet = rowDateStr.split('/');
            const sheetDateNormalized = `${datePartsSheet[2]}-${datePartsSheet[0].padStart(2, '0')}-${datePartsSheet[1].padStart(2, '0')}`;

            if (sheetDateNormalized === selectedDateNormalized) {
                filteredData.push(row);
            }
        }
        
        renderHourlyTable(filteredData);
    };

    const initializeHourlyReport = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;
        const hourlyDateInput = document.getElementById('filter-date-hourly');
        if (hourlyDateInput) {
            hourlyDateInput.value = todayFormatted;
        }
        
        filterHourlyData();
    };

    const renderManpowerTable = (data) => {
        const tableHead = document.getElementById('manpower-table-head');
        const tableBody = document.getElementById('manpower-table-body');
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length <= 1) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-gray-400">Tidak ada data untuk tanggal yang dipilih.</td></tr>`;
            return;
        }

        const formatNumber = (value) => {
            const cleanedValue = value.trim().replace(/^"|"$/g, '').replace(/,/g, '');
            const numericValue = parseInt(cleanedValue, 10);
            if (isNaN(numericValue)) return value;
            return numericValue.toLocaleString('id-ID');
        };

        const formatTime = (value) => {
            let hours = parseInt(value, 10);
            if (isNaN(hours)) return value;
            const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
            return `${formattedHours}:00`;
        };

        const headerRow = document.createElement('tr');
        for (let j = 18; j <= 25; j++) {
            const th = document.createElement('th');
            th.textContent = data[0][j] ? data[0][j].trim().replace(/^"|"$/g, '') : '';
            th.scope = 'col';
            th.classList.add('px-6', 'py-3', 'text-center');
            if (j >= 19 && j <= 21) {
                th.classList.add('manpower-plan-cell');
            } else if (j >= 22 && j <= 24) {
                th.classList.add('manpower-actual-cell');
            }
            headerRow.appendChild(th);
        }
        tableHead.appendChild(headerRow);
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length > 25) {
                const newRow = document.createElement('tr');
                for (let j = 18; j <= 25; j++) {
                    const cell = document.createElement('td');
                    let cellText = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                    
                    if (j === 18) {
                        cell.textContent = formatTime(cellText);
                    } else {
                        cell.textContent = formatNumber(cellText);
                    }
                    
                    if (j >= 19 && j <= 21) {
                        cell.classList.add('manpower-plan-cell');
                    } else if (j >= 22 && j <= 24) {
                        cell.classList.add('manpower-actual-cell');
                    }
                    newRow.appendChild(cell);
                }
                tableBody.appendChild(newRow);
            }
        }
    };
    
    const filterManpowerData = () => {
        const dateInput = document.getElementById('filter-date');
        const selectedDate = dateInput.value;
        
        if (!selectedDate) {
            renderManpowerTable(manpowerData);
            return;
        }
        
        const filteredData = [manpowerData[0]];
        
        const datePartsSelected = selectedDate.split('-');
        const selectedDateNormalized = `${datePartsSelected[0]}-${datePartsSelected[1]}-${datePartsSelected[2]}`;
        
        for (let i = 1; i < manpowerData.length; i++) {
            const row = manpowerData[i];
            const rowDateStr = row[17] ? row[17].trim().replace(/^"|"$/g, '') : ''; 
            
            if (!rowDateStr) continue;

            const datePartsSheet = rowDateStr.split('/');
            const sheetDateNormalized = `${datePartsSheet[2]}-${datePartsSheet[0].padStart(2, '0')}-${datePartsSheet[1].padStart(2, '0')}`;

            if (sheetDateNormalized === selectedDateNormalized) {
                filteredData.push(row);
            }
        }
        
        renderManpowerTable(filteredData);
    };

    const initializeManpowerPlan = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;
        const manpowerDateInput = document.getElementById('filter-date');
        if (manpowerDateInput) {
            manpowerDateInput.value = todayFormatted;
        }
        
        filterManpowerData();
    };

    async function fetchPicTasks() {
        try {
            const response = await fetch(googleSheetUrl);
            const data = await response.text();
            const rows = data.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
            
            picTaskList.innerHTML = '';

            for (let i = 2; i < rows.length; i++) {
                const row = rows[i];
                const taskName = row[27] ? row[27].trim().replace(/^"|"$/g, '') : '';
                const isCompleted = row[28] ? row[28].trim().toLowerCase() === 'true' : false;

                if (taskName) {
                    const iconColor = isCompleted ? 'text-green-500' : 'text-red-500';
                    const icon = isCompleted ? 
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 ${iconColor} flex-shrink-0">
                            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-1.042l-4.242 4.242-1.957-1.957a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l4.75-4.75Z" clip-rule="evenodd" />
                        </svg>` :
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 ${iconColor} flex-shrink-0">
                            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />
                        </svg>`;
                    
                    const li = document.createElement('li');
                    li.classList.add('flex', 'items-center', 'space-x-3', 'flex-wrap', 'p-4', 'rounded-lg', 'bg-gray-800', 'shadow-lg');
                    li.innerHTML = `
                        ${icon}
                        <span class="text-lg text-gray-200">${taskName}</span>
                    `;
                    picTaskList.appendChild(li);
                }
            }

            if (picTaskList.children.length === 0) {
                picTaskList.innerHTML = '<li class="text-gray-400 text-center">Tidak ada tugas. Tambahkan tugas baru di Google Sheet.</li>';
            }
        } catch (error) {
            console.error("Error fetching PIC tasks from Google Sheet:", error);
            picTaskList.innerHTML = '<li class="text-red-400 text-center">Gagal memuat data. Mohon periksa koneksi internet atau tautan Google Sheet.</td></li>';
        }
    }

    const renderOperatorTable = (data) => {
        const operatorTableHead = document.getElementById('operator-table-head');
        const operatorTableBody = document.getElementById('operator-table-body');
        operatorTableHead.innerHTML = '';
        operatorTableBody.innerHTML = '';
        
        if (data.length <= 2) {
            operatorTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-400">Tidak ada data untuk tanggal yang dipilih.</td></tr>';
            return;
        }

        const headerRow = document.createElement('tr');
        const headers = data[1];
        for (let j = 30; j <= 38; j++) {
            const th = document.createElement('th');
            th.textContent = headers[j] ? headers[j].trim().replace(/^"|"$/g, '') : '';
            th.scope = 'col';
            th.classList.add('px-6', 'py-3', 'text-center');
            headerRow.appendChild(th);
        }
        operatorTableHead.appendChild(headerRow);

        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            if (row.length > 38) {
                const newRow = document.createElement('tr');
                
                const dateCell = document.createElement('td');
                dateCell.textContent = row[30] ? row[30].trim().replace(/^"|"$/g, '') : '';
                dateCell.classList.add('px-6', 'py-4', 'date-cell');
                newRow.appendChild(dateCell);

                for (let j = 31; j <= 35; j++) {
                    const cell = document.createElement('td');
                    cell.textContent = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                    cell.classList.add('px-6', 'py-4', 'ops-info-cell');
                    newRow.appendChild(cell);
                }
                for (let j = 36; j <= 38; j++) {
                    const cell = document.createElement('td');
                    cell.textContent = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                    cell.classList.add('px-6', 'py-4', 'purpose-cell');
                    newRow.appendChild(cell);
                }
                operatorTableBody.appendChild(newRow);
            }
        }
    };
    
    const filterOperatorList = async () => {
        try {
            const response = await fetch(googleSheetUrl);
            const data = await response.text();
            const rows = data.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
            let operatorData = rows;
            
            const operatorDateInput = document.getElementById('filter-date-operator');
            const selectedDate = operatorDateInput.value;

            const operatorRoleSelect = document.getElementById('filter-role-operator');
            const selectedRole = operatorRoleSelect.value;

            const filteredData = [];
            if(operatorData[0]) filteredData.push(operatorData[0]);
            if(operatorData[1]) filteredData.push(operatorData[1]);

            const datePartsSelected = selectedDate.split('-');
            const selectedDateNormalized = `${parseInt(datePartsSelected[1], 10)}/${parseInt(datePartsSelected[2], 10)}/${parseInt(datePartsSelected[0], 10)}`;

            for (let i = 2; i < operatorData.length; i++) {
                const row = operatorData[i];
                const rowDateStr = row[30] ? row[30].trim().replace(/^"|"$/g, '') : '';
                const rowRole = row[33] ? row[33].trim().replace(/^"|"$/g, '') : '';

                if (!rowDateStr) continue;

                const isDateMatch = rowDateStr === selectedDateNormalized;
                const isRoleMatch = selectedRole === 'Semua' || rowRole === selectedRole;

                if (isDateMatch && isRoleMatch) {
                    filteredData.push(row);
                }
            }

            renderOperatorTable(filteredData);

        } catch (error) {
            console.error("Error fetching Operator List data:", error);
            const operatorTableBody = document.getElementById('operator-table-body');
            operatorTableBody.innerHTML = '<tr><td colspan="9" class="text-red-400 text-center">Gagal memuat data. Mohon periksa koneksi internet atau tautan Google Sheet.</td></tr>';
        }
    }
    
    const initializeOperatorList = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();
        const todayFormatted = `${year}-${month}-${day}`;
        
        const operatorDateInput = document.getElementById('filter-date-operator');
        if (operatorDateInput) {
            operatorDateInput.value = todayFormatted;
        }
        
        filterOperatorList();
    };
    
    fetchGoogleSheetData().then(() => {
        initializeManpowerPlan();
    });

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }

    openBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    let currentContent = document.getElementById('dashboard-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = event.target.dataset.target;
            const newContent = document.getElementById(targetId);

            if (currentContent.id === targetId) {
                return;
            }

            currentContent.classList.add('opacity-0');

            const transitionEndHandler = () => {
                currentContent.classList.add('hidden');
                currentContent.removeEventListener('transitionend', transitionEndHandler);
                
                newContent.classList.remove('hidden');
                setTimeout(() => {
                    newContent.classList.remove('opacity-0');
                    currentContent = newContent;
                }, 50);

                navLinks.forEach(navLink => {
                    navLink.classList.remove('bg-gray-700', 'text-white');
                    navLink.classList.add('text-gray-300', 'hover:bg-gray-700');
                });
                event.target.classList.add('bg-gray-700', 'text-white');
                event.target.classList.remove('text-gray-300', 'hover:bg-gray-700');

                if (window.innerWidth < 1024) {
                    closeSidebar();
                }

                if (targetId === 'settings-content') {
                    initializeHourlyReport();
                    document.getElementById('apply-filter-btn-hourly').addEventListener('click', filterHourlyData);
                }

                if (targetId === 'reports-content') {
                    initializeManpowerPlan();
                    document.getElementById('apply-filter-btn').addEventListener('click', filterManpowerData);
                }

                if (targetId === 'pictask-content') {
                    fetchPicTasks();
                }

                if (targetId === 'detailed-pending-content') {
                    initializeDetailedPendingPage();
                }

                if (targetId === 'operator-list-content') {
                    initializeOperatorList();
                    const operatorRoleSelect = document.getElementById('filter-role-operator');
                    const applyFilterBtnOperator = document.getElementById('apply-filter-btn-operator');
                    
                    if (applyFilterBtnOperator) {
                        applyFilterBtnOperator.addEventListener('click', filterOperatorList);
                    }
                    if (operatorRoleSelect) {
                        operatorRoleSelect.addEventListener('change', filterOperatorList);
                    }
                }
            };

            currentContent.addEventListener('transitionend', transitionEndHandler);
        });
    });

    const populateShortcuts = () => {
        const shortcutGrid = document.getElementById('shortcut-grid');
        const sidebarNavLinks = document.querySelectorAll('#sidebar-nav .nav-link');
        
        if (!shortcutGrid) return;
        shortcutGrid.innerHTML = '';

        sidebarNavLinks.forEach(link => {
            const targetId = link.dataset.target;
            
            if (targetId !== 'contact-dev-content') {
                const linkText = link.textContent.trim();
                const linkIcon = link.querySelector('svg');

                const shortcutButton = document.createElement('button');
                shortcutButton.className = 'flex flex-col items-center justify-center text-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
                shortcutButton.dataset.target = targetId;
                
                if (linkIcon) {
                    const iconClone = linkIcon.cloneNode(true);
                    iconClone.classList.remove('w-5', 'h-5', 'mr-3');
                    iconClone.classList.add('w-8', 'h-8', 'mb-2');
                    shortcutButton.appendChild(iconClone);
                }
                
                const textSpan = document.createElement('span');
                textSpan.className = 'text-xs font-semibold text-gray-300';
                textSpan.textContent = linkText;
                shortcutButton.appendChild(textSpan);

                shortcutButton.addEventListener('click', () => {
                    const originalLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
                    if (originalLink) {
                        originalLink.click();
                    }
                });

                shortcutGrid.appendChild(shortcutButton);
            }
        });
    };

    populateShortcuts();


    refreshBtn.addEventListener('click', () => {
        const currentContentId = currentContent.id;
        fetchGoogleSheetData().then(() => {
            const lastNav = document.querySelector(`.nav-link[data-target="${currentContentId}"]`);
            if (lastNav) {
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                lastNav.dispatchEvent(event);
            }
        });
    });

    const showMessage = () => {
        refreshMessage.classList.add('visible');
        setTimeout(() => {
            refreshMessage.classList.remove('visible');
        }, 1000);
    };

    setInterval(showMessage, 3000);

    setTimeout(() => {
         refreshMessage.classList.remove('visible');
    }, 1000);

    const initializeDetailedPendingPage = () => {
        renderDetailedPendingPage(detailedPendingData);
    }
});