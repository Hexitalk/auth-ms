import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VerifyTokenUseCase } from 'src/contexts/auth/application/use-cases';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller()
export class VerifyTokenController {
  constructor(private readonly verifyTokenUseCase: VerifyTokenUseCase) {}

  @MessagePattern({ cmd: 'auth.verify-token' })
  verifyToken(@Payload() payload: NatsPayloadInterface<string>) {
    const { data: token, ...config } = payload;
    return this.verifyTokenUseCase.run(token, config);
  }
}
