FROM node:18-alpine
ARG POSTGRES_URL

COPY ./package-lock.json 	/app/package-lock.json
COPY ./package.json 			/app/package.json
COPY ./tsconfig.json 		/app/tsconfig.json
COPY ./.eslintrc.js 			/app/.eslintrc.js
COPY ./prisma/				/app/prisma/

RUN echo "POSTGRES_URL=$POSTGRES_URL" > /app/prisma/.env

WORKDIR /app/

EXPOSE 3000

RUN npm run restore-all

RUN npx prisma generate

COPY ./src /app/src

RUN npm run build

CMD ["pm2-runtime", "./dist/server.js"]
