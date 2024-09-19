import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VerifyTokenAndUpdateSocketUseCase } from 'src/contexts/auth/application/use-cases';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller()
export class VerifyTokenAndUpdateSocketController {
  constructor(
    private readonly verifyTokenAndUpdateSocketUseCase: VerifyTokenAndUpdateSocketUseCase,
  ) {}

  @MessagePattern({ cmd: 'auth.verify-token-and-update-socket' })
  verifyToken(
    @Payload()
    payload: NatsPayloadInterface<{ token: string; socketId: string }>,
  ) {
    const { data, ...config } = payload;
    return this.verifyTokenAndUpdateSocketUseCase.run(data, config);
  }
}
