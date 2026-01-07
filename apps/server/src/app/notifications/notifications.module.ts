import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
      JwtModule.register({
          secret: process.env.JWT_SECRET || 'secretKey',
          signOptions: { expiresIn: '60m' },
      }),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}



