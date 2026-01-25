import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import api from "../../api/axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await api.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch {
      toast({ title: "Search failed", status: "error" });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await api.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch {
      toast({ title: "Rename failed", status: "error" });
      setRenameLoading(false);
    }
  };

  return (
    <>
      <IconButton icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                />
              ))}
            </Box>

            <FormControl display="flex" mb={3}>
              <Input
                placeholder="Rename group"
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                ml={2}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <Input
              placeholder="Add user"
              onChange={(e) => handleSearch(e.target.value)}
            />

            {loading ? (
              <Spinner />
            ) : (
              searchResult.map((u) => (
                <UserListItem key={u._id} user={u} />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red">Leave Group</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
