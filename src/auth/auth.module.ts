import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthResponseDto, JwtPayload } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_TTL'),
        },
      }),
    }),
    SessionsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'SWAGGER_MODELS',
      useValue: [AuthResponseDto, JwtPayload, LoginDto],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
