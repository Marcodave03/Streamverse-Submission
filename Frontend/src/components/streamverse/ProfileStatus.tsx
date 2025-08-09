import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { WifiOff } from "react-feather";

type ProfileStatusProps = {
  username?: string;
  avatar?: string;
  online?: boolean;
  topicId?: string;
};

const ProfileStatus = ({
  username,
  avatar,
  online = false,
  topicId,
}: ProfileStatusProps) => {
  // Don't render if essential props are missing
  if (!username) {
    return null;
  }

  // Generate fallback initial for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar} alt={`@${username}`} />
          <AvatarFallback className="text-xs font-medium">
            {getInitials(username)}
          </AvatarFallback>
        </Avatar>
        {topicId ? (
          <Link
            to={`/stream/${topicId}`}
            className="text-sm text-gray-700 hover:text-purple-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]"
          >
            {username}
          </Link>
        ) : (
          <span className="text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">
            {username}
          </span>
        )}
      </div>
      {online ? (
        <div className="w-3 h-3 rounded-full bg-[#6BC355] flex-shrink-0"></div>
      ) : (
        <WifiOff size={16} className="text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
};

export default ProfileStatus;
