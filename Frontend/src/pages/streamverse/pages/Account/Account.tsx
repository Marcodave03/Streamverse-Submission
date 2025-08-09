import MainLayout from "../../layouts/MainLayout";
import { useUser } from "@/context/UserContext";

const Account = () => {
  const [user, , balance, , hasFetchedUser] = useUser(); // ✅ use context's fetch flag

  if (!hasFetchedUser) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-gray-500 text-lg">
          Loading your account...
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-red-500 text-lg">
          Failed to load user. Please log in again.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 md:px-8 py-8">
        <p className="text-3xl text-black font-bold">Your Account</p>
        <br />
        <div className="flex flex-col gap-4 text-black">
          <div>
            <p className="text-xl font-semibold mb-1">👤 Username</p>
            <p className="text-lg">{user.username}</p>
          </div>

          <div>
            <p className="text-xl font-semibold mb-1">📄 Bio</p>
            <p className="text-lg">{user.bio || "No bio provided."}</p>
          </div>

          <div>
            <p className="text-xl font-semibold mb-1">🖼️ Profile Picture</p>
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-32 h-32 rounded-full border border-gray-300 object-cover"
              />
            ) : (
              <p>No profile picture.</p>
            )}
          </div>

          <div>
            <p className="text-xl font-semibold mb-1">💰 Balance</p>
            <p className="text-lg">{balance}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
