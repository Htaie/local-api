# Build stage
FROM --platform=$BUILDPLATFORM node:alpine AS build

WORKDIR /qbitapi

COPY package.json ./
RUN npm install && npm cache clean --force

COPY . .

# Final stage
FROM --platform=$BUILDPLATFORM node:alpine

WORKDIR /qbitapi

COPY --from=build /qbitapi/node_modules ./node_modules
COPY --from=build /qbitapi/package.json ./package.json
COPY --from=build /qbitapi/app.js ./app.js
COPY --from=build /qbitapi/qBitConfig.js ./qBitConfig.js
COPY --from=build /qbitapi/swaggerConfig.js ./swaggerConfig.js

# Set environment variables for the container
ENV PORT=9443
ENV QBIT_ADDRESS=""
ENV USERNAME=""
ENV PASSWORD=""

EXPOSE 9443

CMD ["sh", "-c", "npm start"]
