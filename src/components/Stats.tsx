import { Box, Grid, VStack, Text, Heading, Flex, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaGlobe, FaRoute, FaMountain } from "react-icons/fa";
import type { Place } from "../services/indexeddbClient";
import { totalDistanceKm } from "../services/locationService";

interface StatsProps {
  records: Place[];
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  bg: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, bg, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 18 }}
  >
    <Box
      bg="white"
      borderRadius="2xl"
      p={4}
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <VStack spacing={2} align="center">
        <Flex
          w={10}
          h={10}
          borderRadius="xl"
          bg={bg}
          align="center"
          justify="center"
          fontSize="18px"
          color={color}
        >
          {icon}
        </Flex>
        <Text fontSize="2xl" fontWeight="black" color="gray.800" lineHeight="1">
          {value}
        </Text>
        <Text fontSize="xs" color="gray.500" textAlign="center" lineHeight="1.3">
          {label}
        </Text>
      </VStack>
    </Box>
  </motion.div>
);

const Stats: React.FC<StatsProps> = ({ records }) => {
  const countries = [
    ...new Set(records.filter((r) => r.country).map((r) => r.country!)),
  ];
  const regions = [
    ...new Set(records.filter((r) => r.region).map((r) => r.region!)),
  ];
  const locations = records.map((r) => r.location);
  const distance = totalDistanceKm(locations);

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestCountry = sorted[0]?.country;

  return (
    <Box
      height="100dvh"
      overflowY="auto"
      pb="70px"
      pt={4}
      px={4}
      bg="gray.50"
    >
      <Flex align="center" gap={2} mb={4}>
        <Text fontSize="xl">📊</Text>
        <Heading size="md" color="gray.700">
          あなたの足跡
        </Heading>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={4}>
        <StatCard
          icon={<FaMapMarkerAlt />}
          value={records.length}
          label="足跡の数"
          color="green.500"
          bg="green.50"
          index={0}
        />
        <StatCard
          icon={<FaGlobe />}
          value={countries.length}
          label="訪れた国"
          color="blue.500"
          bg="blue.50"
          index={1}
        />
        <StatCard
          icon={<FaRoute />}
          value={distance > 0 ? `${distance} km` : "—"}
          label="総移動距離"
          color="orange.500"
          bg="orange.50"
          index={2}
        />
        <StatCard
          icon={<FaMountain />}
          value={regions.length}
          label="訪れた地域"
          color="purple.500"
          bg="purple.50"
          index={3}
        />
      </Grid>

      {countries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            p={4}
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            mb={3}
          >
            <Text fontWeight="bold" mb={3} color="gray.700" fontSize="sm">
              🌍 訪れた国
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {countries.map((country) => (
                <Badge
                  key={country}
                  colorScheme={country === latestCountry ? "green" : "gray"}
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  variant={country === latestCountry ? "solid" : "subtle"}
                >
                  {country}
                </Badge>
              ))}
            </Flex>
          </Box>
        </motion.div>
      )}

      {records.length === 0 && (
        <Flex
          direction="column"
          align="center"
          py={12}
          color="gray.400"
          gap={3}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Text fontSize="5xl">🌍</Text>
          </motion.div>
          <Text fontWeight="medium">旅を始めましょう！</Text>
          <Text fontSize="sm" textAlign="center" px={6}>
            足跡を残すと<br />ここに統計が表示されます
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default Stats;
