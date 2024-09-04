import { RpcException } from '@nestjs/microservices';

export class InvalidTokenRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'auth.error.invalid-token' }); // i18n key
  }
}
