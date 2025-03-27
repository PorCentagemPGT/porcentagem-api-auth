# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (para cache mais eficiente)
COPY package*.json ./
RUN npm i

# Copia o restante do código e compila a aplicação
COPY . .
RUN npm run build

# Etapa 2: Container de produção
FROM node:18-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos necessários da imagem builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

# Expõe a porta padrão (ajuste se necessário)
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["node", "dist/main"]
