import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";
import type { Place } from "./indexedbdClient.ts";
import {
  ChakraProvider,
  Text,
  Image,
  Heading,
  Box,
  Button,
} from "@chakra-ui/react";
import { deleteRecord } from "./indexedbdClient.ts";

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
  const zoom = 6;
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
              <Image
                src={record.img}
                alt="record"
                style={{ maxWidth: "200px", height: "auto" }}
                mb={2}
              />
              <Button onClick={() => handleDeleteRecord(record.id)}>
                削除
              </Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
