import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YoutubeTranscript } from 'youtube-transcript';
import * as https from 'https';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.video.findMany({
      orderBy: { id: 'desc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.video.findUnique({
      where: { id },
      include: { subtitles: { orderBy: { startTime: 'asc' } } }
    });
  }

  async createFromYoutube(youtubeId: string, title: string, level?: string, author?: string, playlistId?: string, playlistName?: string) {
    const existingVideo = await this.prisma.video.findUnique({
      where: { youtubeId }
    });
    if (existingVideo) {
      if ((author && !existingVideo.author) || (playlistId && !existingVideo.playlistId)) {
        return this.prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            author: author || existingVideo.author,
            playlistId: playlistId || existingVideo.playlistId,
            playlistName: playlistName || existingVideo.playlistName,
          }
        });
      }
      return existingVideo;
    }

    let transcriptItems: any[] = [];
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeId);
    } catch (error: any) {
      console.log('Direct fetch failed, trying proxy...');
      try {
        const data: any = await new Promise((resolve, reject) => {
          https.get(`https://learning-english-app-henna.vercel.app/api/transcript?videoId=${youtubeId}`, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
              try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
            });
          }).on('error', reject);
        });

        if (data && data.transcript && Array.isArray(data.transcript)) {
           transcriptItems = data.transcript;
        } else {
           console.log('Proxy returned invalid data', data);
        }
      } catch (proxyError: any) {
         console.error('Proxy fetch failed:', proxyError.message);
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      console.log('Failed to fetch transcript entirely for', youtubeId);
    }

    return this.prisma.video.create({
      data: {
        youtubeId,
        title,
        level,
        author,
        playlistId,
        playlistName,
        subtitles: {
          create: transcriptItems.map((item: any, index: number, arr: any[]) => {
            const startTime = Number(item.offset) / 1000;
            const rawEndTime = (Number(item.offset) + Number(item.duration)) / 1000;
            const nextStartTime = index < arr.length - 1 ? Number(arr[index + 1].offset) / 1000 : rawEndTime;
            
            let actualEndTime = Math.min(rawEndTime, nextStartTime);
            if (actualEndTime < startTime) actualEndTime = startTime + 0.1;
            
            const text = String(item.text || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim().replace(/\n/g, ' ');
            
            return {
              startTime: isNaN(startTime) ? 0 : startTime,
              endTime: isNaN(actualEndTime) ? 0.1 : actualEndTime,
              text,
            };
          }),
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.video.delete({
      where: { id },
    });
  }

  async updateSubtitleTranslation(id: number, translation: string) {
    return this.prisma.subtitle.update({
      where: { id },
      data: { translation },
    });
  }
}
