import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard) // Mengunci seluruh route di controller ini
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Khusus ADMIN: Membuat user baru via dashboard admin
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 2. Khusus ADMIN: Melihat daftar semua user
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 3. User Login / Admin: Melihat detail 1 user berdasarkan ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 4. User Login / Admin: Update data user berdasarkan ID
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // 5. Khusus ADMIN: Menghapus akun user
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
