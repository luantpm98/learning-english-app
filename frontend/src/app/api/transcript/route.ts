import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  try {
    const url = `https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}&flat_text=false&lang=en`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com',
        'x-rapidapi-key': '8aec6454ffmsh254d9e2a11ca4bdp19adebjsne80b0c64a362'
      }
    });

    const data = await response.json();
    
    if (!data.success || !data.transcript) {
      return NextResponse.json({ error: 'Failed to fetch transcript from RapidAPI: ' + JSON.stringify(data) }, { status: 400 });
    }

    const transcript = data.transcript.map((item: any) => ({
      text: String(item.text || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      duration: parseFloat(item.duration) * 1000,
      offset: parseFloat(item.offset) * 1000
    }));

    return NextResponse.json({ transcript });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
