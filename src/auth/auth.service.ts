import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    const accessToken = await this.signToken(user.id, user.email, user.role);
    return { user, accessToken };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }
    const accessToken = await this.signToken(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }

  async autoLogin() {
    const id = randomUUID();
    const email = `guest-${id}@auto.local`;
    const password = randomUUID();
    const name = "Guest";

    return this.register({ email, password, name });
  }

  private async signToken(id: string, email: string, role: string) {
    return this.jwtService.signAsync({
      sub: id,
      email,
      role,
    });
  }
}
