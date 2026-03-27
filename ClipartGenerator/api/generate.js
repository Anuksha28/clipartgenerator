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
    // Upload base64 to Cloudinary from server side
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
      if (!cloudData.secure_url) {
        return res.status(500).json({ 
          error: "Cloudinary upload failed", 
          details: cloudData 
        });
      }
      publicImageUrl = cloudData.secure_url;
    }

    // Call Replicate
    const response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version:
            "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: {
            prompt: prompt,
            image: publicImageUrl,
            prompt_strength: 0.8,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
        }),
      }
    );

    const prediction = await response.json();

    if (!prediction.id) {
      return res.status(500).json({
        error: "Replicate failed",
        details: prediction,
      });
    }

    // Poll for result
    let result = prediction;
    let attempts = 0;

    while (
      result.status !== "succeeded" &&
      result.status !== "failed" &&
      attempts < 60
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      result = await poll.json();
      attempts++;
    }

    if (result.status === "failed") {
      return res.status(500).json({ error: "Generation failed" });
    }

    const output = Array.isArray(result.output)
      ? result.output[0]
      : result.output;
    return res.status(200).json({ output });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}