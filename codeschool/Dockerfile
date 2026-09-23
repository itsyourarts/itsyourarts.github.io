# Full-stack host for GodxShadow: static site + POST /run code runner.
# Deploy this on Render / Railway / Fly.io / any Docker host.
#   docker build -t godxshadow . && docker run -p 8000:8000 godxshadow
FROM python:3.11-slim

# Toolchains the runner actually executes:
#   python (base image), gcc, g++, javac/java, C# (mono), php, node, git, bash
RUN apt-get update && apt-get install -y --no-install-recommends \
      gcc g++ default-jdk mono-mcs mono-runtime php-cli nodejs git bash ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

# Drop files the running site does not need
RUN rm -rf /app/preview /app/.git /app/.github /app/__pycache__ 2>/dev/null || true

ENV PORT=8000
EXPOSE 8000
CMD ["python3", "-u", "server.py"]
