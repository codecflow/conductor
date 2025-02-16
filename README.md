# Conductor

A containerized browser streaming solution that captures and streams browser content to RTMP endpoints.

## About

This project serves as an example use case for [Captain](https://github.com/codecflow/captain), an orchestration service providing secure, resource-managed, self-healing virtual OS environments for AI agents.

Conductor demonstrates how AI agents can control a browser in a containerized environment while streaming the visual output to viewers via RTMP.

## Features

- Launches a Chromium browser in a Docker container
- Captures browser window using GStreamer
- Streams to any RTMP endpoint (e.g., Twitch)
- Configurable via environment variables
- Remote control via Chrome DevTools Protocol

## Agent Control

This project enables AI agents to control the browser through the [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) server. The MCP (Model Context Protocol) allows agents to:

- Navigate to websites
- Interact with web elements
- Fill forms and click buttons
- Extract content from pages

The browser exposes port 9222 for remote debugging, which the Playwright MCP server can connect to for browser control.

## Usage

```bash
# Run with default settings
docker-compose up

# Run with custom URL and RTMP endpoint
URL=https://example.com RTMP=rtmp://live.twitch.tv/app/your-key docker-compose up
```

## Configuration

Key environment variables:
- `URL`: Website to load (default: https://google.com)
- `RTMP`: Streaming destination (default: rtmp://host.docker.internal:1935/live/stream)
- `WIDTH`/`HEIGHT`: Resolution (default: 1920x1080)
- `FPS`: Frame rate (default: 30)
