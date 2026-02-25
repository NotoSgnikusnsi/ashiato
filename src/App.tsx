import { useEffect, useRef, useState } from "react";
import "./style/App.css";
import {
  ChakraProvider,
  Box,
  IconButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaShoePrints, FaLocationCrosshairs } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { openDB, fetchAllRecords } from "./services/indexeddbClient.ts";
import type { Place } from "./services/indexeddbClient.ts";
import { isNewLocation } from "./services/locationService.ts";
import Map from "./components/Map.tsx";
import FormModal from "./components/FormModal.tsx";
import Navigation from "./components/Navigation.tsx";
import type { View } from "./components/Navigation.tsx";
import Timeline from "./components/Timeline.tsx";
import Stats from "./components/Stats.tsx";
import StampOverlay from "./components/StampOverlay.tsx";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [records, setRecords] = useState<Place[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [currentView, setCurrentView] = useState<View>("map");
  const [showStamp, setShowStamp] = useState(false);
  const [flyToTrigger, setFlyToTrigger] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // ジオフェンシング: 最新の records を closure の外から参照するための ref
  const recordsRef = useRef<Place[]>([]);
  recordsRef.current = records;

  // 直前に通知した地点（連続通知防止）
  const lastNotifiedRef = useRef<{ lat: number; lon: number } | null>(null);

  // ============================================================
  // データ操作
  // ============================================================

  const loadAllRecords = (database?: IDBDatabase) => {
    const targetDb = database ?? db;
    if (!targetDb) return;
    fetchAllRecords(targetDb)
      .then(setRecords)
      .catch(() => {
        toast({
          title: "記録の読み込みに失敗しました",
          status: "error",
          position: "top",
          duration: 3000,
        });
      });
  };

  // ============================================================
  // 位置情報
  // ============================================================

  const fetchCurrentLocation = (): Promise<{ lat: number; lon: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          setCurrentLocation(loc);
          resolve(loc);
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  // 新しい場所に来たらブラウザ通知を送る
  const checkGeofencing = (lat: number, lon: number) => {
    const saved = recordsRef.current.map((r) => r.location);
    if (!isNewLocation(lat, lon, saved)) return;

    const last = lastNotifiedRef.current;
    if (
      last &&
      Math.abs(last.lat - lat) < 0.003 &&
      Math.abs(last.lon - lon) < 0.003
    )
      return;

    lastNotifiedRef.current = { lat, lon };

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🐾 新しい場所にいます！", {
        body: "足跡を残しませんか？",
        icon: "/favicon.ico",
      });
    }
  };

  // ============================================================
  // UI ハンドラー
  // ============================================================

  const handleAddLocationIconButtonClick = async () => {
    setCurrentView("map");
    try {
      await fetchCurrentLocation();
    } catch {
      toast({
        title: "位置情報の取得に失敗しました",
        status: "warning",
        position: "top",
        duration: 3000,
      });
    }
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    if (fileElem) {
      fileElem.value = "";
      fileElem.click();
    }
  };

  const handleSelectImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file?.type.includes("image")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      onOpen();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSuccess = () => {
    setShowStamp(true);
    setTimeout(() => setShowStamp(false), 2200);
  };

  // ============================================================
  // 初期化 & 位置監視
  // ============================================================

  useEffect(() => {
    // DB 初期化
    openDB()
      .then((database) => {
        setDb(database);
        loadAllRecords(database);
      })
      .catch(() => {
        toast({
          title: "データベースの初期化に失敗しました",
          status: "error",
          position: "top",
        });
      });

    // 通知許可をリクエスト
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 初回位置取得
    fetchCurrentLocation().catch(console.warn);

    // 位置の継続監視（ジオフェンシング）
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setCurrentLocation(loc);
        checkGeofencing(loc.lat, loc.lon);
      },
      (err) => console.warn("位置情報の監視エラー:", err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // レンダリング
  // ============================================================

  return (
    <ChakraProvider>
      <Box position="relative" maxW="2xl" mx="auto" overflow="hidden">
        {/* ビュー切り替えアニメーション */}
        <AnimatePresence mode="wait">
          {currentView === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Map
                records={records}
                location={currentLocation}
                db={db}
                loadRecords={loadAllRecords}
                flyToTrigger={flyToTrigger}
              />
            </motion.div>
          )}

          {currentView === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Timeline records={records} />
            </motion.div>
          )}

          {currentView === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Stats records={records} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* フローティングアクションボタン */}
        <Box
          position="fixed"
          bottom="130px"
          right="20px"
          zIndex={1000}
        >
          <motion.div
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <IconButton
              icon={<FaShoePrints />}
              colorScheme="green"
              aria-label="あしあとを残す"
              size="lg"
              borderRadius="full"
              boxShadow="0 4px 20px rgba(72,187,120,0.45)"
              onClick={handleAddLocationIconButtonClick}
            />
          </motion.div>
          <input
            type="file"
            id="fileElem"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleSelectImageChange}
          />
        </Box>

        <Box
          position="fixed"
          bottom="75px"
          right="20px"
          zIndex={1000}
        >
          <motion.div
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <IconButton
              icon={<FaLocationCrosshairs />}
              colorScheme="blue"
              aria-label="現在地へ移動"
              size="md"
              borderRadius="full"
              boxShadow="0 4px 14px rgba(66,153,225,0.35)"
              onClick={async () => {
                setCurrentView("map");
                try {
                  await fetchCurrentLocation();
                  setFlyToTrigger((n) => n + 1);
                } catch {
                  toast({
                    title: "位置情報の取得に失敗しました",
                    status: "warning",
                    position: "top",
                    duration: 3000,
                  });
                }
              }}
            />
          </motion.div>
        </Box>

        {/* フォームモーダル */}
        <FormModal
          isOpen={isOpen}
          onClose={onClose}
          imageSrc={selectedImage}
          location={currentLocation}
          db={db}
          loadRecords={loadAllRecords}
          onSaveSuccess={handleSaveSuccess}
        />

        {/* ボトムナビゲーション */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />

        {/* 保存成功スタンプアニメーション */}
        <StampOverlay isVisible={showStamp} />
      </Box>
    </ChakraProvider>
  );
}

export default App;
