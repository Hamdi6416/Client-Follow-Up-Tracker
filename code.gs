/**
 * @file Google Apps Script to sync client data from a web app to a Google Sheet.
 * @summary This script handles a POST request, parses JSON client data, and writes it to a specific sheet.
 */

// --- CONFIGURATION ---
// The ID of your Google Sheet. This is the long string in the URL.
const SPREADSHEET_ID = '1FRgLuqWN5S2N89_cyVgihZ8pnaiexHWehO493ZLjjCI';
// The name of the sheet you want to write to.
const SHEET_NAME = 'Sheet1';

/**
 * Handles incoming POST requests from the web app.
 * This is the main function for syncing data.
 * @param {Object} e The event object from the POST request.
 * @returns {ContentService.TextOutput} A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    // Parse the JSON data sent from the web app.
    const clientData = JSON.parse(e.postData.contents);
    
    // Get the spreadsheet and the specific sheet by name.
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
    }

    // Call the function to write the data to the sheet.
    writeClientsToSheet(clientData, sheet);
    
    // Return a success response to the web app.
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Data synced successfully.' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // If an error occurs, log it and return an error response.
    Logger.log(error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles incoming GET requests.
 * This function is required for web app deployment but doesn't perform syncing.
 * @returns {ContentService.TextOutput} A simple welcome message.
 */
function doGet(e) {
  return ContentService.createTextOutput("Hello from the Apps Script backend! This endpoint is for POST requests only.");
}

/**
 * Writes the array of client objects to the Google Sheet.
 * This function clears existing data and appends the new data.
 * @param {Array<Object>} clients The array of client objects to write.
 * @param {Sheet} sheet The Google Sheet object to write to.
 */
function writeClientsToSheet(clients, sheet) {
  // Clear all content from the sheet, but keep the header row.
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  // Define the order of the columns to match the sheet.
  // This is crucial for correct data mapping.
  const headers = [
    "ClientID", "CompanyName", "ContactPerson", "Phone", "Email", 
    "InitialContact", "CurrentStage", "NextAction", "Deadline", 
    "PresSent", "MeetingDate", "ClientNeeds", "QuoteAmount", 
    "Status", "LastFollowUp", "NextFollowUp", "Comments"
  ];
  
  const data = clients.map(client => {
    return headers.map(header => {
      // Return the value for the corresponding header.
      // Use client[header] to access the property dynamically.
      // Handle potential undefined or null values.
      return client[header] !== undefined && client[header] !== null ? client[header] : '';
    });
  });
  
  if (data.length > 0) {
    // Append all the client data at once for better performance.
    sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  }
}
