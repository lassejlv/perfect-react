import { Hono } from "hono";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

const router = new Hono();

router.post("/upload", async (c) => {
  const file = await c.req.blob();
  const fileName = c.req.query("fileName");

  const params = {
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
    Body: file.stream(),
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));
    return c.json({ message: "File uploaded successfully", data });
  } catch (err) {
    return c.json({ message: "File upload error", error: err.message }, 500);
  }
});

export default router;
