import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";
import type { Place } from "./indexedbdClient.ts";
import {
  ChakraProvider,
  Image,
  Heading,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { deleteRecord } from "./indexedbdClient.ts";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

type Props = {
  records: Place[];
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  loadRecords: () => void;
};

const Map: React.FC<Props> = ({ records, location, db, loadRecords }) => {
  // マップ初期位置
  const position: LatLngExpression =
    location?.lat && location?.lon
      ? [location.lat, location.lon]
      : records.length > 0
      ? [
          records[records.length - 1].location.lat,
          records[records.length - 1].location.lon,
        ]
      : [31.7683, 35.2137];

  // 初期マップズームレベル
  const zoom = 12;
  const height = "100dvh";
  const width = "100vw";

  const handleDeleteRecord = (id: string) => {
    const isDelete = confirm("削除しますか？");
    if (isDelete) {
      if (db) {
        deleteRecord(db, id)
          .then(() => {
            console.log("Record deleted successfully");
            loadRecords();
          })
          .catch(() => {
            console.error("Error deleting record");
            alert("データの削除に失敗しました");
          });
      } else {
        console.error("データベースが初期化されていません");
        alert("データベースが初期化されていません");
      }
    }
  };

  return (
    <ChakraProvider>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: height, width: width }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {records.map((record) => (
          <Marker
            key={record.id}
            position={[record.location.lat, record.location.lon]}
          >
            <Popup>
              <Heading
                fontSize={"sm"}
                fontWeight={"normal"}
                color={"gray"}
                pb={1}
              >
                {record.date.toDateString()}
              </Heading>
              <Heading fontSize={"2xl"} pb={1}>
                {record.title}
              </Heading>
              <Heading fontSize={"sm"} pb={1}>
                {record.country} {record.region}
              </Heading>
              <Image
                src={record.img}
                alt="record"
                style={{ maxWidth: "200px", width: "100%" }}
                mb={2}
              />
              <Flex>
                <IconButton
                  aria-label="update"
                  size={"sm"}
                  colorScheme="blue"
                  mr={1}
                  icon={<EditIcon />}
                  onClick={() => {
                    alert("編集機能はまだ実装されていません，ごめんね．");
                  }}
                ></IconButton>
                <IconButton
                  aria-label="delete"
                  size={"sm"}
                  colorScheme="red"
                  icon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteRecord(record.id);
                  }}
                />
              </Flex>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
