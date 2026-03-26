import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: "Missing imageUrl or prompt" });
  }

  try {
    console.log("Received:", imageUrl, prompt);

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img",
      {
        input: {
          prompt: prompt,
          image: imageUrl,
        },
      }
    );

    console.log("Output:", output);

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Generation failed" });
  }
}