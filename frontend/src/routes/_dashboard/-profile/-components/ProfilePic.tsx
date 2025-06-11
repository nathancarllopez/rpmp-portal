import { AspectRatio, Center, Image, Overlay, Title } from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import updateProfilePic from "@/integrations/supabase/auth/updateProfilePic";
import MissingImage from "/image-missing.jpg";
import useProfilePic from "@/integrations/tanstack-query/useProfilePic";

interface ProfilePicProps {
  showUpload: boolean;
  userId: string | undefined;
}

export default function ProfilePic({ showUpload, userId }: ProfilePicProps) {
  const queryClient = useQueryClient();
  const { isPending, data, error } = useProfilePic(userId);

  if (error) {
    console.warn("Could not fetch profile pic for this userId:")
    console.warn(userId);

    throw error;
  }

  const imgSrc = isPending ? MissingImage : data;

  const handlePicDrop = async (files: FileWithPath[]) => {
    try {
      await updateProfilePic(files[0], userId);

      queryClient.invalidateQueries({ queryKey: ["profilePicUrl", userId] });
    } catch (error) {
      if (error instanceof Error) {
        console.warn("Error uploading profile picture: ", error.message);
      } else {
        console.warn("Unkown error uploading profile picture: ", JSON.stringify(error));
      }

      notifications.show({
        withCloseButton: true,
        color: "red",
        title: "Upload Failed",
        message: `${(error as Error)?.message || JSON.stringify(error)}`,
      });
    }
  };

  return (
    <>
      {showUpload ? (
        <Dropzone
          onDrop={handlePicDrop}
          onReject={() =>
            notifications.show({
              withCloseButton: true,
              color: "red",
              title: "Upload Failed",
              message: "Please upload an image file",
            })
          }
          accept={IMAGE_MIME_TYPE}
          radius={"50%"}
          w={{ base: "100%", sm: "33%" }}
          p={0}
        >
          <AspectRatio ratio={1}>
            <Image src={imgSrc} radius={"50%"} />
          </AspectRatio>
          <Overlay radius={"50%"}>
            <Center h={"100%"}>
              <Title ta={"center"}>Update Profile Picture</Title>
            </Center>
          </Overlay>
        </Dropzone>
      ) : (
        <AspectRatio ratio={1} w={{ base: "100%", sm: "33%" }}>
          <Image src={imgSrc} radius={"50%"} />
        </AspectRatio>
      )}
    </>
  );
}
