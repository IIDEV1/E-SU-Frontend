import { useState } from "react";
import axios from "axios";

export const useCreateDocument = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: { title: string; description: string }) => {
    setIsPending(true);
    try {
      const response = await axios.post("/api/documents", data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании документа:", error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};