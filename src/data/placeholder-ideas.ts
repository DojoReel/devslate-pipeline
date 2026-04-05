import { ShowIdea, SlateId } from '@/types/devslate';

const makeId = () => crypto.randomUUID();

export const PLACEHOLDER_IDEAS: Record<SlateId, ShowIdea[]> = {
  abc: [
    { id: makeId(), title: 'Outback Medics', logline: 'Following the Royal Flying Doctor Service across remote Australia, capturing life-and-death decisions in the most isolated communities on Earth.', format: '6 × 60min Series', targetBroadcaster: 'ABC', genre: 'Factual Entertainment', slateId: 'abc' },
    { id: makeId(), title: 'First Languages', logline: 'Indigenous linguists race to document and revive endangered Aboriginal languages before the last fluent speakers are gone.', format: '4 × 60min Series', targetBroadcaster: 'SBS', genre: 'Documentary', slateId: 'abc' },
    { id: makeId(), title: 'The Ballot', logline: 'An election cycle told entirely from the perspective of first-time voters across diverse Australian electorates.', format: '3 × 90min Event Series', targetBroadcaster: 'ABC', genre: 'Political Documentary', slateId: 'abc' },
    { id: makeId(), title: 'Reef Patrol', logline: 'Marine scientists and Indigenous rangers battle coral bleaching, illegal fishing, and climate change on the Great Barrier Reef.', format: '8 × 45min Series', targetBroadcaster: 'ABC', genre: 'Natural History', slateId: 'abc' },
    { id: makeId(), title: 'New Roots', logline: 'Refugee families build new lives in regional Australian towns, transforming communities and confronting prejudice.', format: '6 × 60min Series', targetBroadcaster: 'SBS', genre: 'Human Interest', slateId: 'abc' },
  ],
  stan: [
    { id: makeId(), title: 'Cold Cases Reloaded', logline: 'A retired detective and a forensic data analyst use cutting-edge technology to reopen Australia\'s most baffling unsolved murders.', format: '8 × 60min Series', targetBroadcaster: 'Stan', genre: 'True Crime', slateId: 'stan' },
    { id: makeId(), title: 'Hustle Sydney', logline: 'Five entrepreneurs risk everything in twelve months to build startups from scratch in Australia\'s most expensive city.', format: '10 × 45min Series', targetBroadcaster: 'Stan', genre: 'Business Reality', slateId: 'stan' },
    { id: makeId(), title: 'Underground Kings', logline: 'The untold story of Australia\'s opal mining communities — where fortunes are made and lost in the dark tunnels of Coober Pedy.', format: '6 × 60min Series', targetBroadcaster: 'Stan', genre: 'Factual Drama', slateId: 'stan' },
    { id: makeId(), title: 'The Algorithm', logline: 'Social media influencers compete in challenges that expose how platforms manipulate behaviour, attention, and truth.', format: '8 × 45min Series', targetBroadcaster: 'Stan', genre: 'Competition Reality', slateId: 'stan' },
  ],
  sport: [
    { id: makeId(), title: 'Fight Camp', logline: 'Inside the brutal world of Australian boxing gyms, where young fighters from tough backgrounds train for a shot at the title.', format: '8 × 60min Series', targetBroadcaster: 'Fox Sports', genre: 'Sports Documentary', slateId: 'sport' },
    { id: makeId(), title: 'Grassroots', logline: 'The heart and soul of suburban rugby league — following five clubs through a season where everything is on the line.', format: '10 × 45min Series', targetBroadcaster: 'Fox Sports', genre: 'Sports Reality', slateId: 'sport' },
    { id: makeId(), title: 'The Draft', logline: 'Behind the scenes of the AFL draft process, tracking five hopefuls from regional combines to draft night.', format: '6 × 60min Series', targetBroadcaster: 'Fox Footy', genre: 'Sports Documentary', slateId: 'sport' },
    { id: makeId(), title: 'Wave Hunters', logline: 'Big wave surfers chase the most dangerous swells across Australia\'s Southern Ocean coastline.', format: '6 × 45min Series', targetBroadcaster: 'Fox Sports', genre: 'Adventure Sports', slateId: 'sport' },
  ],
  international: [
    { id: makeId(), title: 'Pacific Rising', logline: 'Climate refugees from sinking Pacific Island nations navigate resettlement, cultural loss, and political neglect.', format: '4 × 90min Event Series', targetBroadcaster: 'BBC / Netflix', genre: 'Current Affairs', slateId: 'international' },
    { id: makeId(), title: 'Silk Road Kitchens', logline: 'A chef traces the ancient Silk Road through Central Asia, cooking with locals and uncovering food traditions that shaped civilisation.', format: '8 × 60min Series', targetBroadcaster: 'Netflix / SBS', genre: 'Travel Food', slateId: 'international' },
    { id: makeId(), title: 'Border Towns', logline: 'Life in the world\'s most contested border towns — from the DMZ to Kashmir — told through the families who live there.', format: '6 × 60min Series', targetBroadcaster: 'HBO / BBC', genre: 'Geopolitical Documentary', slateId: 'international' },
  ],
  custom: [
    { id: makeId(), title: 'Your Idea Here', logline: 'Add your own show ideas to this custom slate and run them through the DevSlate pipeline.', format: 'TBD', targetBroadcaster: 'TBD', genre: 'Custom', slateId: 'custom' },
    { id: makeId(), title: 'Pitch Lab', logline: 'A meta-documentary following producers as they use AI tools to develop and pitch unscripted television concepts.', format: '4 × 30min Series', targetBroadcaster: 'YouTube / Stan', genre: 'Behind the Scenes', slateId: 'custom' },
  ],
};
