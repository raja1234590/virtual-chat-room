import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDir="column"
      p={3}
      bg="white"
      w="100%"              
      h="100%"             
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default Chatbox;
