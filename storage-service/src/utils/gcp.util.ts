import { Storage } from "@google-cloud/storage";

const {
  GCP_PROJECT_ID,
  GCP_VIDEOS_BUCKET_NAME,
  GCP_THUMBNAILS_BUCKET_NAME,
  GCP_KEYFILE_PATH,
} = process.env;

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  keyFilename: GCP_KEYFILE_PATH,
});

async function createBucketIfNotExists(bucketName: string) {
  const [buckets] = await storage.getBuckets();
  const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

  if (!bucketExists) {
    await storage.createBucket(bucketName);
    console.log(`Bucket ${bucketName} created.`);
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
  }
}

(async () => {
  await createBucketIfNotExists(GCP_VIDEOS_BUCKET_NAME!);
  await createBucketIfNotExists(GCP_THUMBNAILS_BUCKET_NAME!);
})();

export const videosBucket = storage.bucket(GCP_VIDEOS_BUCKET_NAME!);
export const thumbnailsBucket = storage.bucket(GCP_THUMBNAILS_BUCKET_NAME!);
