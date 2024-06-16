import { useState, useEffect } from "react";
import { User } from "@prisma/client";

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/session");

      if (!response.ok) {
        setError(new Error("An error occurred while fetching user"));
        setLoading(false);
        setUser(null);
        return;
      }

      const { user } = (await response.json()) as { user: User };
      setUser(user);
      setLoading(false);
      setError(null);
    };

    fetchUser();
  }, []);

  return { data: user, loading, error };
}

export default useAuth;
