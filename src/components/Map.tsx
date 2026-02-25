import {
  MapContainer,
  Popup,
  Polyline,
  CircleMarker,
  useMapEvents,
  useMap,
  TileLayer,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "../services/indexeddbClient.ts";
import { deleteRecord } from "../services/indexeddbClient.ts";
import {
  ChakraProvider,
  Image,
  Heading,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

type Props = {
  records: Place[];
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  loadRecords: () => void;
  flyToTrigger?: number;
};

const FlyToController: React.FC<{
  location: { lat: number; lon: number } | null;
  trigger: number;
}> = ({ location, trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0 && location) {
      map.flyTo([location.lat, location.lon], Math.max(map.getZoom(), 14), {
        duration: 1.2,
      });
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const Map: React.FC<Props> = ({ records, location, db, loadRecords, flyToTrigger = 0 }) => {
  // 初期値を設定する
  const [zoomLevel, setZoomLevel] = useState(12);
  const height = "100dvh";
  const width = "100vw";

  // 初期のマップの位置を設定する
  const initialPosition: LatLngExpression =
    location?.lat && location?.lon
      ? [location.lat, location.lon]
      : records.length > 0
      ? [
          records[records.length - 1].location.lat,
          records[records.length - 1].location.lon,
        ]
      : [31.7683, 35.2137];

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
        setZoomLevel(e.target.getZoom());
      },
    });
    return null;
  };

  return (
    <ChakraProvider>
      <MapContainer
        center={initialPosition}
        zoom={zoomLevel}
        style={{ height: height, width: width, backgroundColor: "snow" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <FlyToController location={location} trigger={flyToTrigger} />
        <Polyline positions={polyline} />
        {records.map((record) => (
          <CircleMarker
            key={record.id}
            center={[record.location.lat, record.location.lon]}
            radius={zoomLevel ** 1.6}
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
                    handleDeleteButtonClick(record.id);
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
