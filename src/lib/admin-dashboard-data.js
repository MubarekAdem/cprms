"use client";

// Client-side data fetching functions
export async function fetchDashboardData(dataType) {
  try {
    // Mock data for each data type to avoid API errors
    const mockData = {
      stats: {
        hospitals: 3,
        doctors: 2,
        patients: 2,
        medicalRecords: 4,
        cities: 6,
        firstAid: 2,
        registrars: 3,
      },
      hospitalsByLocation: [
        { name: "Hawasa", value: 1 },
        { name: "Adama", value: 1 },
        { name: "Gonder", value: 1 },
      ],
      patientRecordsByDisease: [
        { name: "Common cold", count: 1 },
        { name: "Diabetes", count: 1 },
        { name: "Fractured bone", count: 1 },
        { name: "STD", count: 1 },
      ],
      staffDistribution: [
        { name: "Doctors", value: 2 },
        { name: "First Aid", value: 2 },
        { name: "Registrars", value: 3 },
      ],
      hospitalLocations: [
        { id: "Bd-TG1", name: "Tibebe Ghion", location: "Hawasa" },
        { id: "BD-DF1", name: "Dr Frew", location: "Adama" },
        { id: "BD-DF11", name: "Zagra", location: "Gonder" },
      ],
      recentPatients: [
        {
          name: "Mubarek Adem Yehiya",
          nationalId: "5365873098642047",
          bloodType: "A-",
          registrarHospital: "Dream Care",
          medicalRecords: [
            { diseaseName: "Common cold" },
            { diseaseName: "Diabetes" },
          ],
        },
        {
          name: "Abebe Kebede Alemu",
          nationalId: "6465873098642047",
          bloodType: "AB+",
          registrarHospital: "Dream Care",
          medicalRecords: [
            { diseaseName: "Fractured bone" },
            { diseaseName: "STD" },
          ],
        },
      ],
    };

    // Return mock data for now to avoid API errors
    return mockData[dataType];

    // When API is working, uncomment this code:
    /*
    const apiUrl = `/api/dashboard?dataType=${dataType}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching ${dataType}: ${response.statusText}`);
    }
    return await response.json();
    */
  } catch (error) {
    console.error(`Failed to fetch ${dataType}:`, error);
    return dataType === "stats" ? {} : [];
  }
}
