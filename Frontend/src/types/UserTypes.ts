import { StreamType } from "./StreamTypes";
export interface UserType {
  user_id: number;
  username: string;
  bio: string;
  profile_picture: string;
  hederaAccountId: string;    
  stream?: StreamType;          
  followerCount?: number;    
}

export type SearchUserType = {
  user_id: number;
  full_name: string;
  is_live: boolean;
  profile_picture: string;
  bio: string;
  stream_title: string;
  followerCount: number;
  topic_id: string;
};
