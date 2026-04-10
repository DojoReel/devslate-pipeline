import { Palette } from 'lucide-react';

export default function CustomPage() {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
      <Palette className="w-12 h-12 mb-4 opacity-40" />
      <p className="text-lg font-semibold text-foreground">Custom Slate</p>
      <p className="text-sm mt-1">Add your own show ideas and run them through the pipeline.</p>
    </div>
  );
}
