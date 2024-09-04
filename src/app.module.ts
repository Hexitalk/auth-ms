import { Module } from '@nestjs/common';
import { AuthModule } from './contexts/auth/infraestructure/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
