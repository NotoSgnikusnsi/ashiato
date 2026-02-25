import { Box, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

interface StampOverlayProps {
  isVisible: boolean;
}

const StampOverlay: React.FC<StampOverlayProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {/* 光のリップル（外） */}
          <motion.div
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(244,162,97,0.3) 50%, transparent 100%)",
            }}
          />

          {/* 光のリップル（内） */}
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,248,225,0.9) 0%, rgba(244,162,97,0.5) 60%, transparent 100%)",
            }}
          />

          {/* 炎スタンプ */}
          <motion.div
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{
              scale: [0, 1.6, 1.15, 1.25],
              rotate: [-15, 6, -3, 0],
              opacity: [0, 1, 1, 1],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.42, 0.72, 1], ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Box fontSize="72px" lineHeight="1" userSelect="none" filter="drop-shadow(0 0 20px rgba(255,200,50,0.9))">
              🕯️
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <Text
                fontSize="lg"
                fontWeight="black"
                color="#ffd700"
                textShadow="0 0 16px rgba(255,200,50,0.9), 0 1px 4px rgba(0,0,0,0.6)"
                letterSpacing="wide"
              >
                光を灯した！
              </Text>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StampOverlay;
