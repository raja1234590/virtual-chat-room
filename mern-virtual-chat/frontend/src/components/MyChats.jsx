import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { Button, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import api from "../api/axios";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [loggedUser, setLoggedUser] = useState(null);
  const toast = useToast();

  const fetchChats = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      const { data } = await api.get("/api/chat", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Failed to load chats",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [user, setChats, toast]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setLoggedUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchAgain, fetchChats]);

  if (!user) return null;

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize="30px"
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button rightIcon={<AddIcon />}>New Group</Button>
        </GroupChatModal>
      </Box>

      <Box bg="#F8F8F8" w="100%" h="100%" p={3} borderRadius="lg">
        {chats.length === 0 ? (
          <ChatLoading />
        ) : (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat?._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat?._id === chat._id ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
              >
                <Text>
                  {!chat.isGroupChat && loggedUser
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
