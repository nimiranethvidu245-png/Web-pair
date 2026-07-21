import * as mega from "megajs";
import fs from "fs";

const auth = {
  email: "nimiranethvidu245@gmail.com",
  password: "Love#1234@",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
};

export const upload = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const storage = new mega.Storage(auth, (err) => {
      if (err) return reject(err);

      const uploadStream = storage.upload({
        name: fileName,
        allowUploadBuffering: true,
      });

      fs.createReadStream(filePath)
        .pipe(uploadStream)
        .on("error", reject);

      uploadStream.on("complete", (file) => {
        file.link((err, url) => {
          if (err) return reject(err);
          resolve(url);
        });
      });

      uploadStream.on("error", reject);
    });

    storage.on("error", reject);
  });
};

export const download = (url) => {
  return new Promise((resolve, reject) => {
    const file = mega.File.fromURL(url);

    file.loadAttributes((err) => {
      if (err) return reject(err);

      file.downloadBuffer((err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });
  });
};
