import {
  FormControl,
  Input,
  Box,
  Text,
  IconButton,
  Spinner,
  useToast,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import io from "socket.io-client";

import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const selectedChatRef = useRef();

  const { selectedChat, setSelectedChat, user, setNotification } =
    ChatState();

  // ================= FETCH MESSAGES =================
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/message/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch {
      toast({
        title: "Failed to load messages",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedChat, user, toast]);

  // ================= SEND TEXT =================
  const sendMessage = async (e) => {
    if (e.key !== "Enter" || !newMessage.trim()) return;

    try {
      const { data } = await api.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setNewMessage("");
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast({
        title: "Message send failed",
        status: "error",
        isClosable: true,
      });
    }
  };

  // ================= FILE UPLOAD (NO SUMMARY HERE) =================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/api/upload", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const { data } = await api.post(
        "/api/message",
        {
          chatId: selectedChat._id,
          messageType: "file",
          fileName: uploadRes.data.fileName,
          content: uploadRes.data.fileUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast({
        title: "File upload failed",
        status: "error",
        isClosable: true,
      });
    }
  };

  // ================= SOCKET =================
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("message recieved", (msg) => {
      if (
        !selectedChatRef.current ||
        selectedChatRef.current._id !== msg.chat._id
      ) {
        setNotification((prev) => [msg, ...prev]);
        setFetchAgain((prev) => !prev);
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("message recieved");
  }, [user, setFetchAgain, setNotification]);

  useEffect(() => {
    fetchMessages();
    selectedChatRef.current = selectedChat;
  }, [selectedChat, fetchMessages]);

  if (!selectedChat) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text>Select a chat to start messaging</Text>
      </Box>
    );
  }

  // ================= UI =================
  return (
    <>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" pb={2}>
        <IconButton
          icon={<ArrowBackIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={() => setSelectedChat(null)}
        />

        <Box display="flex" alignItems="center" gap={3}>
          {!selectedChat.isGroupChat ? (
            <>
              <Text fontSize="lg">
                {getSender(user, selectedChat.users)}
              </Text>
              <ProfileModal user={getSenderFull(user, selectedChat.users)} />
            </>
          ) : (
            <>
              <Text fontSize="lg">{selectedChat.chatName}</Text>
              <UpdateGroupChatModal
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
              />
            </>
          )}

          {/* ✅ ONLY NAVIGATION */}
          <Button
            size="sm"
            colorScheme="purple"
            onClick={() => navigate(`/summary/${selectedChat._id}`)}
          >
            ✨ Summarize
          </Button>
        </Box>
      </Box>

      {/* CHAT BODY */}
      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        bg="#E8E8E8"
        p={3}
        h="100%"
        borderRadius="lg"
      >
        {loading ? <Spinner /> : <ScrollableChat messages={messages} />}

        {/* INPUT */}
        <FormControl mt={3} onKeyDown={sendMessage}>
          <Box
            display="flex"
            alignItems="center"
            bg="white"
            borderRadius="lg"
            px={2}
            py={1}
          >
            <IconButton
              icon={<AttachmentIcon />}
              variant="ghost"
              onClick={() => document.getElementById("fileInput").click()}
            />

            <Input
              variant="unstyled"
              placeholder="Enter a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              mx={2}
            />

            <input
              type="file"
              id="fileInput"
              hidden
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleFileUpload}
            />
          </Box>
        </FormControl>
      </Box>
    </>
  );
};

export default SingleChat;
