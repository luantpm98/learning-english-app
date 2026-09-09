var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import axios from 'axios';
let PronunciationService = class PronunciationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assessPronunciation(userId, videoId, subtitleId, fileBuffer, referenceText) {
        const region = process.env.AZURE_SPEECH_REGION;
        const key = process.env.AZURE_SPEECH_KEY;
        if (!region || !key) {
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
            const pronAssessmentParams = {
                ReferenceText: referenceText,
                GradingSystem: 'HundredMark',
                Granularity: 'Phoneme',
                Dimension: 'Comprehensive',
            };
            const pronAssessmentHeader = Buffer.from(JSON.stringify(pronAssessmentParams)).toString('base64');
            const response = await axios.post(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`, fileBuffer, {
                headers: {
                    'Ocp-Apim-Subscription-Key': key,
                    'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
                    'Pronunciation-Assessment': pronAssessmentHeader,
                },
            });
            const result = response.data;
            const score = result?.NBest?.[0]?.PronunciationAssessment?.PronScore || 0;
            return this.prisma.pronunciationRecord.create({
                data: {
                    userId,
                    videoId,
                    subtitleId,
                    s3Url: 'local://file-uploaded',
                    score,
                    feedback: result,
                },
            });
        }
        catch (error) {
            console.error('Error calling Azure Speech Service:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to assess pronunciation');
        }
    }
};
PronunciationService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PronunciationService);
export { PronunciationService };
//# sourceMappingURL=pronunciation.service.js.map