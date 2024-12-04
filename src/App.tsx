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
import { openDB, fetchAllRecords } from "./services/indexeddbClient.ts";
import type { Place } from "./services/indexeddbClient.ts";
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

  // 全てのレコードを読み込む
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

  // 現在地を取得する
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

  // ボタンが押されたとき、カメラを起動して画像を選択する
  const handleAddLocationIconButtonClick = () => {
    fetchCurrentLocation();
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    fileElem ? fileElem.click() : alert("カメラの起動に失敗しました");
  };

  // 画像が選択されたとき、画像を読み込み表示する
  const handleSelectImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectFile = e.target.files?.[0];
    if (!selectFile || !selectFile.type.includes("image")) {
      alert("画像が選択されていません");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      onOpen();
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
              onChange={handleSelectImageChange}
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
