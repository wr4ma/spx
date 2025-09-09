// js/ui.js

/**
 * UI module for handling user interface interactions, DOM manipulation, and event listeners.
 */

let appState = {};
let renderFunctions = {};

/**
 * Initializes the entire UI, setting up event listeners and populating dynamic content.
 * @param {object} initialState - The initial data fetched from the API.
 * @param {object} initialRenderers - Object containing all rendering functions.
 */
export function initUI(initialState, initialRenderers) {
    appState = initialState;
    renderFunctions = initialRenderers;
    
    setupSidebar();
    setupContentSwitching();
    populateShortcuts();
    setupRefreshButton();
    setupCopyButtons();
    setupOperatorProfileSearch();
    setupTableFilters();
}

/**
 * Toggles the visibility of the loading overlay.
 * @param {boolean} show - True to show the overlay, false to hide it.
 */
export function toggleLoadingOverlay(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Shows a toast notification message.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}

/**
 * Sets up the functionality for the collapsible sidebar on mobile.
 */
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    };
    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    };

    openBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
}

/**
 * Sets up the logic for switching between different content pages (Dashboard, Reports, etc.).
 */
function setupContentSwitching() {
    const navLinks = document.querySelectorAll('.nav-link');
    let currentContent = document.getElementById('dashboard-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.dataset.target;
            const newContent = document.getElementById(targetId);

            if (!newContent || currentContent.id === targetId) return;

            // Transition out the current content
            currentContent.classList.add('opacity-0');
            
            const transitionEndHandler = () => {
                currentContent.classList.add('hidden');
                currentContent.removeEventListener('transitionend', transitionEndHandler);

                // Transition in the new content
                newContent.classList.remove('hidden');
                setTimeout(() => {
                    newContent.classList.remove('opacity-0');
                    currentContent = newContent;
                }, 50); // Small delay to ensure 'hidden' is applied before removing opacity-0

                // Update nav link styles
                navLinks.forEach(nav => nav.classList.remove('bg-gray-700', 'text-white'));
                link.classList.add('bg-gray-700', 'text-white');

                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                    document.getElementById('sidebar').classList.remove('open');
                    document.getElementById('sidebar-overlay').classList.remove('open');
                }
                
                // Initialize content for the new page
                initializePage(targetId);
            };
            
            currentContent.addEventListener('transitionend', transitionEndHandler);
        });
    });
}

/**
 * Calls the appropriate rendering and setup function for a given page ID.
 * @param {string} pageId - The ID of the content section to initialize.
 */
function initializePage(pageId) {
    switch (pageId) {
        case 'reports-content':
            renderFunctions.renderManpowerTable(appState.manpowerData);
            break;
        case 'settings-content':
            renderFunctions.renderHourlyTable(appState.hourlyData);
            break;
        case 'pictask-content':
            renderFunctions.renderPicTasks(appState.picTasks);
            break;
        case 'operator-list-content':
            renderFunctions.renderOperatorTable(appState.operatorListData);
            break;
        case 'detailed-pending-content':
            renderFunctions.renderDetailedPendingPage(appState.detailedPending);
            break;
        case 'check-operator-profile-content':
             renderFunctions.renderOperatorProfile(null, appState.operatorProfiles);
             break;
    }
}


/**
 * Populates the "MENU LAINYA" section with shortcuts based on the sidebar links.
 */
function populateShortcuts() {
    const shortcutGrid = document.getElementById('shortcut-grid');
    const sidebarNavLinks = document.querySelectorAll('#sidebar-nav .nav-link');
    if (!shortcutGrid) return;
    shortcutGrid.innerHTML = '';

    sidebarNavLinks.forEach(link => {
        const targetId = link.dataset.target;
        if (targetId !== 'contact-dev-content') { // Exclude contact link
            const linkText = link.textContent.trim();
            const linkIcon = link.querySelector('svg');

            const button = document.createElement('button');
            button.className = 'flex flex-col items-center justify-center text-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
            
            if (linkIcon) {
                const iconClone = linkIcon.cloneNode(true);
                iconClone.classList.remove('w-5', 'h-5', 'mr-3');
                iconClone.classList.add('w-8', 'h-8', 'mb-2');
                button.appendChild(iconClone);
            }
            
            const textSpan = document.createElement('span');
            textSpan.className = 'text-xs font-semibold text-gray-300';
            textSpan.textContent = linkText;
            button.appendChild(textSpan);

            button.addEventListener('click', () => link.click());
            shortcutGrid.appendChild(button);
        }
    });
}

/**
 * Sets up the event listener for the floating refresh button.
 */
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => window.location.reload());
}

/**
 * Sets up event listeners for the copy-to-clipboard buttons on the contact page.
 */
function setupCopyButtons() {
    document.getElementById('copy-email-btn').addEventListener('click', () => {
        const email = document.getElementById('contact-email').innerText;
        navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard!'));
    });
    document.getElementById('copy-phone-btn').addEventListener('click', () => {
        const phone = document.getElementById('contact-phone').innerText;
        navigator.clipboard.writeText(phone).then(() => showToast('Phone number copied to clipboard!'));
    });
}

/**
 * Sets up the search functionality for the operator profile page.
 */
function setupOperatorProfileSearch() {
    const opsIdInput = document.getElementById('ops-id-search-input');
    const nameInput = document.getElementById('name-search-input');
    const suggestionsContainer = document.getElementById('name-suggestions');

    opsIdInput.addEventListener('input', () => {
        const query = opsIdInput.value.trim().toLowerCase();
        const result = appState.operatorProfiles.find(op => op.opsId.toLowerCase() === query);
        renderFunctions.renderOperatorProfile(result, appState.operatorProfiles);
    });

    nameInput.addEventListener('input', () => {
        const query = nameInput.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';
        if (query.length < 2) {
            suggestionsContainer.classList.add('hidden');
            return;
        }

        const suggestions = appState.operatorProfiles.filter(op => op.name.toLowerCase().includes(query));
        
        if (suggestions.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            suggestions.slice(0, 5).forEach(operator => {
                const item = document.createElement('div');
                item.innerHTML = `<span class="font-bold">${operator.name}</span> <span class="text-sm text-gray-400">(${operator.opsId})</span>`;
                item.className = 'p-3 cursor-pointer hover:bg-gray-600 rounded-lg transition-colors';
                item.addEventListener('click', () => {
                    renderFunctions.renderOperatorProfile(operator, appState.operatorProfiles);
                    nameInput.value = '';
                    suggestionsContainer.classList.add('hidden');
                });
                suggestionsContainer.appendChild(item);
            });
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== nameInput) {
            suggestionsContainer.classList.add('hidden');
        }
    });
}

/**
 * Sets up event listeners for all table filter controls.
 */
function setupTableFilters() {
    // Manpower Filter
    document.getElementById('apply-filter-btn').addEventListener('click', () => renderFunctions.renderManpowerTable(appState.manpowerData));

    // Hourly Performance Filter
    document.getElementById('apply-filter-btn-hourly').addEventListener('click', () => renderFunctions.renderHourlyTable(appState.hourlyData));
    
    // Operator List Filter
    document.getElementById('apply-filter-btn-operator').addEventListener('click', () => renderFunctions.renderOperatorTable(appState.operatorListData));
    document.getElementById('filter-role-operator').addEventListener('change', () => renderFunctions.renderOperatorTable(appState.operatorListData));
}
