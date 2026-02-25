import { Box, VStack, Text, Image, Flex, Badge } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { Place } from "../services/indexeddbClient";

interface TimelineProps {
  records: Place[];
}

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
};

const Timeline: React.FC<TimelineProps> = ({ records }) => {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <Flex
        height="100dvh"
        align="center"
        justify="center"
        pb="60px"
        direction="column"
        color="gray.400"
        gap={3}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Text fontSize="5xl">🐾</Text>
        </motion.div>
        <Text fontSize="md" fontWeight="medium">まだ足跡がありません</Text>
        <Text fontSize="sm" textAlign="center" px={8}>
          右下のボタンから<br />最初の足跡を残しましょう！
        </Text>
      </Flex>
    );
  }

  return (
    <Box height="100dvh" overflowY="auto" pb="70px" pt={4} px={4} bg="gray.50">
      <Flex align="center" gap={2} mb={4}>
        <Text fontSize="xl">🐾</Text>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          足跡の記録
        </Text>
        <Badge colorScheme="green" borderRadius="full" px={2}>
          {sorted.length}
        </Badge>
      </Flex>

      <VStack spacing={3} align="stretch">
        {sorted.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 250,
              damping: 22,
            }}
          >
            <Box
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.100"
              cursor="pointer"
            >
              <Flex>
                <Box flexShrink={0} width="110px" height="110px" overflow="hidden">
                  <Image
                    src={record.img}
                    alt={record.title}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
                <Box p={3} flex={1} minW={0}>
                  <Text fontSize="xs" color="gray.400" mb={1}>
                    {formatDate(record.date)}
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="md"
                    noOfLines={2}
                    mb={2}
                    color="gray.800"
                  >
                    {record.title || "名称未設定"}
                  </Text>
                  <Flex gap={1} flexWrap="wrap">
                    {record.country && (
                      <Badge colorScheme="green" fontSize="xs" borderRadius="full">
                        🌍 {record.country}
                      </Badge>
                    )}
                    {record.region && (
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                        variant="outline"
                        borderRadius="full"
                      >
                        📍 {record.region}
                      </Badge>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </motion.div>
        ))}
      </VStack>
    </Box>
  );
};

export default Timeline;
