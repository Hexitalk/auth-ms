import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import * as path from 'path';
import * as controllers from './controllers';
import * as useCases from '../application/use-cases';
import { SignTokenService } from 'src/contexts/shared/services/sign-token.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RpcExceptionInterceptor } from 'src/contexts/shared/interceptors/rpc-exception-translate.interceptor';
import { NatsLanguageResolver } from 'src/contexts/shared/i18n-resolvers/nats-language.resolver';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { NatsModule } from 'src/contexts/shared/nats/nats.module';

@Module({
  imports: [
    NatsModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        loader: I18nJsonLoader,
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: NatsLanguageResolver, options: {} }],
    }),
  ],
  controllers: [...Object.values(controllers)],
  providers: [
    SignTokenService,
    ...Object.values(useCases),
    NatsLanguageResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
  exports: [...Object.values(useCases)],
})
export class AuthModule {}
