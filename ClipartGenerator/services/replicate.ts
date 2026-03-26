const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function generateClipart(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const response = await fetch(API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, prompt }),
  });

  if (!response.ok) {
    throw new Error("Generation failed");
  }

  const data = await response.json();
  
  if (!data.output || data.output.length === 0) {
    throw new Error("No output received");
  }

  return Array.isArray(data.output) ? data.output[0] : data.output;
}