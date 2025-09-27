import RNFS from "react-native-fs";
import {Image, Platform} from "react-native";

type CacheType = 'image' | 'video';

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

export default async function checkForCache(url: string, type: CacheType = 'image') {
  return new Promise<{ path: string; ratio: number | null } | null>(async (resolve) => {
    const filename = url.split("/").pop()?.split("?")[0];
    const path = `${RNFS.CachesDirectoryPath}/${filename}`;
    // Platform-specific path handling for simulators
    const localPath = Platform.OS === 'android'
      ? `file://${path}`  // Android needs file:// prefix
      : path;

    try {
      let exists = await RNFS.exists(path);
      console.log('Cache check for', filename, 'exists:', exists, 'at path:', path);
      if (!exists) {
        // download the image if it doesn't exist
        const downloadResult = await RNFS.downloadFile({
          fromUrl: url,
          toFile: path,
        }).promise;
        if (downloadResult.statusCode !== 200) {
          console.error("Failed to download image:", downloadResult);
        } else {
          console.log("Image downloaded!");
          exists = true;
        }
      }
      if (exists) {
        const ratio = type === 'image' ? await getImageAspectRatio(localPath) : null;
        return resolve({path: localPath, ratio});
      }
    } catch (error) {
      console.error("Error checking cache for image:", error);
    }
    return resolve(null);
  });
}
