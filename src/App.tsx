import { useState } from "react";
import "./App.css";
import {
  ChakraProvider,
  Button,
  Heading,
  Container,
  Box,
  Flex,
  Text,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const getCurrentLocation = () => {
    setIsFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setIsFetchingLocation(false);
        },
        (error) => {
          alert("位置情報の取得に失敗しました" + error.message);
          setIsFetchingLocation(false);
        }
      );
    } else {
      alert("このブラウザーは位置情報に対応していません");
      setIsFetchingLocation(false);
    }
  };

  const clickInputFile = () => {
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    fileElem ? fileElem.click() : alert("fileElem is null");
  };

  const previewSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectFile = e.target.files?.[0];
    if (!selectFile || !selectFile.type.includes("image")) {
      alert("画像が選択されていません");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(selectFile);
  };

  return (
    <>
      <ChakraProvider>
        <Container maxW={"2xl"} centerContent>
          <Box padding={4} maxW={"md"} textAlign="center">
            <Heading mb={"4px"}>あしあと</Heading>
            <Flex justify={"center"} align={"center"} mb={"4px"}>
              <input
                type="file"
                id="fileElem"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={previewSelectImage}
              />
              <Button colorScheme="blue" onClick={clickInputFile} mr={"4px"}>
                写真を撮る！
              </Button>
              <Button colorScheme="blue" onClick={getCurrentLocation}>
                位置情報を取得する
              </Button>
            </Flex>
            {isFetchingLocation ? (
              <Spinner />
            ) : location ? (
              <Link
                isExternal
                href={`https://www.openstreetmap.org/#map=18/${location.lat}/${location.lon}`}
              >
                <Text mb={"4px"}>
                  緯度: {location.lat}, 経度: {location.lon}
                  <ExternalLinkIcon mx="2px" />
                </Text>
              </Link>
            ) : null}
            {image && (
              <img
                src={image}
                alt="preview"
                style={{ maxWidth: "300px", height: "auto" }}
              />
            )}
          </Box>
        </Container>
      </ChakraProvider>
    </>
  );
}

export default App;
