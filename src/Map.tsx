import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";
import type { Place } from "./indexedbdClient.ts";
import { ChakraProvider, Image, Heading } from "@chakra-ui/react";

type Props = {
  records: Place[];
  location: { lat: number; lon: number } | null;
};

const Map: React.FC<Props> = ({ records, location }) => {
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
        {records.map((record, index) => (
          <Marker
            key={index}
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
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
