import { useUser } from "@/context/UserContext";
import { useParams } from "react-router-dom";
import MyChannel from "./MyChannel";
import WatchStream from "./WatchStream";

const Streaming = () => {
  const { topic_id } = useParams();
  const [user] = useUser();

  if (!topic_id) {
    return <div>No Streams Found</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.stream?.topic_id === topic_id) {
    return <MyChannel />;
  } else {
    return <WatchStream />;
  }
};

export default Streaming;
