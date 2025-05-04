import React, { useState } from "react";
import {
  Container,
  Button,
  Input,
  Text,
  VStack,
  Heading,
  Flex,
  Box,
  Image,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

function QueryPage() {
  const [query, setQuery] = useState("");
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(null); // Track which lawyer is loading
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/lawyer/search-lawyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userQuery: query }),
      });

      const data = await response.json();
      setLawyers(data.matchingLawyers || []);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
    } finally {
      setLoading(false);
    }

    setQuery("");
  };

  const handleStartChat = async (lawyer) => {
    // console.log(localStorage)
    const userInfo = localStorage.getItem("userInfo");

    const token = userInfo ? JSON.parse(userInfo).token : null;
    console.log(token) // adjust if you store token differently
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in to start a chat.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setChatLoading(lawyer._id);

    try {
      const response = await fetch("/api/chat/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Chat with ${lawyer.name}`,
          users: JSON.stringify([
            {
              participantId: lawyer._id,
              participantModel: "Lawyer",
            },
          ]),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await response.json();

      toast({
        title: "Chat created!",
        description: `You are now connected with ${lawyer.name}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Example: Redirect to chat page OR handle as needed
      // window.location.href = `/chat/${data._id}`; // optional
      console.log("Group chat created:", data);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Could not create chat. Try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <Flex
      bg="black"
      minH="100vh"
      width="100%"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      <Container maxW="lg" centerContent>
        <Flex
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          width="100%"
          direction="column"
          align="center"
        >
          <VStack spacing={5} width="100%">
            <Heading as="h1" size="lg" color="black" textAlign="center">
              Query Page
            </Heading>

            <Text fontSize="md" color="gray.600" textAlign="center">
              This is the query page where you can ask questions.
            </Text>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4} width="100%">
                <Input
                  type="text"
                  placeholder="Ask your question here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  bg="gray.100"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ borderColor: "gray.500", boxShadow: "outline" }}
                  size="md"
                  required
                />
                <Button
                  type="submit"
                  colorScheme="gray"
                  bg="gray.800"
                  color="white"
                  width="100%"
                  _hover={{ bg: "gray.600" }}
                  isLoading={loading}
                >
                  Submit
                </Button>
              </VStack>
            </form>

            {/* Display matching lawyers */}
            <VStack spacing={4} width="100%" mt={6}>
              {lawyers.map((lawyer, index) => (
                <motion.div
                  key={lawyer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    bg="gray.100"
                    p={4}
                    borderRadius="md"
                    boxShadow="md"
                    width="100%"
                  >
                    <HStack spacing={4} align="center">
                      <Image
                        src={lawyer.profilePicture}
                        alt={lawyer.name}
                        boxSize="50px"
                        borderRadius="full"
                      />
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold">{lawyer.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Specialization: {lawyer.specialization}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Fee per case: ₹{lawyer.feePerCase}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Rating: {lawyer.rating} ({lawyer.reviewsCount} reviews)
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        isLoading={chatLoading === lawyer._id}
                        onClick={() => handleStartChat(lawyer)}
                      >
                        Start Chat
                      </Button>
                    </HStack>
                  </Box>
                </motion.div>
              ))}
            </VStack>
          </VStack>
        </Flex>
      </Container>
    </Flex>
  );
}

export default QueryPage;
