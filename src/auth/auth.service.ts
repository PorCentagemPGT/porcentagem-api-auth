import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../sessions/sessions.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Gera tokens de acesso e refresh para um usuário
   * @param userId ID do usuário autenticado
   * @returns Tokens de acesso e refresh
   */
  async generateTokens(userId: string): Promise<AuthResponseDto> {
    this.logger.log(`Generating tokens for user ${userId}`);

    // Gera o payload do JWT
    const payload = { sub: userId };

    // Gera o access token
    const accessToken = await this.jwtService.signAsync(payload);

    // Gera um refresh token aleatório
    const refreshToken = randomBytes(40).toString('base64url');

    // Calcula o tempo de expiração do refresh token
    const expiresAt = new Date();
    const refreshTokenTtl: string = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    const days = parseInt(refreshTokenTtl.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    // Salva a sessão no banco
    await this.sessionsService.create({
      userId,
      refreshToken,
      expiresAt,
    });

    // Retorna os tokens
    const accessTokenTtl: string = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    const minutes = parseInt(accessTokenTtl.replace('m', ''));

    return {
      accessToken,
      refreshToken,
      expiresIn: minutes * 60, // Converte minutos para segundos
    };
  }
}
