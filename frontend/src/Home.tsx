import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";

import axios from "axios";
import {
  awsParams,
  createTranscriberUploadUrl,
  createVideoDownloadUrl,
  uploadToS3,
} from "./services/api.services";
const serverUrl = "http://localhost:3030";

type inputTypes = {
  name: string;
  language: string;
};

function Home() {
  const [inputs, setInputs] = useState<inputTypes>({ name: "", language: "" });
  const [urls, setUrls] = useState({ video: "", transcript: "" });

  const AxiosUpload = async (SignedUrl: string | undefined, file: File) => {
    if (!SignedUrl || !file) return;
    try {
      const response = await axios.put(SignedUrl, file, {
        headers: {
          "Content-Type": "video/*",
        },

        onUploadProgress: (progressEvent: any) => {
          const totalBytes = progressEvent.total;
          const uploadedSoFar = progressEvent.loaded;
          const percentage = (uploadedSoFar / totalBytes) * 100;
          console.log(percentage);
        },
      });
      return response;
    } catch (error) {
      console.log("Error on Uploading", error);
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    try {
      if (!file) return;
      console.log(file);
      const videoParams = awsParams(file, "videoparams");
      if (!videoParams) return;
      const response = await uploadToS3(videoParams);
      if (response) {
        console.log(response);
        const videoSignedUrl = await createVideoDownloadUrl(videoParams);
        if (!videoSignedUrl) return;
        const transcriberParams = awsParams(file, "transcriberparams");
        if (!transcriberParams) return;
        const SignedUrl = await createTranscriberUploadUrl(transcriberParams);
        if (!SignedUrl) return;
      }
    } catch (error) {
      console.log("Error On Configuring S3", error);
    }
  };
  const handleOnDeploy = async () => {
    axios.post(`${serverUrl}/new`, { urls });
  };

  const handleOnNameChange = (value: string) => {
    if (!value) return;
    setInputs({ ...inputs, name: value });
  };

  const handleOnLanguageSelect = (value: string) => {
    if (!value) return;
    setInputs({ ...inputs, language: value });
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-32 font-mono">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name of your project"
                    onChange={(e) => {
                      handleOnNameChange(e.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Video File</Label>
                  <Input
                    id="name"
                    type="file"
                    placeholder="Name of your project"
                    onChange={(e) => {
                      handleFileUpload(e.target.files?.[0]);
                    }}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">Language</Label>
                  <Select
                    onValueChange={(value) => {
                      handleOnLanguageSelect(value);
                    }}
                  >
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleOnDeploy}>Deploy</Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

export default Home;
