// Example schema for MongoDB (using Mongoose)

const hospitalSchema = new mongoose.Schema({
  name: String,
  id: String,
  location: String,
  proofDocument: String, // URL to the uploaded file in Supabase
});

const Hospital = mongoose.model("Hospital", hospitalSchema);
