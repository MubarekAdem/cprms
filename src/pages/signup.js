import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [e.target.name]: e.target.value };
      console.log(updatedForm); // Debugging: Check if values are updating
      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log("Form Data Before Sending:", form); // Check form data

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("Response from API:", data); // Debugging response

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    alert("Signup successful! You can now log in.");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="w-full mb-2 p-2 border"
          type="text"
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border"
          type="text"
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border"
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button className="w-full bg-blue-500 text-white py-2">Sign Up</button>
      </form>
    </div>
  );
}
