import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useDevSlate } from '@/context/DevSlateContext';
import { ShowIdea } from '@/types/devslate';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const GENRES = [
  'Documentary', 'Factual Entertainment', 'Reality', 'Sport',
  'True Crime', 'Natural History', 'Political Documentary',
  'Social Experiment', 'Other',
];

const BROADCASTERS = [
  'ABC', 'SBS', 'Stan', 'Network 10', 'Fox Sports', 'International', 'Other',
];

export default function CustomPage() {
  const { addCustomIdea, setCurrentView } = useDevSlate();
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [format, setFormat] = useState('');
  const [genre, setGenre] = useState('');
  const [broadcaster, setBroadcaster] = useState('');
  const [whyNow, setWhyNow] = useState('');

  const canSubmit = title.trim() && logline.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const idea: ShowIdea = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      logline: logline.trim(),
      format: format.trim() || '6 × 60min Series',
      targetBroadcaster: broadcaster || 'ABC',
      genre: genre || 'Documentary',
      slateId: 'custom',
    };

    addCustomIdea(idea);
    toast.success('Idea added to Pipeline', {
      action: {
        label: 'View Pipeline',
        onClick: () => setCurrentView('pipeline'),
      },
    });
    setTitle('');
    setLogline('');
    setFormat('');
    setGenre('');
    setBroadcaster('');
    setWhyNow('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Palette className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground">Custom Slate</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Add your own show ideas — they go straight to Pipeline for research and development
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Show Title <span className="text-destructive">*</span></Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Desert Dreamers" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logline">Logline — one sentence that sells the show <span className="text-destructive">*</span></Label>
          <Textarea id="logline" value={logline} onChange={e => setLogline(e.target.value)} rows={2} placeholder="A one-sentence pitch that captures the essence of the show" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Input id="format" value={format} onChange={e => setFormat(e.target.value)} placeholder="e.g. 6 × 60min Series" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
              <SelectContent>
                {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Broadcaster</Label>
            <Select value={broadcaster} onValueChange={setBroadcaster}>
              <SelectTrigger><SelectValue placeholder="Select broadcaster" /></SelectTrigger>
              <SelectContent>
                {BROADCASTERS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whyNow">Why Now?</Label>
          <Textarea id="whyNow" value={whyNow} onChange={e => setWhyNow(e.target.value)} rows={2} placeholder="One sentence on cultural relevance or timeliness" />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 rounded-xl bg-verdict-amber text-primary-foreground font-bold text-base hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to Pipeline
        </button>
      </form>
    </div>
  );
}
