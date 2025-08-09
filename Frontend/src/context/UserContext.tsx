import { createContext, useContext, useEffect, useState } from "react";
import { PropsWithChildren } from "react";
import { UserType } from "../types/UserTypes";
import { BASE_URL } from "../config/constants";
import axios from "axios";

type UserContextType = [
  UserType | null,
  () => void,
  string,
  () => void,
  boolean
];

const UserContext = createContext<UserContextType>([
  null,
  () => {},
  "0",
  () => {},
  false,
]);

export function UserProvider({ children }: PropsWithChildren<object>) {
  const [user, setUser] = useState<UserType | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [hasFetchedUser, setHasFetchedUser] = useState<boolean>(false);

  const fetchUser = async () => {
    console.log("🔥 fetchUser() triggered");
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("🚫 No token found in localStorage");
      setUser(null);
      setBalance("0");
      setHasFetchedUser(true);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/account/account-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;
      if (!userData) {
        throw new Error("Invalid user response from backend");
      }

      const decoded = jwtDecode<{ id: number, accountId: string }>(token);

      setUser({
        user_id: decoded.id,
        username: userData.username,
        bio: userData.bio,
        profile_picture: userData.profile_picture,
        hederaAccountId: decoded.accountId ?? "", // ✅ fallback to empty string
        stream: userData.stream ?? undefined, // ✅ fallback to undefined
        followerCount: userData.followerCount ?? 0, // ✅ fallback to 0
      });

      setBalance(userData.balance);
    } catch (error: unknown) {
      console.error("❌ Error fetching user:", error);
      setUser(null);
      setBalance("0");
    } finally {
      setHasFetchedUser(true); // ✅ flag only set after attempt completes
    }
  };

  const fetchBalance = async () => {
    await fetchUser();
  };

  useEffect(() => {
    console.log("🔁 useEffect called in UserProvider");
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={[user, fetchUser, balance, fetchBalance, hasFetchedUser]}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// Minimal JWT decode implementation (no validation, just payload extraction)
function jwtDecode<T>(token: string): T {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as T;
  } catch {
    throw new Error("Invalid JWT token");
  }
}

