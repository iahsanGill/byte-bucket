import { Storage } from "@google-cloud/storage";

const { GCP_PROJECT_ID, GCP_BUCKET_NAME, GCP_KEYFILE_PATH } = process.env;

export const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  keyFilename: GCP_KEYFILE_PATH,
});

export const bucket = storage.bucket(GCP_BUCKET_NAME!);
