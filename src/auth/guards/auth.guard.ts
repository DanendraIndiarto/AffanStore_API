import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';

// Struct/Interface untuk melampirkan payload user ke request
export interface JwtPayload {
  sub: number;
  id?: number;
  email: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: 'SECRET_KEY_AFFAN_STORE', // Nanti bisa disesuaikan dengan process.env.JWT_SECRET
      });

      // Simpan payload user ke objek request
      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kadaluwarsa',
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
