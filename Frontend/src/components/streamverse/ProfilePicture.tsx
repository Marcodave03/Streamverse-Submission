import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type ProfilePictureProps = {
  src?: string;
  username?: string;
  className?: string;
};

const ProfilePicture = ({
  src,
  className = "",
}: ProfilePictureProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="bg-purple-300">
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePicture;
