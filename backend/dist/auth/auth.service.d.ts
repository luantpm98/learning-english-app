import { PrismaService } from '../prisma/prisma.service.js';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    register(data: any): Promise<{
        id: number;
        username: string;
    }>;
    login(data: any): Promise<{
        id: number;
        username: string;
    }>;
}
