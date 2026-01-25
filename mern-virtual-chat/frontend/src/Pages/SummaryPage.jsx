import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { Box, Text, Spinner } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const SummaryPage = () => {
  const { chatId } = useParams();
  const { user } = ChatState();

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get(
          `/api/ai/summarize/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setSummary(data.summary);
      } catch (err) {
        setSummary("❌ Failed to load summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [chatId, user]);

  return (
    <Box p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
         Study Summary
      </Text>

      {loading ? (
        <Spinner />
      ) : (
        <Text whiteSpace="pre-wrap">{summary}</Text>
      )}
    </Box>
  );
};

export default SummaryPage;
