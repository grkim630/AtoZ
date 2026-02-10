import { UserRole } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
