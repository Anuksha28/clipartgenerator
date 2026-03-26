const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(
  localUri: string
): Promise<string> {
  const formData = new FormData();

  const filename = localUri.split("/").pop() || "upload.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: localUri,
    name: filename,
    type,
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET!);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Cloudinary error:", data);
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.secure_url;
}