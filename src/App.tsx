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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          alert("位置情報の取得に失敗しました: " + error.message);
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("このブラウザーは位置情報に対応していません");
      setIsLoadingLocation(false);
    }
  };

  const triggerFileInputClick = () => {
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    fileElem ? fileElem.click() : alert("fileElem is null");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectFile = e.target.files?.[0];
    if (!selectFile || !selectFile.type.includes("image")) {
      alert("画像が選択されていません");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
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
                onChange={handleFileChange}
              />
              <Button
                colorScheme="blue"
                onClick={triggerFileInputClick}
                mr={"4px"}
              >
                写真を撮る！
              </Button>
              <Button colorScheme="blue" onClick={fetchCurrentLocation}>
                位置情報を取得する
              </Button>
            </Flex>
            {isLoadingLocation ? (
              <Spinner />
            ) : currentLocation ? (
              <Link
                isExternal
                href={`https://www.openstreetmap.org/#map=18/${currentLocation.lat}/${currentLocation.lon}`}
              >
                <Text mb={"4px"}>
                  緯度: {currentLocation.lat}, 経度: {currentLocation.lon}
                  <ExternalLinkIcon mx="2px" />
                </Text>
              </Link>
            ) : null}
            {selectedImage && (
              <img
                src={selectedImage}
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
