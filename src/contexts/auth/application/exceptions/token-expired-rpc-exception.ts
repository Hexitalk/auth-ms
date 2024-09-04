import { RpcException } from '@nestjs/microservices';

export class TokenExpiredRpcException extends RpcException {
  constructor() {
    super({ status: 404, message: 'auth.error.token-expired' }); // i18n key
  }
}
