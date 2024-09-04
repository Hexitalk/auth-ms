import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/contexts/auth/domain/interfaces/jwt-payload.interface';

@Injectable()
export class SignTokenService {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
