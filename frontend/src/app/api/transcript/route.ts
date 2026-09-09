import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await response.text();
    
    // Find ytInitialPlayerResponse
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/);
    if (!match) throw new Error("Could not find player response in HTML");
    
    const playerResponse = JSON.parse(match[1]);
    const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!tracks || tracks.length === 0) {
      // DUMP the HTML to see what we are getting! Or dump the playerResponse
      return NextResponse.json({ error: "No captions found for video", playerResponseKeys: Object.keys(playerResponse), hasCaptions: !!playerResponse.captions, isPlayable: playerResponse.playabilityStatus?.status });
    }
    
    // Find English track or fallback to first
    let track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode === 'en-US' || t.languageCode === 'en-GB');
    if (!track) track = tracks[0];
    
    // Fetch the XML
    const xmlResponse = await fetch(track.baseUrl);
    const xmlText = await xmlResponse.text();
    
    // Simple XML parse using regex (since we are in Edge/Serverless without DOMParser)
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
    
    if (transcript.length === 0) throw new Error("Failed to parse transcript XML");

    return NextResponse.json({ transcript });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
