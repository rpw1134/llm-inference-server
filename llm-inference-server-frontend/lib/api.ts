import { ModelRequestPayload } from "./model";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function postChatCompletion(payload: ModelRequestPayload) {
  const response = await fetch(`${baseUrl}/api/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: payload }),
  });

  return response;
}

export const apiBase = baseUrl;
