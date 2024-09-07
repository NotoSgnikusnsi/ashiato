import { useState } from "react";
import "./App.css";
import {
  ChakraProvider,
  Button,
  Heading,
  Container,
  Box,
} from "@chakra-ui/react";

function App() {
  const [image, setImage] = useState<string | null>(null);

  const handleButtonClick = () => {
    const openTheCamera = () => {
      const fileElem = document.getElementById("fileElem") as HTMLInputElement;
      fileElem ? fileElem.click() : alert("fileElem is null");
    };

    openTheCamera();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const takeAPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    takeAPicture(e);
  };

  return (
    <>
      <ChakraProvider>
        <Container maxW={"2xl"} centerContent>
          <Box padding={4} maxW={"md"}>
            <Heading mb={"4px"}>あしあと</Heading>
            <Box mb={"4px"}>
              <input
                type="file"
                id="fileElem"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button colorScheme="blue" onClick={handleButtonClick}>
                写真を撮る！
              </Button>
            </Box>
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
