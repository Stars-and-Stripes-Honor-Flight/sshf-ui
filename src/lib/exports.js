/**
 * Export utilities for downloading CSV files from API endpoints
 */

import { api } from '@/lib/api';

/**
 * Download CSV file from an API response
 * @param {Response} response - The fetch response object
 * @param {string} filename - Filename for the downloaded file
 */
async function downloadFromResponse(response, filename = 'export.csv') {
  try {
    // Get the blob from response
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}

/**
 * Download flight roster CSV
 * @param {Object} options - Export options
 * @param {string} options.flightName - Optional flight name to filter
 * @param {string} options.filter - Optional filter (All, Veterans, Guardians) - defaults to 'All'
 */
export async function downloadFlightRosterCSV(options = {}) {
  try {
    const filename = options.flightName 
      ? `flight-roster-${options.flightName}.csv`
      : 'flight-roster.csv';

    const response = await api.exportFlightRoster(
      options.flightName,
      options.filter || 'All'
    );

    return downloadFromResponse(response, filename);
  } catch (error) {
    console.error('Error downloading flight roster:', error);
    throw error;
  }
}

/**
 * Download call center follow-up CSV
 * @param {Object} options - Export options
 * @param {string} options.flightName - Optional flight name to filter
 */
export async function downloadCallCenterFollowupCSV(options = {}) {
  try {
    const filename = options.flightName
      ? `call-center-followup-${options.flightName}.csv`
      : 'call-center-followup.csv';

    const response = await api.exportCallCenterFollowup(options.flightName);

    return downloadFromResponse(response, filename);
  } catch (error) {
    console.error('Error downloading call center follow-up:', error);
    throw error;
  }
}

/**
 * Download tour lead CSV
 * @param {Object} options - Export options
 * @param {string} options.flightName - Optional flight name to filter
 */
export async function downloadTourLeadCSV(options = {}) {
  try {
    const filename = options.flightName
      ? `tour-lead-${options.flightName}.csv`
      : 'tour-lead.csv';

    const response = await api.exportTourLead(options.flightName);

    return downloadFromResponse(response, filename);
  } catch (error) {
    console.error('Error downloading tour lead:', error);
    throw error;
  }
}
