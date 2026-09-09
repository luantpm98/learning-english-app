import { AuthService } from './auth.service.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        id: number;
        username: string;
    }>;
    login(body: any): Promise<{
        id: number;
        username: string;
    }>;
}
