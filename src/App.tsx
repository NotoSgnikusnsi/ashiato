import { useEffect, useState } from "react";
import "./style/App.css";
import {
  ChakraProvider,
  Container,
  Box,
  Spinner,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaShoePrints, FaRegCompass } from "react-icons/fa6";
import { openDB, fetchAllRecords } from "./services/indexedbdClient.ts";
import type { Place } from "./services/indexedbdClient.ts";
import Map from "./components/Map.tsx";
import FormModal from "./components/FormModal.tsx";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [records, setRecords] = useState<Place[]>([]);
  const [isDBLoading, setIsDBLoading] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          console.log("位置情報を取得しました！！！");
        },
        (error) => {
          alert("位置情報の取得に失敗しました: " + error.message);
        }
      );
    } else {
      alert("このブラウザーは位置情報に対応していません");
    }
  };

  const handleAddLocationIconButtonClick = () => {
    fetchCurrentLocation();
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    fileElem ? fileElem.click() : alert("カメラの起動に失敗しました");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectFile = e.target.files?.[0];
    if (!selectFile || !selectFile.type.includes("image")) {
      alert("画像が選択されていません");
      return;
    }
    readFile(selectFile);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      onOpen();
    };
    reader.readAsDataURL(file);
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

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return (
    <>
      <ChakraProvider>
        <Container maxW={"2xl"} centerContent>
          {isDBLoading ? (
            <Spinner />
          ) : (
            <Map
              records={records}
              location={currentLocation}
              db={db}
              loadRecords={loadAllRecords}
            />
          )}
          <Box position="fixed" bottom="80px" right="20px" zIndex="1000">
            <IconButton
              icon={<FaRegCompass />}
              colorScheme="blue"
              aria-label="現在地に戻る"
              size={"lg"}
              onClick={loadAllRecords}
            />
          </Box>
          <Box position="fixed" bottom="25px" right="20px" zIndex="1000">
            <IconButton
              icon={<FaShoePrints />}
              colorScheme="green"
              aria-label="あしあとの残す"
              size={"lg"}
              onClick={handleAddLocationIconButtonClick}
            />
            <input
              type="file"
              id="fileElem"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <FormModal
              isOpen={isOpen}
              onClose={onClose}
              imageSrc={selectedImage}
              location={currentLocation}
              db={db}
              loadRecords={loadAllRecords}
            />
          </Box>
        </Container>
      </ChakraProvider>
    </>
  );
}

export default App;
