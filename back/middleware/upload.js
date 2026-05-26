const multer = require("multer");
const path = require("path");
const fs = require("fs");

const useS3 =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME &&
    process.env.AWS_REGION;

const folderMapping = {
    photo: "images",
    profileImage: "images",
    document: "documents",
    logo: "schoolLogo",
    bookFile: "books",
    file: "documents",
};

let storage;
let getOgjectURL = async () => null;

if (useS3) {
    const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
    const multerS3 = require("multer-s3");

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    storage = multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: "public-read",
        metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
        key: (req, file, cb) => {
            const folder = folderMapping[file.fieldname] || "others";
            cb(null, `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
        },
    });

    getOgjectURL = async (key) => {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });
        return getSignedUrl(s3, command);
    };
} else {
    console.warn("[UPLOAD] AWS not configured — using local disk storage (uploads/)");
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = folderMapping[file.fieldname] || "others";
            const dir = path.join("uploads", folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
        },
    });
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

/** After multer: set req.file.location for local disk (S3 sets it automatically). */
const patchUploadLocation = (req, res, next) => {
    if (req.file?.path && !req.file.location) {
        req.file.location = `/${req.file.path.replace(/\\/g, "/")}`;
    }
    next();
};

const localCsvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "temp/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const _single = upload.single.bind(upload);
upload.single = (fieldName) => {
    const multerMw = _single(fieldName);
    return (req, res, next) => {
        multerMw(req, res, (err) => {
            if (err) return next(err);
            patchUploadLocation(req, res, next);
        });
    };
};

module.exports = {
    upload,
    patchUploadLocation,
    localUpload: multer({ storage: localCsvStorage }),
    getOgjectURL,
    useS3,
};
