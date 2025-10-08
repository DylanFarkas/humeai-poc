"use client";

import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/sts/Chat"), { ssr: false });

export default function ChatClient({ accessToken }: { accessToken: string }) {
  return <Chat accessToken={accessToken} />;
}
