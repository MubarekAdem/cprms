import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AdminDoctor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (!session || session.user.role !== "admin") {
      router.replace("/"); // Redirect unauthorized users
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return <p>Loading...</p>; // Show a loading state
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Doctor Panel</h1>
      <p>Welcome, {session.user.email}</p>
    </div>
  );
}
