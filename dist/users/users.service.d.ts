import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponse } from "./user.types";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<UserResponse>;
    validateUser(email: string, password: string): Promise<{
        email: string;
        password: string;
        name: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<UserResponse | null>;
    listUsers(): Promise<UserResponse[]>;
    private toResponse;
}
