"use client";

import dynamic from "next/dynamic";

const VoiceExpression = dynamic(() => import("@/components/expressions/VoiceExpression"), { ssr: false });

export default function ExpressionClient({ accessToken }: { accessToken: string }) {
  return <VoiceExpression accessToken={accessToken} />;
}
