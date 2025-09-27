import RNFS from "react-native-fs";
import {Image} from "react-native";

async function getImageAspectRatio(path: string) {
  return new Promise<number | null>(async (resolve) => {
    Image.getSize(
      path,
      (imgWidth, imgHeight) => {
        resolve(imgHeight / imgWidth);
      },
      (error) => {
        console.error("Failed to get image size:", error);
        resolve(null); // default aspect ratio
      }
    );
  });
}

export default async function checkForImage(url: string) {
  return new Promise<{ path: string; ratio: number | null } | null>(async (resolve) => {
    const filename = url.split("/").pop()?.split("?")[0];
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    const localPath = `file://${path}`;

    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        const ratio = await getImageAspectRatio(localPath);
        return resolve({path: localPath, ratio});
      }

      // download the image if it doesn't exist
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: path,
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log("Image downloaded!");
        const ratio = await getImageAspectRatio(localPath);
        return resolve({path: localPath, ratio});
      } else {
        console.error("Failed to download image:", downloadResult);
      }
    } catch (error) {
      console.error("Error checking cache for image:", error);
    }

    return resolve(null);
  });
}
