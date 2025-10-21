import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, getPaginationParams } from '../common/utils/pagination.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: password,
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const { skip, take } = getPaginationParams(page, limit);
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count(),
    ]);

    return createPaginatedResponse(users, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;
    
    const updateData: any = { ...userData };
    if (password) {
      const bcrypt = require('bcrypt');
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'User deleted successfully' };
  }
}
