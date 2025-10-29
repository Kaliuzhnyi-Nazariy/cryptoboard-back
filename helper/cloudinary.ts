import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const postPhoto = async (
  file: string | Express.Multer.File,
  filename: string
) => {
  // console.log(file);
  // console.log(filename);
  if (file) {
    if (typeof file === "string") {
      // console.log("string");
      const res = await cloudinary.uploader.upload(file, {
        folder: "cryptoboard",
        use_filename: true,
        unique_filename: false,
        filename_override: filename,

        transformation: [
          {
            width: 160,
            height: 160,
            crop: "limit",
          },
          {
            gravity: "center",
            crop: "fill",
          },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });
      // console.log(res);
      return res.secure_url;
    } else {
      return new Promise((resolve, reject) => {
        // console.log("file");
        cloudinary.uploader
          .upload_stream(
            {
              folder: "cryptoboard",
              use_filename: true,
              unique_filename: false,
              filename_override: filename,
              transformation: [
                {
                  width: 40,
                  height: 40,
                  crop: "limit",
                },
                {
                  gravity: "center",
                  crop: "fill",
                },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (
              err: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (err) {
                reject(err);
              } else {
                resolve(result?.secure_url);
              }
            }
          )
          .end(file.buffer);
      });
    }
  }
};

export default postPhoto;
