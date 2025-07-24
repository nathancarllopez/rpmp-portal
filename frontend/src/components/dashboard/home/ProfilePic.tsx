import { AspectRatio, Center, Image, Overlay, Title } from "@mantine/core";
import {
  Dropzone,
  IMAGE_MIME_TYPE,
  type FileWithPath,
} from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profilePicOptions } from "@/integrations/tanstack-query/queries/profilePic";
import { useUpdateProfilePicMutation } from "@/integrations/tanstack-query/mutations/updateProfilePic";

interface ProfilePicProps {
  showUpload: boolean;
  userId: string | undefined;
}

export default function ProfilePic({ showUpload, userId }: ProfilePicProps) {
  const updateProfilePicMutation = useUpdateProfilePicMutation(userId);
  const { data, error } = useSuspenseQuery(profilePicOptions(userId));

  if (error) {
    console.warn("Could not fetch profile pic for this userId:")
    console.warn(userId);

    throw error;
  }

  const handlePicDrop = async (files: FileWithPath[]) => {
    updateProfilePicMutation.mutate(files[0], {
      onSuccess: () => {
        notifications.show({
          withCloseButton: true,
          color: "green",
          title: "Upload Successful",
          message: "Profile picture has been updated"
        });
      },
      onError: (error) => {
        console.warn("Error uploading profile picture: ", error.message);
        notifications.show({
          withCloseButton: true,
          color: "red",
          title: "Upload Failed",
          message: error.message,
        });
      }
    });
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
            <Image src={data} radius={"50%"} />
          </AspectRatio>
          <Overlay radius={"50%"}>
            <Center h={"100%"}>
              <Title ta={"center"}>Update Profile Picture</Title>
            </Center>
          </Overlay>
        </Dropzone>
      ) : (
        <AspectRatio ratio={1} w={{ base: "100%", sm: "33%" }}>
          <Image src={data} radius={"50%"} />
        </AspectRatio>
      )}
    </>
  );
}
