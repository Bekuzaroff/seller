import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  greet(): string {
    return 'Welcome to my API where you can ' +
    'login and sell products to another users, Tech stack: TypeScript, ' +
    'Nest.js, postgreSQL, TypeORM';
  }
}
