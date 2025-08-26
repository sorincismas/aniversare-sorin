import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Inițializează clientul S3 folosind variabilele de mediu din Vercel
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export default async function handler(req, res) {
    // Setăm headerele CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const fileType = req.body.fileType || 'video/webm';
        const fileExtension = fileType.split('/')[1] || 'webm';
        const fileName = `urare-${Date.now()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
        });

        // Generează URL-ul pre-semnat care este valabil 5 minute
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        res.status(200).json({ uploadUrl, key: fileName });

    } catch (error) {
        console.error("Eroare la generarea URL-ului:", error);
        res.status(500).json({ error: "Nu am putut genera URL-ul de upload." });
    }
}
