import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: {
        id: string;
    }): Promise<import("./user.types").UserResponse | null>;
    list(): Promise<import("./user.types").UserResponse[]>;
    getById(id: string): Promise<import("./user.types").UserResponse | null>;
}
