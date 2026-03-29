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
    // Upload to Cloudinary first to get public URL
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
          details: cloudData,
        });
      }
      publicImageUrl = cloudData.secure_url;
    }

    // Call DeepAI cartoon API
    const formData = new FormData();
    formData.append("image", publicImageUrl);
    formData.append("text", prompt);

    const response = await fetch(
      "https://api.deepai.org/api/toonify",
      {
        method: "POST",
        headers: {
          "api-key": process.env.DEEPAI_API_KEY,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.output_url) {
      return res.status(500).json({
        error: "DeepAI failed",
        details: data,
      });
    }

    return res.status(200).json({ output: data.output_url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}