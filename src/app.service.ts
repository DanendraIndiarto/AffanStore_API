import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Selamat Datang di API AffanStore!',
      status: 'Online',
      version: '1.0.0',
    };
  }
}
