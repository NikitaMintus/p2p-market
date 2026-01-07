import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
            const data = request?.cookies?.['token'];
            if (!data && request?.headers?.cookie) {
                // Fallback manual parsing if cookie-parser not present or failed
                const rawCookies = request.headers.cookie.split(';');
                const parsedCookie = rawCookies.find(c => c.trim().startsWith('token='));
                if (parsedCookie) {
                    return parsedCookie.split('=')[1];
                }
            }
            return data;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    this.logger.debug(`Validating payload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.findOne({ id: payload.sub });
    if (!user) {
      this.logger.warn(`User not found for id: ${payload.sub}`);
      throw new UnauthorizedException('User no longer exists');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
