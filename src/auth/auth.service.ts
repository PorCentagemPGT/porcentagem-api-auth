import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionsService } from '../sessions/sessions.service';
import { ValidateTokenDto } from './dto/validate-token.dto';

interface JwtPayload {
  sub: string;
  exp: number;
  [key: string]: any;
}

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
   * @param userId ID do usuário
   * @returns Tokens de acesso e refresh
   */
  async generateTokens(userId: string): Promise<AuthResponseDto> {
    this.logger.debug(`Generating tokens for user ${userId}`);

    // Gera o payload do JWT
    const payload = { sub: userId };
    this.logger.debug(`JWT payload: ${JSON.stringify(payload)}`);

    // Gera o access token
    const accessToken = await this.jwtService.signAsync(payload);
    this.logger.debug('Access token generated');

    // Gera o refresh token com TTL maior
    const refreshTokenTtl = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    this.logger.debug(`Refresh token TTL: ${refreshTokenTtl}`);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTokenTtl,
    });
    this.logger.debug('Refresh token generated');

    // Calcula a data de expiração do refresh token
    const expiresAt = new Date();
    const days = parseInt(refreshTokenTtl.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);
    this.logger.debug(`Refresh token expires at: ${expiresAt.toISOString()}`);

    // Salva a sessão com o refresh token
    await this.sessionsService.create({
      userId,
      refreshToken,
      expiresAt,
    });
    this.logger.debug('Session created in database');

    // Calcula o tempo de expiração do access token
    const accessTokenTtl = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    const minutes = parseInt(accessTokenTtl.replace('m', ''));
    this.logger.debug(`Access token TTL: ${minutes} minutes`);

    return {
      accessToken,
      refreshToken,
      expiresIn: minutes * 60, // Converte minutos para segundos
    };
  }

  /**
   * Valida um token JWT e retorna informações sobre sua validade
   * @param token Token JWT a ser validado
   * @returns Informações sobre a validade do token
   */
  async validateToken(token: string): Promise<ValidateTokenDto> {
    this.logger.debug('Starting token validation');
    this.logger.debug(`Token to validate: ${token}`);

    try {
      // Verifica se o token é válido e decodifica o payload
      this.logger.debug('Attempting to verify token');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      this.logger.debug(`Token payload: ${JSON.stringify(payload)}`);

      // Calcula o tempo restante de validade
      const expirationTime = payload.exp * 1000; // Converte para milissegundos
      const currentTime = Date.now();
      const expiresIn = Math.max(
        0,
        Math.floor((expirationTime - currentTime) / 1000),
      );

      this.logger.debug(
        `Token expiration time: ${new Date(expirationTime).toISOString()}`,
      );
      this.logger.debug(`Current time: ${new Date(currentTime).toISOString()}`);
      this.logger.debug(`Time until expiration: ${expiresIn} seconds`);

      return {
        userId: payload.sub,
        isValid: true,
        expiresIn,
      };
    } catch (error: unknown) {
      // Se o token for inválido ou expirado, retorna false
      this.logger.debug(
        `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.logger.debug(`Error details: ${JSON.stringify(error)}`);

      return {
        userId: '',
        isValid: false,
        expiresIn: 0,
      };
    }
  }
}
