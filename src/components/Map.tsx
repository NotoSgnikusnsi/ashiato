import { useState } from "react";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Popup,
  Polyline,
  CircleMarker,
  useMapEvents,
  TileLayer,
} from "react-leaflet";

import {
  ChakraProvider,
  Image,
  Heading,
  IconButton,
  Flex,
  Box,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FaEarthAsia, FaMap, FaTreeCity } from "react-icons/fa6";

import { deleteRecord } from "../services/indexeddbClient.ts";
import type { Place } from "../services/indexeddbClient.ts";

type Props = {
  records: Place[];
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  loadRecords: () => void;
};

const Map: React.FC<Props> = ({ records, location, db, loadRecords }) => {
  // 初期値を設定する
  const [currentZoomLevel, setCurrentZoomLevel] = useState(12);
  const [initialZoomLevel, setInitialZoomLevel] = useState(12);
  const height = "100dvh";
  const width = "100vw";

  // 初期のマップの位置を設定する
  const [initialPosition, setInitialPosition] = useState<LatLngExpression>(
    location?.lat && location?.lon
      ? [location.lat, location.lon]
      : records.length > 0
      ? [
          records[records.length - 1].location.lat,
          records[records.length - 1].location.lon,
        ]
      : [31.7683, 35.2137]
  );
  // マーカーを繋ぐ線を日時順で設定する
  const polyline: LatLngExpression[] = records
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (record) => [record.location.lat, record.location.lon] as LatLngExpression
    );

  // 削除ボタンを押したとき、データを削除する
  const handleDeleteButtonClick = (id: string) => {
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

  const MapEvents = () => {
    useMapEvents({
      zoomend: (e) => {
        setCurrentZoomLevel(e.target.getZoom());
      },
      move: (e) => {
        setInitialPosition(e.target.getCenter());
      },
    });
    return null;
  };

  return (
    <ChakraProvider>
      <MapContainer
        key={initialZoomLevel}
        center={initialPosition}
        zoom={initialZoomLevel}
        style={{ height: height, width: width, backgroundColor: "snow" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <Polyline positions={polyline} />
        {records.map((record) => (
          <CircleMarker
            key={currentZoomLevel}
            center={[record.location.lat, record.location.lon]}
            radius={currentZoomLevel ** 1.6}
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
                />
                <IconButton
                  aria-label="delete"
                  size={"sm"}
                  colorScheme="red"
                  icon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteButtonClick(record.id);
                  }}
                />
              </Flex>
            </Popup>
          </CircleMarker>
        ))}
        <CircleMarker
          key={`${initialPosition}`}
          center={initialPosition}
          radius={2}
          color="red"
        />
      </MapContainer>
      <Box position="fixed" bottom="20px" left="20px" zIndex="1000">
        <ButtonGroup isAttached>
          <Button
            onClick={() => {
              setInitialZoomLevel(3);
              setCurrentZoomLevel(3);
            }}
          >
            <FaEarthAsia />
          </Button>
          <Button
            onClick={() => {
              setInitialZoomLevel(5);
              setCurrentZoomLevel(5);
            }}
          >
            <FaMap />
          </Button>
          <Button
            onClick={() => {
              setInitialZoomLevel(10);
              setCurrentZoomLevel(10);
            }}
          >
            <FaTreeCity />
          </Button>
        </ButtonGroup>
      </Box>
    </ChakraProvider>
  );
};

export default Map;
