import { Hammer } from 'lucide-react';

export default function BuildRoomPage() {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
      <Hammer className="w-12 h-12 mb-4 opacity-40" />
      <p className="text-lg font-semibold text-foreground">Build Room</p>
      <p className="text-sm mt-1">Develop your greenlit ideas into full pitch documents.</p>
    </div>
  );
}
