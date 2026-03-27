const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(
  localUri: string
): Promise<string> {
  console.log("Uploading to Cloudinary...");
  console.log("Cloud name:", CLOUD_NAME);
  console.log("Upload preset:", UPLOAD_PRESET);
  console.log("Local URI:", localUri);

  const formData = new FormData();

  formData.append("file", {
    uri: localUri,
    name: "upload.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET!);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  console.log("Posting to:", url);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();
  console.log("Cloudinary raw response:", text);

  if (!response.ok) {
    throw new Error(`Upload failed: ${text}`);
  }

  const data = JSON.parse(text);
  return data.secure_url;
}