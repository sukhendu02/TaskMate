"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  return null;
}