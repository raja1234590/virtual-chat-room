import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed className="scrollable-chat">
      {messages.map((m) => {
        const isMe = m.sender._id === user._id;

        return (
          <div
            key={m._id}
            style={{
              display: "flex",
              justifyContent: isMe ? "flex-end" : "flex-start",
              marginBottom: "10px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            {!isMe && (
              <Tooltip label={m.sender.name} hasArrow>
                <Avatar size="sm" src={m.sender.pic} mr={2} />
              </Tooltip>
            )}

            <div
              style={{
                backgroundColor: isMe ? "#BEE3F8" : "#B9F5D0",
                padding: "10px 15px",
                borderRadius: "18px",
                maxWidth: "60%",
                wordBreak: "break-word",
                fontSize: "15px",
              }}
            >
              {m.messageType === "file" ? (
                <a
                  href={m.content}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: "600" }}
                >
                  📎 {m.fileName}
                </a>
              ) : (
                m.content
              )}
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
