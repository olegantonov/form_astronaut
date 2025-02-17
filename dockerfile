# Use a imagem Node.js oficial como base
FROM node:16

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copie os arquivos de dependências e instale-as
COPY package*.json ./
RUN npm install

# Copie o restante dos arquivos da aplicação
COPY . .

# Exponha a porta da aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]
