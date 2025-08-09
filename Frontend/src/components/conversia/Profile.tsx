import type React from "react";
import { useEffect, useState } from "react";
import { X, Copy, Edit2, Save, User, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "./ui/textarea";
import Logo from "../../assets/conversia-svg.png";
import { jwtDecode } from "jwt-decode";
import AvatarPick from "./AvatarPick";


interface ProfileProps {
  onClose: () => void;
}

type JwtPayload = {
  id: number;
  accountId: string;
  iat: number;
  exp: number;
};

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const host = import.meta.env.VITE_HOST;
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("loading...");
  const [newUsername, setNewUsername] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState<string>("");
  const [newBio, setNewBio] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [newProfilePicture, setNewProfilePicture] = useState<string>("");
  const [hederaBalance, setHederaBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    try {
      const decoded: JwtPayload = jwtDecode(token);
      setAccountId(decoded.accountId);
    } catch (err) {
      console.error("JWT decode failed:", err);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      try {
        const res = await fetch(`${host}/api/account/account-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUsername(data.user.username || "anonymous");
          setNewUsername(data.user.username || "");
          setBio(data.user.bio || "");
          setNewBio(data.user.bio || "");
          setProfilePicture(data.user.profile_picture || "");
          setNewProfilePicture(data.user.profile_picture || "");
          setHederaBalance(data.user.balance || "0");
        }
      } catch (e) {
        console.error("User fetch error:", e);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    setIsLoading(true);
    const payload: Partial<{
      username: string;
      bio: string;
      profile_picture: string;
      model_id: number;
    }> = {};
    if (newUsername !== username) payload.username = newUsername;
    if (newBio !== bio) payload.bio = newBio;
    if (newProfilePicture !== profilePicture) {
      payload.profile_picture = newProfilePicture;

      const match = newProfilePicture.match(/girl(\d+)\.png$/);
      if (match) {
        payload.model_id = parseInt(match[1]);
      }
    }

    try {
      const res = await fetch(`${host}/api/account/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsername(data.user.username);
        setBio(data.user.bio);
        setProfilePicture(data.user.profile_picture);
        setEditing(false);
      } else {
        console.error("⚠️ Update failed:", data.message);
      }
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
    } finally {
      setIsLoading(false);
    }

    payload.profile_picture = newProfilePicture;

    const match = newProfilePicture.match(/girl(\d+)\.png$/);
    if (match) {
      payload.model_id = parseInt(match[1]);
    }

    try {
      const res = await fetch(`${host}/api/account/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsername(data.user.username);
        setBio(data.user.bio);
        setProfilePicture(data.user.profile_picture);
        setEditing(false);
      } else {
        console.error("⚠️ Update failed:", data.message);
      }
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setNewUsername(username);
    setNewBio(bio);
    setNewProfilePicture(profilePicture);
  };

  const handleCancel = () => {
    setEditing(false);
    setNewUsername(username);
    setNewBio(bio);
    setNewProfilePicture(profilePicture);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {showAvatarModal && (
        <AvatarPick
          onClose={() => setShowAvatarModal(false)}
          onSelectAvatar={(_, modelId) => {
            const pngUrl = `/assets/girl${modelId}.png`; // assumes asset naming matches
            setNewProfilePicture(pngUrl);
            if (editing) setProfilePicture(pngUrl);
            setShowAvatarModal(false);
          }}
        />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage
                  src={editing ? newProfilePicture : profilePicture}
                  alt={username}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}

              {/* {editing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  onClick={() => {
                    const url = prompt(
                      "Enter profile picture URL:",
                      newProfilePicture
                    );
                    if (url !== null) setNewProfilePicture(url);
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )} */}
            </div>

            {editing && (
              <div className="w-full max-w-sm">
                <Input
                  placeholder="Profile picture URL"
                  value={newProfilePicture}
                  onChange={(e) => setNewProfilePicture(e.target.value)}
                  className="text-center text-sm"
                />
              </div>
            )}
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img
                  src={Logo || "/placeholder.svg"}
                  alt="HBAR"
                  className="w-6 h-6"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hedera Balance
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {hederaBalance} HBAR
              </p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Username */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </span>
                  </div>
                  {editing ? (
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-48"
                      placeholder="Enter username"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {username}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hedera Account ID */}
            {accountId && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={Logo || "/placeholder.svg"}
                        alt="Hedera"
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Account ID
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                      {accountId}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopy}
                        className="h-8 w-8"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium text-gray-700 dark:text-gray-300">
                  {username} bio :{" "}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {editing ? (
                  <Textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[80px] resize-none"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white text-sm leading-relaxed min-h-[60px]">
                    {bio || "No bio added yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  variant={"ghost"}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            Authenticated via JWT + Hedera
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
