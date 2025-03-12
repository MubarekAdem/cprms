"use client";

// Client-side data fetching functions
export async function fetchDashboardData(dataType) {
  try {
    // Use the current origin for the API call
    const apiUrl = `/api/dashboard?dataType=${dataType}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching ${dataType}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${dataType}:`, error);
    return dataType === "stats" ? {} : [];
  }
}
