import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"; // ES Modules import
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { ENV } from "../../config.env";

const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } =
  ENV;

export const s3ClientObjects = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  apiVersion: "4",
  region: AWS_REGION,
});

export const createVideoDownloadUrl = async (videoParams: paramsTypes) => {
  try {
    const getcommand = new GetObjectCommand(videoParams);
    const videoSignedUrl = await getSignedUrl(s3ClientObjects, getcommand, {
      expiresIn: 3600,
    });
    return videoSignedUrl;
  } catch (error) {
    console.log("Error on Getting Video SignedUrl", error);
  }
};
export const createTranscriberUploadUrl = async (
  transcriberParams: paramsTypes
) => {
  try {
    const putcommand = new PutObjectCommand(transcriberParams);
    const transcriptSignedUrl = await getSignedUrl(
      s3ClientObjects,
      putcommand,
      {
        expiresIn: 3600,
      }
    );
    return transcriptSignedUrl;
  } catch (error) {
    console.log("Error on Getting Transcriber SignedUrl", error);
  }
};

export const awsParams = (file: File, params: string) => {
  if (!file) return;
  const fileExtention = file?.name.split(".").pop();
  const videoKey = `Transcribes/Original_File/${self.crypto.randomUUID()}.${fileExtention}`;
  const transcriberKey = `Transcribes/Transcribed_Files/${self.crypto.randomUUID()}.txt`;

  const Params = {
    Bucket: AWS_S3_BUCKET,
    Key: params === "videoparams" ? videoKey : transcriberKey,
    ...(params === "videoparams" && { Body: file }),
  };

  return Params;
};

export const uploadToS3 = async (Params: paramsTypes) => {
  const putCommand = new PutObjectCommand(Params);
  return await s3ClientObjects.send(putCommand);
};

type paramsTypes = {
  Bucket: string;
  Key: string;
  Body?: File;
};
