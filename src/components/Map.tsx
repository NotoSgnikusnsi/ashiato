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
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

type Props = {
  records: Place[];
  location: { lat: number; lon: number } | null;
  db: IDBDatabase | null;
  loadRecords: () => void;
  flyToTrigger?: number;
  revealLocation?: { lat: number; lon: number } | null;
  revealCount?: number;
};

// ============================================================
// 現在地フライト
// ============================================================

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

// ============================================================
// 霧（未踏エリア）レイヤー
// ============================================================

const FogOfWarLayer: React.FC<{
  records: Place[];
  revealLocation?: { lat: number; lon: number } | null;
  revealCount?: number;
}> = ({ records, revealLocation, revealCount = 0 }) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<{ radius: number; loc: { lat: number; lon: number } } | null>(null);
  const rafRef = useRef<number>(0);

  // pane 内に置く（CSS transform に追従させる）
  // z-index 300: タイル(200)上・ベクターオーバーレイ(400)下
  const fogPane = useMemo(() => {
    const existing = map.getPane("fogPane");
    if (existing) return existing;
    const pane = map.createPane("fogPane");
    pane.style.zIndex = "300";
    pane.style.pointerEvents = "none";
    return pane;
  }, [map]);

  const getRevealRadius = useCallback(() => {
    const zoom = map.getZoom();
    return Math.max(60, 110 * Math.pow(1.6, zoom - 13));
  }, [map]);

  const drawCanvasRef = useRef<
    (extra?: { loc: { lat: number; lon: number }; radius: number }) => void
  >(() => {});

  const drawCanvas = useCallback(
    (extra?: { loc: { lat: number; lon: number }; radius: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ── Leaflet.heat と同じ方式 ──────────────────────────────
      // pane は CSS transform で動くが canvas は pane 内で (0,0) に固定されている。
      // containerPointToLayerPoint([0,0]) = -mapPanePos なので
      // この値を canvas の transform に設定することで、
      // pane の translate を打ち消し「canvas の左上 = 画面の左上」になる。
      // 描画は latLngToContainerPoint（画面座標）で行えばマーカーと一致する。
      // ─────────────────────────────────────────────────────────
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      canvas.style.transform = `translate3d(${Math.round(topLeft.x)}px,${Math.round(topLeft.y)}px,0)`;

      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      ctx.fillStyle = "rgba(8, 12, 28, 0.88)";
      ctx.fillRect(0, 0, size.x, size.y);

      ctx.globalCompositeOperation = "destination-out";

      const drawReveal = (lat: number, lon: number, radius: number) => {
        if (radius <= 0) return;
        const pt = map.latLngToContainerPoint([lat, lon]);
        const g = ctx.createRadialGradient(pt.x, pt.y, radius * 0.15, pt.x, pt.y, radius);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.55, "rgba(0,0,0,0.9)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      const r = getRevealRadius();
      records.forEach((rec) => drawReveal(rec.location.lat, rec.location.lon, r));
      if (extra) drawReveal(extra.loc.lat, extra.loc.lon, extra.radius);

      ctx.globalCompositeOperation = "source-over";
    },
    [map, records, getRevealRadius]
  );

  drawCanvasRef.current = drawCanvas;

  useMapEvents({
    move: () => drawCanvasRef.current(animRef.current ?? undefined),
    zoom: () => drawCanvasRef.current(animRef.current ?? undefined),
    viewreset: () => drawCanvasRef.current(),
    resize: () => drawCanvasRef.current(),
  });

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (revealCount === 0 || !revealLocation) return;
    const loc = { ...revealLocation };
    const target = getRevealRadius() * 1.35;
    animRef.current = { radius: 0, loc };
    const step = target / 55;

    const animate = () => {
      if (!animRef.current) return;
      animRef.current.radius = Math.min(animRef.current.radius + step, target);
      drawCanvasRef.current({ loc, radius: animRef.current.radius });
      if (animRef.current.radius < target) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        animRef.current = null;
        drawCanvasRef.current();
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [revealCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    />,
    fogPane
  );
};

// ============================================================
// 光るマーカー（電球風 3 リング）
// ============================================================

const GlowMarker: React.FC<{
  record: Place;
  onDelete: () => void;
}> = ({ record, onDelete }) => {
  const [hover, setHover] = useState(false);
  const pos: LatLngExpression = [record.location.lat, record.location.lon];

  return (
    <>
      {/* 外側グロー */}
      <CircleMarker
        center={pos}
        radius={hover ? 26 : 22}
        pathOptions={{
          color: "transparent",
          fillColor: "#f4a261",
          fillOpacity: hover ? 0.18 : 0.1,
          interactive: false,
        } as object}
      />
      {/* 中間グロー */}
      <CircleMarker
        center={pos}
        radius={hover ? 14 : 11}
        pathOptions={{
          color: "transparent",
          fillColor: "#f4a261",
          fillOpacity: hover ? 0.38 : 0.26,
          interactive: false,
        } as object}
      />
      {/* コア（クリック可能・ポップアップあり） */}
      <CircleMarker
        center={pos}
        radius={5}
        pathOptions={{
          color: "#ffd700",
          weight: 1.5,
          fillColor: "#fffde7",
          fillOpacity: 1,
        }}
        eventHandlers={{
          mouseover: () => setHover(true),
          mouseout: () => setHover(false),
        }}
      >
        <Popup>
          <Heading fontSize="sm" fontWeight="normal" color="gray" pb={1}>
            {record.date.toDateString()}
          </Heading>
          <Heading fontSize="2xl" pb={1}>
            {record.title}
          </Heading>
          <Heading fontSize="sm" pb={1}>
            {record.country} {record.region}
          </Heading>
          <Image src={record.img} alt="record" style={{ width: "100%" }} mb={2} />
          <Flex>
            <IconButton
              aria-label="update"
              size="sm"
              colorScheme="blue"
              mr={1}
              icon={<EditIcon />}
              onClick={() => alert("編集機能はまだ実装されていません，ごめんね．")}
            />
            <IconButton
              aria-label="delete"
              size="sm"
              colorScheme="red"
              icon={<DeleteIcon />}
              onClick={onDelete}
            />
          </Flex>
        </Popup>
      </CircleMarker>
    </>
  );
};

// ============================================================
// Map 本体
// ============================================================

const Map: React.FC<Props> = ({
  records,
  location,
  db,
  loadRecords,
  flyToTrigger = 0,
  revealLocation,
  revealCount = 0,
}) => {
  const height = "100dvh";
  const width = "100vw";

  const initialPosition: LatLngExpression =
    location?.lat && location?.lon
      ? [location.lat, location.lon]
      : records.length > 0
      ? [records[records.length - 1].location.lat, records[records.length - 1].location.lon]
      : [31.7683, 35.2137];

  const polyline: LatLngExpression[] = [...records]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((r) => [r.location.lat, r.location.lon] as LatLngExpression);

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    if (db) {
      deleteRecord(db, id)
        .then(() => loadRecords())
        .catch(() => alert("データの削除に失敗しました"));
    } else {
      alert("データベースが初期化されていません");
    }
  };

  return (
    <ChakraProvider>
      <MapContainer
        center={initialPosition}
        zoom={12}
        style={{ height, width, backgroundColor: "#080c1c" }}
      >
        {/* ダークタイル (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <FlyToController location={location} trigger={flyToTrigger} />

        {/* 霧レイヤー */}
        <FogOfWarLayer
          records={records}
          revealLocation={revealLocation}
          revealCount={revealCount}
        />

        {/* 琥珀色の点線トレイル */}
        <Polyline
          positions={polyline}
          pathOptions={{ color: "#f4a261", weight: 2, opacity: 0.55, dashArray: "4 8" }}
        />

        {/* 光るマーカー */}
        {records.map((record) => (
          <GlowMarker
            key={record.id}
            record={record}
            onDelete={() => handleDelete(record.id)}
          />
        ))}
      </MapContainer>
    </ChakraProvider>
  );
};

export default Map;
