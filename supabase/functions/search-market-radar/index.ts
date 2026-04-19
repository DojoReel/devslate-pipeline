import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// THIS FUNCTION FETCHES REAL RSS FEEDS ONLY. NO AI. NO GENERATION. NO FABRICATION.
// Source: if.com.au, mediaweek.com.au, tvtonight.com.au, tvblackbox.com.au, screenhub.com.au
// DO NOT REPLACE THIS WITH AN AI GENERATION FUNCTION.

const RSS_FEEDS = [
  { url: 'https://if.com.au/feed/', domain: 'if.com.au' },
  { url: 'https://www.mediaweek.com.au/feed/', domain: 'mediaweek.com.au' },
  { url: 'https://tvtonight.com.au/feed', domain: 'tvtonight.com.au' },
  { url: 'https://tvblackbox.com.au/feed/', domain: 'tvblackbox.com.au' },
  { url: 'https://screenhub.com.au/feed/', domain: 'screenhub.com.au' },
];

const RELEVANT = ['documentary','docuseries','unscripted','factual','commission','commissioned','greenlit','greenlight','ratings','oztam','screen australia','binge','stan','paramount','netflix','amazon','disney','apple tv','foxtel','nitv'];
const EXCLUDE = ['scripted drama','soap opera','sitcom','game show','cricket','football','afl ','nrl ','rugby','tennis'];

function classify(title: string, desc: string): string | null {
  const t = (title + ' ' + desc).toLowerCase();
  if (EXCLUDE.some(k => t.includes(k))) return null;
  if (!RELEVANT.some(k => t.includes(k))) return null;
  if (t.includes('commission') || t.includes('greenlit') || t.includes('ordered')) return 'COMMISSION';
  if (t.includes('rating') || t.includes('viewer') || t.includes('audience') || t.includes('oztam')) return 'RATINGS';
  if (t.includes('trend') || t.includes('format') || t.includes('surge') || t.includes('decline')) return 'FORMAT TREND';
  return 'INDUSTRY NEWS';
}

function getBroadcaster(title: string, desc: string): string {
  const t = (title + ' ' + desc).toLowerCase();
  if (t.includes('netflix')) return 'Netflix';
  if (t.includes('amazon') || t.includes('prime video')) return 'Amazon';
  if (t.includes('disney')) return 'Disney+';
  if (t.includes('paramount')) return 'Paramount+';
  if (t.includes('binge')) return 'Binge';
  if (t.includes('stan')) return 'Stan';
  if (t.includes('foxtel')) return 'Foxtel';
  if (t.includes('nitv')) return 'NITV';
  if (t.includes('sbs')) return 'SBS';
  if (t.includes('abc')) return 'ABC';
  if (t.includes('network 10') || t.includes(' ten ')) return 'Network 10';
  if (t.includes('nine')) return 'Nine';
  if (t.includes('seven')) return 'Seven';
  if (t.includes('screen australia')) return 'Screen Australia';
  return 'Industry';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#\d+;/g,'').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
}

function parseDate(s: string | null): string {
  if (!s) return new Date().toISOString().split('T')[0];
  try { const d = new Date(s); if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]; return d.toISOString().split('T')[0]; }
  catch { return new Date().toISOString().split('T')[0]; }
}

async function fetchFeed(feed: {url:string,domain:string}): Promise<any[]> {
  try {
    const res = await fetch(feed.url, { headers: {'User-Agent':'Pitchfire/1.0'}, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: any[] = [];
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    for (const m of xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)) {
      const x = m[1];
      const title = stripHtml((x.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '');
      const link = ((x.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim();
      const desc = stripHtml((x.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '').substring(0,400);
      const pubDate = ((x.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '').trim();
      if (!title || !link || !link.includes(feed.domain)) continue;
      const date = parseDate(pubDate);
      if (new Date(date) < sixMonthsAgo) continue;
      const cat = classify(title, desc);
      if (!cat) continue;
      items.push({ category: cat, headline: title.substring(0,120), summary: desc || title, broadcaster: getBroadcaster(title, desc), source_url: link, published_date: date });
    }
    return items;
  } catch(e) { console.error(`Error ${feed.url}:`, e); return []; }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const all: any[] = [];
    for (const feed of RSS_FEEDS) { all.push(...await fetchFeed(feed)); }
    const seenUrls = new Set<string>();
    const unique = all.filter(i => { if(seenUrls.has(i.source_url)) return false; seenUrls.add(i.source_url); return true; });
    const { data: existing } = await supabase.from('market_radar_items').select('source_url');
    const existingUrls = new Set((existing||[]).map((r:any)=>r.source_url));
    const toInsert = unique.filter(i => !existingUrls.has(i.source_url));
    if (toInsert.length === 0) return new Response(JSON.stringify({success:true,inserted:0,done:true}), {headers:{...corsHeaders,'Content-Type':'application/json'}});
    const {error} = await supabase.from('market_radar_items').insert(toInsert);
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({success:true,inserted:toInsert.length,done:true}), {headers:{...corsHeaders,'Content-Type':'application/json'}});
  } catch(e:any) {
    return new Response(JSON.stringify({success:false,error:e.message}), {status:500,headers:{...corsHeaders,'Content-Type':'application/json'}});
  }
});
