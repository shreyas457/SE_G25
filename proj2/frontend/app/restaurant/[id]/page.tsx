// app/restaurant/[id]/page.tsx
type PageProps = { params: { id: string } };

async function getRestaurant(id: string) {
  const res = await fetch(`http://backend:8000/api/restaurants/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch restaurant");
  return res.json();
}

export default async function RestaurantDetail({ params }: PageProps) {
  const restaurant = await getRestaurant(params.id);

  if (!restaurant) {
    return (
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* ↑ pt-24 offsets a ~96px fixed navbar; adjust to pt-16/pt-20 to match your header height */}
        <h1 className="text-xl font-semibold">Restaurant not found</h1>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
      {/* ↑ pt-24 prevents overlap with fixed header */}
      <h1 className="mb-1 text-3xl font-semibold leading-tight">{restaurant.name}</h1>
      <div className="text-sm text-gray-500">{restaurant.cuisine_type}</div>
      <p className="mt-4 text-gray-800">{restaurant.description || "No description"}</p>
    </main>
  );
}
