import { Wifi } from "react-feather";
import { Button } from "./ui/button";
import { Stream } from "@/types/StreamsType";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "./ProfilePicture";

type LiveVideoCardProps = {
  stream: Stream;
};

const LiveVideoCard = ({ stream }: LiveVideoCardProps) => {
  const navigate = useNavigate();
  const UserFallback = "/assets/avatar1.png";

  return (
    <div
      key={stream.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {stream.thumbnail ? (
        <img
          src={stream.thumbnail}
          alt={stream.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-300 rounded-lg">
          <ProfilePicture
            src={stream.user.profile_picture || "/default-avatar.png"}
            username={stream.user.username}
            className="w-14 h-14"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-ellipsis line-clamp-3">
          {stream.title}
        </h2>
        <div className="flex items-center mt-2">
          <ProfilePicture
            src={stream.user.profile_picture || UserFallback}
            username={stream.user.username}
            className="w-10 h-10"
          />
          <div className="ml-4">
            <p className="text-gray-600">{stream.user.username}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button
            className="rounded-full gap-2 text-sm items-center text-white bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => navigate(`/chat/stream/${stream.topic_id}`)}
          >
            <Wifi size={20} />
            WATCH
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveVideoCard;
