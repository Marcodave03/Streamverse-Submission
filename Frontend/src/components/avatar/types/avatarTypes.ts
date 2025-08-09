export interface MouthCue {
  start: number;
  end: number;
  value: string;
}

export interface AvatarProps {
  expression: string | null;
  animation: string | null;
  mouthCues: MouthCue[];
  audioDuration: number;
  modelUrl?: string; 
}
