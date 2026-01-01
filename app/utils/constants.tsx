// WebSocket configuration for direct Bifrost communication
export const wsBaseUrl =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8001";

export const wsEndpoint = `${wsBaseUrl}/ws`;
