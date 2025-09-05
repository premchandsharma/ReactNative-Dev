import RNFS from "react-native-fs";

export default async function checkForImage(url: string, onImageFound: (path: string) => void) {
  const filename = url.split("/").pop()?.split("?")[0];
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      return onImageFound(path);
    }

    // download the image if it doesn't exist
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
    }).promise;
    if (downloadResult.statusCode === 200) {
      console.log("Image downloaded!");
      onImageFound(path);
    } else {
      console.error("Failed to download image:", downloadResult);
    }
  } catch (error) {
    console.error("Error checking cache for image:", error);
  }
}
