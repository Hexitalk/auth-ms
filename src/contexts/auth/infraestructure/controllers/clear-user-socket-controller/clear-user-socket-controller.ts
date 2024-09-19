import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClearUserSocketUseCase } from 'src/contexts/auth/application/use-cases';
import { NatsPayloadInterface } from 'src/contexts/shared/nats/interfaces';

@Controller()
export class ClearUserSocketController {
  constructor(
    private readonly clearUserSocketUseCase: ClearUserSocketUseCase,
  ) {}

  @MessagePattern({ cmd: 'auth.clear-user-socket' })
  verifyToken(
    @Payload()
    payload: NatsPayloadInterface<{ socketId: string }>,
  ) {
    const { data, ...config } = payload;
    return this.clearUserSocketUseCase.run(data, config);
  }
}
