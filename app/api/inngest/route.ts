import { serve } from "inngest/next";
import { inngest } from "@/inngest/inngest.client";
import { streamViewers } from "@/inngest/functions/streamViewers";

export const { GET, POST, PUT } = serve({ client: inngest, functions: [streamViewers] });
