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
  IconButton,
  Text,
  Image,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 🛑 HARD GUARD — prevents empty modal
  if (!user) return null;

  return (
    <>
      {children ? (
        <span onClick={onOpen} style={{ cursor: "pointer" }}>
          {children}
        </span>
      ) : (
        <IconButton
          icon={<ViewIcon />}
          onClick={onOpen}
          aria-label="View Profile"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">
            {user.name || "User"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            gap={4}
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic || "https://via.placeholder.com/150"}
              alt={user.name || "profile"}
            />

            <Text fontSize="md">
              <b>Email:</b>{" "}
              {user.email ? user.email : "Email not available"}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
