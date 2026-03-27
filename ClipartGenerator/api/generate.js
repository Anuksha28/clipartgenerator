export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrl, prompt } = req.body;
  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // First upload to Cloudinary to get public URL
    let publicImageUrl = imageUrl;
    if (imageUrl.startsWith("data:")) {
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: imageUrl,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          }),
        }
      );
      const cloudData = await cloudinaryRes.json();
      if (cloudData.secure_url) {
        publicImageUrl = cloudData.secure_url;
      }
    }

    // Use Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/lllyasviel/sd-controlnet-canny",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            image: publicImageUrl,
            prompt: prompt,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error: "HF failed", details: error });
    }

    // HF returns image bytes directly
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const outputUrl = `data:image/png;base64,${base64}`;

    return res.status(200).json({ output: outputUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}