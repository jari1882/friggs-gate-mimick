"use client";

import { ChatWindow } from "./components/ChatWindow";
import { ToastContainer } from "react-toastify";
import { ChakraProvider } from "@chakra-ui/react";

export default function Home() {
  return (
    <ChakraProvider>
      <ToastContainer />
      <div className="h-screen overflow-hidden">
        <ChatWindow />
      </div>
    </ChakraProvider>
  );
}
