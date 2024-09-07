import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
L.Icon.Default.imagePath =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";
import type { Place } from "./indexedbdClient.ts";
import { ChakraProvider, Text } from "@chakra-ui/react";

type Props = {
  records: Place[];
};

const Map: React.FC<Props> = ({ records }) => {
  const position: LatLngExpression = [34.6623932, 133.9284194];

  // 初期マップズームレベル
  const zoom = 13;

  return (
    <ChakraProvider>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: "100vh", width: "100%" }}
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
              <img
                src={record.img}
                alt="record"
                style={{ maxWidth: "200px", height: "auto" }}
              />
              <Text>{record.date.toDateString()}</Text>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
