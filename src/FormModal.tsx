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
import { addRecord } from "./indexedbdClient.ts";
import type { Place } from "./indexedbdClient.ts";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  reloadRecords: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  location,
  db,
  reloadRecords,
}) => {
  const [title, setTitle] = useState<string>("");

  const handleAddRecord = () => {
    if (db && imageSrc && location) {
      const newRecord: Place = {
        id: Date.now().toString(),
        date: new Date(),
        title: title,
        img: imageSrc as string,
        location: {
          lat: location.lat,
          lon: location.lon,
        },
      };

      addRecord(db, newRecord)
        .then(() => {
          console.log("データを追加しました！");
          setTitle("");
          onClose();
          reloadRecords();
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
            <Box pb={2}>
              {imageSrc && <Image src={imageSrc} alt="撮影した画像" mb={2} />}
              {location && (
                <Text mb={2}>
                  緯度: {location?.lat} 経度: {location?.lon}
                </Text>
              )}
            </Box>
            <FormControl>
              <Input
                placeholder="ここはどこですか？"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddRecord}>
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
