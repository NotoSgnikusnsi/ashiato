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
      bg="white"
      borderTop="1px solid"
      borderColor="gray.100"
      boxShadow="0 -2px 12px rgba(0,0,0,0.07)"
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
                      background: "#38A169",
                      borderRadius: 4,
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
                    color={isActive ? "green.500" : "gray.400"}
                    transition="color 0.2s"
                  />
                </motion.div>
                <Text
                  fontSize="10px"
                  color={isActive ? "green.500" : "gray.400"}
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
