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
  useToast,
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
  onSaveSuccess?: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  imageSrc,
  location,
  db,
  onClose,
  loadRecords,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSaveLocationButtonClick = async () => {
    if (!db || !imageSrc || !location) {
      toast({
        title: "データが不足しています",
        description: "位置情報と画像が必要です",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSaving(true);
    try {
      const geocodeData = await reverseGeocode(location.lat, location.lon);

      const newRecord: Place = {
        id: Date.now().toString(),
        date: new Date(),
        title: title.trim() || "名称未設定",
        img: imageSrc,
        location: { lat: location.lat, lon: location.lon },
        country: geocodeData?.country,
        region: geocodeData?.region,
      };

      await addRecord(db, newRecord);

      setTitle("");
      onClose();
      loadRecords();

      toast({
        title: "🐾 足跡を残しました！",
        description: [geocodeData?.country, geocodeData?.region]
          .filter(Boolean)
          .join(" "),
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      onSaveSuccess?.();
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        title: "保存に失敗しました",
        description: "もう一度試してください",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
      <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
        <ModalHeader fontSize="lg">🐾 あしあとを残す</ModalHeader>
        <ModalCloseButton isDisabled={isSaving} />

        <ModalBody pb={2}>
          <FormControl mb={3}>
            <Input
              placeholder="ここはどこですか？"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              borderRadius="xl"
              isDisabled={isSaving}
              onKeyDown={(e) =>
                e.key === "Enter" && !isSaving && handleSaveLocationButtonClick()
              }
            />
          </FormControl>
          <Box pb={2}>
            {imageSrc && (
              <Image
                src={imageSrc}
                alt="撮影した画像"
                mb={2}
                borderRadius="xl"
                maxH="200px"
                objectFit="cover"
                w="100%"
              />
            )}
            {location && (
              <Text mb={2} fontSize="xs" color="gray.400">
                📍 {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </Text>
            )}
          </Box>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button
            colorScheme="green"
            onClick={handleSaveLocationButtonClick}
            isLoading={isSaving}
            loadingText="保存中..."
            borderRadius="xl"
            flex={1}
          >
            足跡を残す
          </Button>
          <Button
            onClick={onClose}
            isDisabled={isSaving}
            borderRadius="xl"
            variant="ghost"
          >
            キャンセル
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
