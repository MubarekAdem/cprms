import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to HealthConnect
        </h1>
        <p className="text-xl text-gray-600">
          Your gateway to seamless healthcare management
        </p>
      </div>
      <div className="space-y-4 w-full max-w-md">
        <Link href="/signup" className="w-full">
          <Button variant="default" className="w-full text-lg py-6">
            Sign Up
          </Button>
        </Link>
        <Link href="/auth/roles-signup" className="w-full">
          <Button variant="outline" className="w-full text-lg py-6">
            Roles Sign Up
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button variant="secondary" className="w-full text-lg py-6">
            Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
