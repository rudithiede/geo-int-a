FROM cgr.dev/chainguard/node:latest-dev

# Create working directory owned by node user
RUN mkdir -p /app && chown node:node /app
WORKDIR /app

# Switch to node user
USER node

# Copy package files first (for caching)
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy app source
COPY --chown=node:node . .

EXPOSE 3000

CMD ["/usr/bin/npm", "start"]

