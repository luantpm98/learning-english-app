import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import axios from 'axios';

@Injectable()
export class PronunciationService {
  constructor(private prisma: PrismaService) {}

  async assessPronunciation(
    userId: number,
    videoId: number,
    subtitleId: number,
    fileBuffer: Buffer,
    referenceText: string,
  ) {
    const region = process.env.AZURE_SPEECH_REGION;
    const key = process.env.AZURE_SPEECH_KEY;

    if (!region || !key) {
      // Mock result if no Azure key is configured
      const mockScore = Math.floor(Math.random() * (100 - 60) + 60);
      return this.prisma.pronunciationRecord.create({
        data: {
          userId,
          videoId,
          subtitleId,
          s3Url: 'local://mock',
          score: mockScore,
          feedback: { message: 'Mocked feedback since Azure keys are missing' },
        },
      });
    }

    try {
      // Azure Pronunciation Assessment parameters
      const pronAssessmentParams = {
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
        Dimension: 'Comprehensive',
      };
      const pronAssessmentHeader = Buffer.from(
        JSON.stringify(pronAssessmentParams),
      ).toString('base64');

      const response = await axios.post(
        `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
        fileBuffer,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
            'Pronunciation-Assessment': pronAssessmentHeader,
          },
        },
      );

      const result = response.data;
      const score = result?.NBest?.[0]?.PronunciationAssessment?.PronScore || 0;

      // Save to database
      return this.prisma.pronunciationRecord.create({
        data: {
          userId,
          videoId,
          subtitleId,
          s3Url: 'local://file-uploaded', // Replace with S3 logic later
          score,
          feedback: result,
        },
      });
    } catch (error: any) {
      console.error('Error calling Azure Speech Service:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to assess pronunciation');
    }
  }
}

