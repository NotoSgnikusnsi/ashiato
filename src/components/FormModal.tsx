import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Input,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { addRecord } from "../services/indexeddbClient.ts";
import { reverseGeocode } from "../services/geocodeClient.ts";
import type { Place } from "../services/indexeddbClient.ts";

interface FormModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  onClose: () => void;
  loadRecords: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  imageSrc,
  location,
  db,
  onClose,
  loadRecords,
}) => {
  const [title, setTitle] = useState<string>("");

  // セーブボタンが押されたとき、データベースに書き込む
  const handleSaveLocationButtonClick = async () => {
    if (db && imageSrc && location) {
      const geocodeData = await reverseGeocode(location.lat, location.lon);
      const newRecord: Place = {
        id: Date.now().toString(),
        date: new Date(),
        title: title,
        img: imageSrc as string,
        location: {
          lat: location.lat,
          lon: location.lon,
        },
        country: geocodeData?.country,
        region: geocodeData?.region,
      };

      addRecord(db, newRecord)
        .then(() => {
          console.log("データを追加しました！");
          setTitle("");
          onClose();
          loadRecords();
        })
        .catch((error) => {
          console.error("Error adding record: ", error);
          alert("データの追加に失敗しました");
        });
    } else {
      alert("データが不足しています");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={"inside"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>あしあとを残す</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <FormControl mb={2}>
              <Input
                placeholder="ここはどこですか？"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <Box pb={2}>
              {imageSrc && <Image src={imageSrc} alt="撮影した画像" mb={2} />}
              {location && (
                <Text mb={2}>
                  緯度: {location?.lat} 経度: {location?.lon}
                </Text>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSaveLocationButtonClick}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FormModal;
