import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "putik-cemerlang/sliders",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export async function uploadPdfToCloudinary(
  buffer: Buffer,
  isPdf: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "putik-cemerlang/arsip-surat",
          resource_type: isPdf ? "raw" : "image",
          public_id: `arsip_${Date.now()}`,
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

export { cloudinary };
