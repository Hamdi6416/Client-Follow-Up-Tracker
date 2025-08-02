// --- DOM Elements ---
const clientTableBody = document.getElementById('clientTableBody');
const clientForm = document.getElementById('clientForm');
const clientModal = document.getElementById('clientModal');
const clientDetailsModal = document.getElementById('clientDetailsModal');
const modalTitle = document.getElementById('modalTitle');
const emailModal = document.getElementById('emailModal');
const hamdiTaskList = document.getElementById('hamdiTaskList');
const dinaTaskList = document.getElementById('dinaTaskList');
const statsGrid = document.getElementById('statsGrid');
const searchInput = document.getElementById('searchClients');
const messageBox = document.getElementById('messageBox');
const themeSwitcher = document.getElementById('themeSwitcher');
const themeIcon = document.getElementById('themeIcon');

// --- State ---
let clients = [];
let editingClient = null;
let selectedTemplate = null;
let currentEmailClient = null;
let currentDetailsClient = null;

// --- Theme ---
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('clientTheme', newTheme);
    themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
}
function loadTheme() {
    const theme = localStorage.getItem('clientTheme') || 'light';
    document.body.setAttribute('data-theme', theme);
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
}
themeSwitcher.onclick = toggleTheme;

// --- Notifications ---
function showMessage(text, type = 'success', timeout = 2000) {
    messageBox.textContent = text;
    messageBox.className = 'message-box visible ' + type;
    setTimeout(() => {
        messageBox.classList.remove('visible');
    }, timeout);
}

// --- Google Sheets Sync ---
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxm79W-bqEmKqgty9CHM3psc-aozvNpFear6JcmKXfCPpIOsWIrZdnWld7n9rpycsFn/exec";

// Save (write) all client data to Google Sheets
async function syncToGoogleSheets() {
    try {
        showMessage("Syncing to Google Sheets...", "info", 2500);
        const res = await fetch(SHEET_URL, {
            method: "POST",
            body: JSON.stringify(clients),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success) {
            showMessage("Data synced to Google Sheets!", "success");
        } else {
            showMessage("Google Sheets sync FAILED: " + data.message, "error", 5000);
        }
    } catch (err) {
        showMessage("Google Sheets sync ERROR: " + err.message, "error", 5000);
    }
}

// (Optional) Fetch all rows from your Google Sheet (for loading on page)
async function fetchClientsFromGoogleSheets() {
    // You need to update Code.gs to support GET and return JSON array of clients.
    // For now, just loads from localStorage as fallback.
    // Uncomment below if you implement GET endpoint in Apps Script
    /*
    try {
        const res = await fetch(SHEET_URL);
        const data = await res.json();
        if (Array.isArray(data.clients)) {
            clients = data.clients;
            saveClients();
        }
    } catch (err) {
        showMessage("Failed to load from Google Sheets: " + err.message, "error");
    }
    */
    loadClients();
}

// --- Local Storage Fallback ---
function loadClients() {
    const saved = localStorage.getItem('clientTracker_clients');
    clients = saved ? JSON.parse(saved) : [];
}
function saveClients() {
    localStorage.setItem('clientTracker_clients', JSON.stringify(clients));
}

// ...The rest of your app logic (renderClients, openClientModal, deleteClient, etc.) goes here...
// It's the same as your current script, but remove any localStorage-only sync if you want Google Sheets only.

// --- Initial Load ---
function init() {
    loadTheme();
    fetchClientsFromGoogleSheets();
    renderClients();
    renderStats();
    renderTasks();
    lucide.createIcons();
}
window.onload = init;

// --- Add event listeners for all modal buttons, form submits, etc., here ---
// For example:
document.getElementById('syncBtn').onclick = syncToGoogleSheets;

// ...and so on for each button or UI element...
