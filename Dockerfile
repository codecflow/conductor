FROM ghcr.io/codecflow/streamer:1.0.0

ENV PATH="/root/.bun/bin:${PATH}"

RUN apk add --no-cache chromium 

RUN curl -fsSL https://bun.sh/install | bash

RUN mkdir -p /output /app && chmod -R 777 /output

WORKDIR /app
COPY package.json bun.lock ./

RUN bun install

COPY src/ src/

CMD ["bun", "start"]
