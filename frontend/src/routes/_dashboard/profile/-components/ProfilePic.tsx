import { Center, Image, Overlay, Title } from "@mantine/core";
import MissingImage from "/image-missing.jpg";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";

export default function ProfilePic({ showUpload }: { showUpload: boolean }) {
  const handlePicDrop = async () => {};
  
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
          accept={["image/png", "image/jpeg", "image/svg+xml", "image/gif"]}
          radius={"50%"}
          w={{ base: "100%", sm: "33%" }}
          p={0}
        >
          <Image src={MissingImage} radius={"50%"}/>
          <Overlay radius={"50%"}>
            <Center h={"100%"}>
              <Title ta={"center"}>Upload Profile Picture</Title>
            </Center>
          </Overlay>
        </Dropzone>
      ) : (
        <Image src={MissingImage} radius={"50%"} w={{ base: "100%", sm: "33%" }}/>
      )}
    </>
  );
}
