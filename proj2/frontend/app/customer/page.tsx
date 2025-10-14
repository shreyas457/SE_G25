"use client";

import ScrollUp from "@/components/Common/ScrollUp";
import Features from "@/components/Features";
import { Metadata } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, fetchWithAuth } from "@/app/lib/api";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine_type: string;
  rating: number;
}

const CustomerDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    // Only runs on client side
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "customer") {
      router.push("/signin");
      return;
    }

    setUser(currentUser);
    fetchData(currentUser.id);
  }, []);

  const fetchData = async (userId: number) => {
    try {
      // Fetch restaurants using authenticated request
      const restaurantsRes = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`
      );
      const restaurantsData = await restaurantsRes.json();
      setRestaurants(restaurantsData.slice(0, 6));

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setTimeout(() => {
      router.replace("/signin");
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mt-16 min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <header className="bg-white dark:bg-dark shadow">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-body-color">Customer Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-dark">
            <h3 className="text-sm font-medium text-body-color">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-dark dark:text-white">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-dark">
            <h3 className="text-sm font-medium text-body-color">
              Favorite Restaurants
            </h3>
            <p className="mt-2 text-3xl font-bold text-dark dark:text-white">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-dark">
            <h3 className="text-sm font-medium text-body-color">Total Spent</h3>
            <p className="mt-2 text-3xl font-bold text-dark dark:text-white">
              $0.00
            </p>
          </div>
        </div>

        {/* Available Restaurants */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">
            Available Restaurants
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="cursor-pointer rounded-lg bg-white p-6 shadow transition hover:shadow-lg dark:bg-dark"
                onClick={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <div className="mb-4 h-32 rounded bg-gray-200 dark:bg-gray-700">
                  {/* Restaurant image placeholder */}
                </div>
                <h3 className="mb-2 text-lg font-bold text-dark dark:text-white">
                  {restaurant.name}
                </h3>
                <p className="mb-2 text-sm text-body-color">
                  {restaurant.description?.substring(0, 100)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-body-color">
                    ⭐ {restaurant.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    {restaurant.cuisine_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;