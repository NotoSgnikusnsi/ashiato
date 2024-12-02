import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  CircleMarker,
} from "react-leaflet";
import { icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
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
import PopupIcon from "./assets/popup.svg";

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

  const polyline: LatLngExpression[] = records
    .map(
      (record) => [record.location.lat, record.location.lon] as LatLngExpression
    )
    .sort();

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
        style={{ height: height, width: width, backgroundColor: "snow" }}
      >
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
        <Polyline positions={polyline} />
        {records.map((record) => (
          <CircleMarker
            center={[record.location.lat, record.location.lon]}
            radius={50}
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
                style={{ width: "100%" }}
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
          </CircleMarker>
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
