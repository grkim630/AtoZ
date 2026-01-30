import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: CreateUserDto): Promise<{
        user: import("../users/user.types").UserResponse;
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    auto(): Promise<{
        user: import("../users/user.types").UserResponse;
        accessToken: string;
    }>;
    me(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
