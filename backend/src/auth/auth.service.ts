import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    const username = String(data?.username || '').trim().toLowerCase();
    const password = String(data?.password || '');

    if (!username || username.length < 3) {
      throw new BadRequestException('Tên tài khoản phải có ít nhất 3 ký tự');
    }
    if (!password || password.length < 4) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 4 ký tự');
    }

    const exists = await this.prisma.user.findUnique({ where: { username } });
    if (exists) {
      throw new ConflictException(`Tài khoản "${username}" đã tồn tại. Vui lòng chọn tên khác!`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: String(data?.name || username).trim(),
        role: data?.role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    return { id: user.id, username: user.username, name: user.name, role: user.role };
  }

  async login(data: any) {
    const username = String(data?.username || '').trim().toLowerCase();
    const password = String(data?.password || '');

    if (!username || !password) {
      throw new BadRequestException('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
    }

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Sai tên tài khoản hoặc mật khẩu');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Sai tên tài khoản hoặc mật khẩu');
    }

    // Record activity for today (Streak)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.studyActivity
      .upsert({
        where: { userId_date: { userId: user.id, date: today } },
        update: {},
        create: { userId: user.id, date: today },
      })
      .catch(() => {});

    return { id: user.id, username: user.username, name: user.name, role: user.role };
  }
}
