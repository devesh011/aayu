import { supabase } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — keep emails light
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Uploads an image to the "wish-photos" bucket and returns its public URL.
 * Make sure the bucket exists and is set to public in Supabase Storage.
 */
export async function uploadContactPhoto(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large — keep it under 5 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `contacts/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("wish-photos")
    .upload(path, file, { cacheControl: "31536000", upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("wish-photos").getPublicUrl(path);
  return data.publicUrl;
}
