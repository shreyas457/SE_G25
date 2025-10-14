"use client";

import Link from "next/link";
import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";

type UserType = "customer" | "restaurant_owner" | "driver" | "";

interface AddressInfo {
  street: string;
  lat?: number;
  lon?: number;
}

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  address: AddressInfo; 
  password: string;
  role: UserType;
  restaurant_name: string;
  license_number: string;
  vehicle_model: string;
  agreedToTerms: boolean;
}

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      lat: undefined,
      lon: undefined,
    },
    password: "",
    role: "",
    restaurant_name: "",
    license_number: "",
    vehicle_model: "",
    agreedToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize OpenStreetMapProvider only on client
  useEffect(() => {
    (async () => {
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      setProvider(new OpenStreetMapProvider());
    })();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🌍 Address Autocomplete
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update only the street while keeping other fields intact
    setFormData((prev) => ({
      ...prev,
      address: {
        ...(typeof prev.address === "object" ? prev.address : {}),
        street: value,
      },
    }));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!provider || value.length < 3) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      const results = await provider.search({ query: value });
      setSuggestions(results);
    }, 400);
};

  const handleAddressSelect = (result: any) => {
    const { label, x, y, raw } = result;
    console.log(result)
  
    setFormData((prev) => ({
      ...prev,
      address: {
        street: label,
        lat: y,
        lon: x,
      },
    }));
    setSuggestions([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { name, email, password, role, agreedToTerms } = formData;

    if (!name || !email || !password || !role) {
      setError("Please fill in all required fields");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (role === "customer" && (!formData.address || !formData.phone)) {
      setError("Please enter your phone and address");
      return;
    }
    if (
      role === "restaurant_owner" &&
      (!formData.restaurant_name || !formData.address)
    ) {
      setError("Please enter your business details");
      return;
    }
    if (
      role === "driver" &&
      (!formData.license_number || !formData.vehicle_model)
    ) {
      setError("Please enter your license and vehicle details");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({...formData, address: formData.address}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: {
          street: "",
          lat: undefined,
          lon: undefined,
        },
        password: "",
        role: "",
        restaurant_name: "",
        license_number: "",
        vehicle_model: "",
        agreedToTerms: false,
      });

      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Create your account
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                It&apos;s totally free and super easy
              </p>

              {error && (
                <div className="mb-6 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 rounded bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Account created successfully! Redirecting to sign in...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-8">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-sm text-dark dark:text-white"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                </div>

                {/* Email */}
                <div className="mb-8">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-sm text-dark dark:text-white"
                  >
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                </div>

                {/* User Type */}
                <div className="mb-8">
                  <label
                    htmlFor="role"
                    className="mb-3 block text-sm text-dark dark:text-white"
                  >
                    Select User Type
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  >
                    <option value="">-- Choose --</option>
                    <option value="customer">Customer</option>
                    <option value="restaurant_owner">Restaurant Owner</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                {/* Customer Fields */}
                {formData.role === "customer" && (
                  <>
                    <div className="mb-8">
                      <label htmlFor="phone" className="mb-3 block text-sm text-dark dark:text-white">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="989-104-1456"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    {/* Address Autocomplete */}
                    <div className="mb-8 relative">
                      <label className="mb-3 block text-sm text-dark dark:text-white">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={typeof formData.address === "object" ? formData.address.street || "" : ""}
                        onChange={handleAddressChange}
                        placeholder="Enter your address"
                        autoComplete="off"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {suggestions.length > 0 && (
                        <ul className="text-sm text-dark dark:text-white border rounded-md max-h-48 overflow-y-auto">
                          {suggestions.map((r, i) => (
                            <li
                              key={i}
                              onClick={() => handleAddressSelect(r)}
                              className="p-2 cursor-pointer text-sm border border-transparent rounded transition-all duration-200 hover:border-primary"
                            >
                              {r.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {/* restaurant_owner Fields */}
                {formData.role === "restaurant_owner" && (
                  <>
                    <div className="mb-8">
                      <label className="mb-3 block text-sm text-dark dark:text-white">Business Name</label>
                      <input
                        type="text"
                        name="restaurant_name"
                        value={formData.restaurant_name}
                        onChange={handleChange}
                        placeholder="Enter your business name"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    {/* Business Address */}
                    <div className="mb-8 relative">
                      <label className="mb-3 block text-sm text-dark dark:text-white">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={typeof formData.address === "object" ? formData.address.street || "" : ""}
                        onChange={handleAddressChange}
                        placeholder="Enter your business address"
                        autoComplete="off"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                      {suggestions.length > 0 && (
                        <ul className="text-sm text-dark dark:text-white border rounded-md max-h-48 overflow-y-auto">
                          {suggestions.map((r, i) => (
                            <li
                              key={i}
                              onClick={() => handleAddressSelect(r)}
                              className="p-2 cursor-pointer text-sm border border-transparent rounded transition-all duration-200 hover:border-primary"
                            >
                              {r.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {/* Driver Fields */}
                {formData.role === "driver" && (
                  <>
                    <div className="mb-8">
                      <label htmlFor="phone" className="mb-3 block text-sm text-dark dark:text-white">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="989-104-1456"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="mb-3 block text-sm text-dark dark:text-white">License Number</label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        placeholder="Enter license number"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="mb-3 block text-sm text-dark dark:text-white">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicle_model"
                        value={formData.vehicle_model}
                        onChange={handleChange}
                        placeholder="Enter vehicle number"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="mb-8">
                  <label htmlFor="password" className="mb-3 block text-sm text-dark dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                </div>

                {/* Terms */}
                <div className="mb-8 flex items-start">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mr-3 mt-1"
                  />
                  <label className="text-sm text-body-color">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? "Signing up..." : "Sign up"}
                  </button>
                </div>
              </form>

              <p className="text-center text-base font-medium text-body-color">
                Already using Startup?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
