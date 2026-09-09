import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    const exists = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (exists) throw new ConflictException('Username already taken');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.username,
      }
    });

    return { id: user.id, username: user.username };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Record activity for today (Streak)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.studyActivity.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {},
      create: { userId: user.id, date: today }
    });

    return { id: user.id, username: user.username };
  }
}
