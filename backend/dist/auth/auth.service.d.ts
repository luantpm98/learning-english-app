import { PrismaService } from '../prisma/prisma.service.js';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    register(data: any): Promise<{
        id: number;
        username: string;
        name: string | null;
        role: string;
    }>;
    login(data: any): Promise<{
        id: number;
        username: string;
        name: string | null;
        role: string;
    }>;
}
