// Pages Router API route for dashboard data

// Helper function to fetch from the external API
async function fetchExternalAPI(endpoint) {
  try {
    // Get the base URL from environment variable or use default
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/${endpoint}`);

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the requested data type from the URL
    const { dataType } = req.query;

    // Add console log to debug the dataType
    console.log("Fetching data for:", dataType);

    // Handle different data types
    switch (dataType) {
      case "stats": {
        // Fetch all data in parallel
        const [hospitals, doctors, patients, cities, firstAid, registrars] =
          await Promise.all([
            fetchExternalAPI("hospitals"),
            fetchExternalAPI("doctors"),
            fetchExternalAPI("patients"),
            fetchExternalAPI("cities"),
            fetchExternalAPI("first-aid"),
            fetchExternalAPI("registrars"),
          ]);

        // Count total medical records across all patients
        const medicalRecordsCount = patients.reduce((total, patient) => {
          return total + (patient.medicalRecords?.length || 0);
        }, 0);

        return res.status(200).json({
          hospitals: hospitals.length,
          doctors: doctors.length,
          patients: patients.length,
          medicalRecords: medicalRecordsCount,
          cities: cities.length,
          firstAid: firstAid.length,
          registrars: registrars.length,
        });
      }

      case "hospitalsByLocation": {
        const hospitals = await fetchExternalAPI("hospitals");

        // Group hospitals by location
        const locationCounts = hospitals.reduce((acc, hospital) => {
          const location = hospital.location;
          if (!acc[location]) {
            acc[location] = 0;
          }
          acc[location]++;
          return acc;
        }, {});

        // Convert to array format needed for the chart
        const data = Object.entries(locationCounts).map(([name, value]) => ({
          name,
          value,
        }));

        return res.status(200).json(data);
      }

      case "patientRecordsByDisease": {
        const patients = await fetchExternalAPI("patients");

        // Extract all medical records
        const allRecords = patients.flatMap(
          (patient) => patient.medicalRecords || []
        );

        // Count occurrences of each disease
        const diseaseCounts = allRecords.reduce((acc, record) => {
          const disease = record.diseaseName;
          if (!acc[disease]) {
            acc[disease] = 0;
          }
          acc[disease]++;
          return acc;
        }, {});

        // Convert to array format needed for the chart
        const data = Object.entries(diseaseCounts).map(([name, count]) => ({
          name,
          count,
        }));

        return res.status(200).json(data);
      }

      case "staffDistribution": {
        const [doctors, firstAid, registrars] = await Promise.all([
          fetchExternalAPI("doctors"),
          fetchExternalAPI("first-aid"),
          fetchExternalAPI("registrars"),
        ]);

        const data = [
          { name: "Doctors", value: doctors.length },
          { name: "First Aid", value: firstAid.length },
          { name: "Registrars", value: registrars.length },
        ];

        return res.status(200).json(data);
      }

      case "hospitalLocations": {
        const hospitals = await fetchExternalAPI("hospitals");

        const data = hospitals.map((hospital) => ({
          id: hospital.id,
          name: hospital.name,
          location: hospital.location,
        }));

        return res.status(200).json(data);
      }

      case "recentPatients": {
        const patients = await fetchExternalAPI("patients");

        // Sort patients by creation date (newest first)
        const sortedPatients = [...patients].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Take the 5 most recent patients
        const data = sortedPatients.slice(0, 5).map((patient) => ({
          name: patient.name,
          nationalId: patient.nationalId,
          bloodType: patient.bloodType,
          registrarHospital: patient.registrarHospital,
          medicalRecords: patient.medicalRecords || [],
        }));

        return res.status(200).json(data);
      }

      default:
        return res.status(400).json({ error: "Invalid data type requested" });
    }
  } catch (error) {
    console.error("API route error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
