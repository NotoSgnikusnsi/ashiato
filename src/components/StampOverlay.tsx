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
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
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
          {/* 背景のリップル */}
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(72, 187, 120, 0.4)",
            }}
          />

          {/* スタンプ本体 */}
          <motion.div
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 1.1, 1.2],
              rotate: [-20, 8, -4, 0],
              opacity: [0, 1, 1, 1],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.65,
              times: [0, 0.45, 0.75, 1],
              ease: "easeOut",
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Box fontSize="80px" lineHeight="1" userSelect="none">
              🐾
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Text
                fontSize="lg"
                fontWeight="black"
                color="green.600"
                textShadow="0 1px 4px rgba(0,0,0,0.15)"
                letterSpacing="wide"
              >
                足跡を残した！
              </Text>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StampOverlay;
