import { AuthService } from './auth.service.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        id: number;
        username: string;
        name: string | null;
        role: string;
    }>;
    login(body: any): Promise<{
        id: number;
        username: string;
        name: string | null;
        role: string;
    }>;
}
