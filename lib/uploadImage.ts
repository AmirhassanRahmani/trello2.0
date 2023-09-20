import { ID, storage } from "@/appwrite";

const uploadImage = async (file: File) => {
  if (!file) return;
  const fileUploaded = await storage.createFile(
    "64f4814a4a5fec39412a",
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadImage;
