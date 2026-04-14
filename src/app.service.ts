import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Haloo Users, Ini tandanya API sudah berjalan dengan baik!';
  }
}
