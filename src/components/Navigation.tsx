import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { motion, LayoutGroup } from "framer-motion";
import { FaMap, FaScroll, FaChartBar } from "react-icons/fa6";

export type View = "map" | "timeline" | "stats";

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const tabs: { id: View; icon: React.ElementType; label: string }[] = [
  { id: "map", icon: FaMap, label: "マップ" },
  { id: "timeline", icon: FaScroll, label: "タイムライン" },
  { id: "stats", icon: FaChartBar, label: "統計" },
];

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex={1000}
      bg="rgba(10, 14, 30, 0.96)"
      borderTop="1px solid"
      borderColor="rgba(244, 162, 97, 0.15)"
      boxShadow="0 -4px 24px rgba(0,0,0,0.5)"
      backdropFilter="blur(12px)"
      pb="env(safe-area-inset-bottom, 0)"
    >
      <LayoutGroup>
        <HStack justify="space-around" px={2} pt={1} pb={2}>
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = currentView === id;
            return (
              <VStack
                key={id}
                spacing={0}
                cursor="pointer"
                onClick={() => onViewChange(id)}
                flex={1}
                py={1}
                position="relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onViewChange(id)}
                _hover={{ opacity: 0.8 }}
                transition="opacity 0.15s"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: "absolute",
                      top: -4,
                      left: "15%",
                      right: "15%",
                      height: 3,
                      background: "linear-gradient(90deg, #f4a261, #ffd700)",
                      borderRadius: 4,
                      boxShadow: "0 0 8px rgba(244, 162, 97, 0.7)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Box
                    as={Icon}
                    fontSize="20px"
                    color={isActive ? "#f4a261" : "rgba(255,255,255,0.35)"}
                    transition="color 0.2s"
                    filter={isActive ? "drop-shadow(0 0 6px rgba(244,162,97,0.8))" : "none"}
                  />
                </motion.div>
                <Text
                  fontSize="10px"
                  color={isActive ? "#f4a261" : "rgba(255,255,255,0.3)"}
                  fontWeight={isActive ? "bold" : "normal"}
                  transition="color 0.2s"
                  mt="2px"
                >
                  {label}
                </Text>
              </VStack>
            );
          })}
        </HStack>
      </LayoutGroup>
    </Box>
  );
};

export default Navigation;
