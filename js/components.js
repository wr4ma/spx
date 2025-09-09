// js/components.js

/**
 * Component module for rendering data into the DOM.
 * Each function is responsible for updating a specific part of the UI.
 */

// Helper to format numbers with Indonesian locale
const formatNumber = (value) => {
    const cleanedValue = String(value || '').trim().replace(/,/g, '');
    const numericValue = parseInt(cleanedValue, 10);
    return isNaN(numericValue) ? (value || '') : numericValue.toLocaleString('id-ID');
};

// Helper to convert Google Drive URLs to direct image links
const convertGoogleDriveUrl = (url) => {
    if (!url) return '';
    const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
};


/**
 * Renders the main dashboard metrics into their respective cards.
 * @param {object} metrics - The dashboard metrics data object from the API.
 */
export function renderDashboardMetrics(metrics) {
    document.getElementById('date-1-label').textContent = metrics.fmProjectionDate1;
    document.getElementById('fm-projection-value-1').textContent = formatNumber(metrics.fmProjectionValue1);
    document.getElementById('fm-actual-value-1').textContent = formatNumber(metrics.fmActualValue1);
    document.getElementById('date-2-label').textContent = metrics.fmProjectionDate2;
    document.getElementById('fm-projection-value-2').textContent = formatNumber(metrics.fmProjectionValue2);
    document.getElementById('fm-actual-value-2').textContent = formatNumber(metrics.fmActualValue2);
    document.getElementById('upcoming-dc-total').textContent = formatNumber(metrics.upcomingDcTotal);
    document.getElementById('upcoming-dc-s01').textContent = formatNumber(metrics.upcomingDcS01);
    document.getElementById('upcoming-dc-s02').textContent = formatNumber(metrics.upcomingDcS02);
    document.getElementById('upcoming-dc-s03').textContent = formatNumber(metrics.upcomingDcS03);
    document.getElementById('actual-inbound-data').textContent = formatNumber(metrics.productivityActualInbound);
    document.getElementById('gap-inbound-data').textContent = formatNumber(metrics.productivityGapInbound);
    document.getElementById('actual-outbound-data').textContent = formatNumber(metrics.productivityActualOutbound);
    document.getElementById('gap-outbound-data').textContent = formatNumber(metrics.productivityGapOutbound);
    document.getElementById('pending-packed-data').textContent = formatNumber(metrics.pendingPacked);
    document.getElementById('pending-loading-data').textContent = formatNumber(metrics.pendingLoading);
    document.getElementById('antrian-data').textContent = formatNumber(metrics.dockingAntrian);
    document.getElementById('proses-bongkar-data').textContent = formatNumber(metrics.dockingProsesBongkar);
    document.getElementById('operator-out-count').textContent = formatNumber(metrics.operatorOutCount);
}

/**
 * Renders the Manpower Plan table, applying date filters.
 * @param {string[][]} allData - The full, unfiltered data from the sheet.
 */
export function renderManpowerTable(allData) {
    const tableHead = document.getElementById('manpower-table-head');
    const tableBody = document.getElementById('manpower-table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const selectedDate = document.getElementById('filter-date').value;
    const headerData = allData[1]; // Header is on the second row
    const tableData = allData.slice(2);

    const filteredData = tableData.filter(row => {
        if (!selectedDate) return true;
        const rowDateStr = row[17] ? row[17].trim().replace(/^"|"$/g, '') : '';
        if (!rowDateStr) return false;
        const [month, day, year] = rowDateStr.split('/');
        const sheetDateNormalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return sheetDateNormalized === selectedDate;
    });

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center p-4">Tidak ada data untuk tanggal yang dipilih.</td></tr>`;
        return;
    }
    
    // Render Header
    const headerRow = document.createElement('tr');
    for (let j = 18; j <= 25; j++) {
        const th = document.createElement('th');
        th.textContent = headerData[j] ? headerData[j].trim().replace(/^"|"$/g, '') : '';
        th.scope = 'col';
        th.className = 'px-6 py-3 text-center';
        if (j >= 19 && j <= 21) th.classList.add('manpower-plan-cell');
        if (j >= 22 && j <= 24) th.classList.add('manpower-actual-cell');
        headerRow.appendChild(th);
    }
    tableHead.appendChild(headerRow);

    // Render Body
    filteredData.forEach(row => {
        if (row.length > 25) {
            const tr = document.createElement('tr');
            for (let j = 18; j <= 25; j++) {
                const td = document.createElement('td');
                let cellText = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                td.textContent = (j === 18) ? `${String(cellText).padStart(2, '0')}:00` : formatNumber(cellText);
                if (j >= 19 && j <= 21) td.classList.add('manpower-plan-cell');
                if (j >= 22 && j <= 24) td.classList.add('manpower-actual-cell');
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    });
}

/**
 * Renders the Hourly Performance table, applying date filters.
 * @param {string[][]} allData - The full, unfiltered data from the sheet.
 */
export function renderHourlyTable(allData) {
    const tableHead = document.getElementById('hourly-table-head');
    const tableBody = document.getElementById('hourly-table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const selectedDate = document.getElementById('filter-date-hourly').value;
    const headerData = allData[1];
    const tableData = allData.slice(2);
    
    const filteredData = tableData.filter(row => {
        if (!selectedDate) return true;
        const rowDateStr = row[9] ? row[9].trim().replace(/^"|"$/g, '') : '';
        if (!rowDateStr) return false;
        const [month, day, year] = rowDateStr.split('/');
        const sheetDateNormalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return sheetDateNormalized === selectedDate;
    });

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4">Tidak ada data untuk tanggal yang dipilih.</td></tr>`;
        return;
    }

    // Render Header
    const headerRow = document.createElement('tr');
    for (let j = 9; j <= 15; j++) {
        const th = document.createElement('th');
        th.textContent = headerData[j] ? headerData[j].trim().replace(/^"|"$/g, '') : '';
        th.scope = 'col';
        th.className = 'px-6 py-3 text-center';
        headerRow.appendChild(th);
    }
    tableHead.appendChild(headerRow);

    // Render Body
    filteredData.forEach(row => {
        if (row.length > 15) {
            const tr = document.createElement('tr');
            for (let j = 9; j <= 15; j++) {
                const td = document.createElement('td');
                let cellText = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                td.textContent = (j > 10) ? formatNumber(cellText) : cellText;
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    });
}

/**
 * Renders the Operator List table, applying date and role filters.
 * @param {string[][]} allData - The full, unfiltered data from the sheet.
 */
export function renderOperatorTable(allData) {
    const tableHead = document.getElementById('operator-table-head');
    const tableBody = document.getElementById('operator-table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    const selectedDate = document.getElementById('filter-date-operator').value;
    const selectedRole = document.getElementById('filter-role-operator').value;
    const headerData = allData[1];
    const tableData = allData.slice(2);

    const filteredData = tableData.filter(row => {
        const rowDateStr = row[30] ? row[30].trim().replace(/^"|"$/g, '') : '';
        if (!rowDateStr) return false;
        
        const [month, day, year] = rowDateStr.split('/');
        const sheetDateNormalized = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isDateMatch = sheetDateNormalized === selectedDate;

        const rowRole = row[33] ? row[33].trim().replace(/^"|"$/g, '') : '';
        const isRoleMatch = selectedRole === 'Semua' || rowRole === selectedRole;
        
        return isDateMatch && isRoleMatch;
    });
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center p-4">Tidak ada data untuk filter yang dipilih.</td></tr>`;
        return;
    }

    // Render Header
    const headerRow = document.createElement('tr');
    for (let j = 30; j <= 38; j++) {
        const th = document.createElement('th');
        th.textContent = headerData[j] ? headerData[j].trim().replace(/^"|"$/g, '') : '';
        th.className = 'px-6 py-3 text-center';
        headerRow.appendChild(th);
    }
    tableHead.appendChild(headerRow);

    // Render Body
    filteredData.forEach(row => {
        if (row.length > 38) {
            const tr = document.createElement('tr');
            for (let j = 30; j <= 38; j++) {
                const td = document.createElement('td');
                td.textContent = row[j] ? row[j].trim().replace(/^"|"$/g, '') : '';
                td.className = 'px-6 py-4';
                if (j === 30) td.classList.add('date-cell');
                if (j >= 31 && j <= 35) td.classList.add('ops-info-cell');
                if (j >= 36 && j <= 38) td.classList.add('purpose-cell');
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    });
}


/**
 * Renders the PIC task list.
 * @param {object[]} tasks - An array of task objects.
 */
export function renderPicTasks(tasks) {
    const picTaskList = document.getElementById('pic-task-list');
    picTaskList.innerHTML = '';
    if (tasks.length === 0) {
        picTaskList.innerHTML = '<li class="text-gray-400 text-center">Tidak ada tugas.</li>';
        return;
    }
    tasks.forEach(task => {
        const icon = task.isCompleted
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-green-500 flex-shrink-0"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-1.042l-4.242 4.242-1.957-1.957a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l4.75-4.75Z" clip-rule="evenodd" /></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-red-500 flex-shrink-0"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75 9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>`;
        
        const li = document.createElement('li');
        li.className = 'flex items-center space-x-3 p-4 rounded-lg bg-gray-800 shadow-lg';
        li.innerHTML = `${icon}<span class="text-lg text-gray-200">${task.name}</span>`;
        picTaskList.appendChild(li);
    });
}

/**
 * Renders the Detailed Pending Loading page with its cards and tables.
 * @param {object} data - The detailed pending data object.
 */
export function renderDetailedPendingPage(data) {
    document.getElementById('pending-inner-total').textContent = formatNumber(data.innerTotal);
    document.getElementById('pending-outter-total').textContent = formatNumber(data.outterTotal);
    document.getElementById('pending-grand-total').textContent = formatNumber(data.grandTotal);
    document.getElementById('pending-last-update').textContent = `Last Update : ${data.lastUpdate}`;

    const innerBody = document.getElementById('detailed-pending-inner-body');
    innerBody.innerHTML = '';
    data.innerTable.forEach(item => {
        innerBody.innerHTML += `<tr><td class="px-6 py-4 text-left">${item.station}</td><td class="px-6 py-4 font-bold">${formatNumber(item.qty)}</td></tr>`;
    });

    const outterBody = document.getElementById('detailed-pending-outter-body');
    outterBody.innerHTML = '';
    data.outterTable.forEach(item => {
        outterBody.innerHTML += `<tr><td class="px-6 py-4 text-left">${item.station}</td><td class="px-6 py-4 font-bold">${formatNumber(item.qty)}</td></tr>`;
    });
}

/**
 * Displays the profile of a searched operator, or a "not found" message.
 * @param {object|null} operator - The found operator object, or null.
 * @param {object[]} allProfiles - The full list of profiles to get the total count.
 */
export function renderOperatorProfile(operator, allProfiles) {
    const profileCard = document.getElementById('operator-profile-card');
    const notFoundMessage = document.getElementById('profile-not-found');
    
    document.getElementById('total-operator-count').textContent = allProfiles.length;

    if (operator) {
        profileCard.classList.remove('hidden');
        notFoundMessage.classList.add('hidden');
        document.getElementById('profile-name').textContent = operator.name;
        document.getElementById('profile-opsid').textContent = operator.opsId;
        document.getElementById('profile-role').textContent = operator.role;
        document.getElementById('profile-vendor').textContent = `Vendor: ${operator.vendor}`;
        document.getElementById('profile-image').src = convertGoogleDriveUrl(operator.photoUrl) || 'https://placehold.co/400x400/374151/E5E7EB?text=Photo';
    } else {
        profileCard.classList.add('hidden');
        // Show not found message only if there was a search query
        if (document.getElementById('ops-id-search-input').value) {
           notFoundMessage.classList.remove('hidden');
        }
    }
}

/**
 * Updates the images on the contact card.
 * @param {object} images - An object with image URLs.
 */
export function renderContactImages(images) {
     const directImageUrl = convertGoogleDriveUrl(images.profile);
     if (directImageUrl) {
        document.getElementById('contact-banner-image').src = directImageUrl;
        document.getElementById('contact-profile-image').src = directImageUrl;
     }
}
