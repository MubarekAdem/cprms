import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", { ...form, redirect: false });

    if (res.error) {
      setError(res.error);
      return;
    }

    // Fetch the user session after login
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.role === "admin") {
      router.push("/admin-doctor");
    } else if (session?.user?.role === "registrar") {
      router.push("/registrar-patient-add");
    } else {
      router.push("/"); // Default route if role is not recognized
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="w-full mb-2 p-2 border"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button className="w-full bg-blue-500 text-white py-2">Login</button>
      </form>
    </div>
  );
}
