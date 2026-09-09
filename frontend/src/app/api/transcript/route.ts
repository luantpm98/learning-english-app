import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  const urls = [
    `https://www.youtube.com/watch?v=${videoId}`,
  ];

  let playerResponse: any = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478; YSC=1; SOCS=CAI'
        }
      });
      const html = await response.text();
      const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        if (parsed.captions) {
          playerResponse = parsed;
          break; // Found working response!
        } else {
           console.log("No captions in playerResponse. playabilityStatus:", parsed.playabilityStatus?.status);
        }
      } else {
        console.log("No ytInitialPlayerResponse match for url", url);
      }
    } catch (e) {
      console.log('Failed fetching from url', url, e);
    }
  }

  if (!playerResponse || !playerResponse.captions) {
    return NextResponse.json({ error: 'No captions found or blocked by YouTube' }, { status: 400 });
  }

  try {
    const tracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
    let track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode === 'en-US' || t.languageCode === 'en-GB');
    if (!track) track = tracks[0];
    
    const xmlResponse = await fetch(track.baseUrl);
    const xmlText = await xmlResponse.text();
    
    const transcript: any[] = [];
    const regex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
    let xmlMatch;
    
    while ((xmlMatch = regex.exec(xmlText)) !== null) {
      const text = xmlMatch[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
        
      transcript.push({
        offset: parseFloat(xmlMatch[1]) * 1000,
        duration: parseFloat(xmlMatch[2]) * 1000,
        text: text
      });
    }
    
    return NextResponse.json({ transcript });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
