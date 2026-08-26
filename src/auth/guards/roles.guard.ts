import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Interface sederhana untuk payload User di dalam Request
interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika endpoint tidak membutuhkan role tertentu, langsung izinkan
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Pengecekan ketersediaan user dan role-nya
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki izin untuk mengakses resource ini',
      );
    }

    return true;
  }
}
