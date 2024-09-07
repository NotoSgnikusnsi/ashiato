import { useEffect, useState } from "react";
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
import { openDB, addRecord, fetchAllRecords } from "./indexedbdClient.ts";
import type { Place } from "./indexedbdClient.ts";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [records, setRecords] = useState<Place[]>([]);
  const [isDBLoading, setIsDBLoading] = useState(false);

  const loadAllRecords = () => {
    setIsDBLoading(true);
    if (db) {
      fetchAllRecords(db)
        .then((records) => {
          setRecords(records);
          setIsDBLoading(false);
        })
        .catch(() => {
          console.error("Error fetching records");
          setIsDBLoading(false);
        });
    } else {
      alert("データベースにアクセスできません");
      setIsDBLoading(false);
    }
  };

  const handleAddRecord = () => {
    if (db && selectedImage && currentLocation) {
      const newRecord: Place = {
        id: Date.now().toString(),
        img: selectedImage as string,
        location: {
          lat: currentLocation?.lat as number,
          lon: currentLocation?.lon as number,
        },
      };

      addRecord(db, newRecord)
        .then(() => {
          console.log("Record added successfully");
          setSelectedImage(null);
          setCurrentLocation(null);
          loadAllRecords();
        })
        .catch(() => {
          console.error("Error adding record");
        });
    } else {
      alert("データが不足しています");
    }
  };

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

  useEffect(() => {
    openDB()
      .then((db) => {
        setDb(db);
        console.log("データベースにアクセスしました！！！");
      })
      .catch((error) => {
        console.error("データベースにアクセスできません！！！", error);
      });
  }, []);

  useEffect(() => {
    if (db) {
      loadAllRecords();
    }
  }, [db]);

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
            <Button colorScheme="blue" onClick={handleAddRecord} mb={"4px"}>
              データを保存する
            </Button>
            {isDBLoading ? (
              <Spinner />
            ) : (
              records.map((record) => (
                <Box key={record.id} mb={"4px"}>
                  <img
                    src={record.img}
                    alt="record"
                    style={{ maxWidth: "300px", height: "auto" }}
                  />
                  <Link
                    isExternal
                    href={`https://www.openstreetmap.org/#map=18/${record.location.lat}/${record.location.lon}`}
                  >
                    <Text mb={"4px"}>
                      緯度: {record.location.lat}, 経度: {record.location.lon}
                      <ExternalLinkIcon mx="2px" />
                    </Text>
                  </Link>
                </Box>
              ))
            )}
          </Box>
        </Container>
      </ChakraProvider>
    </>
  );
}

export default App;
