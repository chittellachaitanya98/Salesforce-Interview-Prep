import { redirect } from "next/navigation";

/** Legacy Context hub → Terminology hub (terms-first path) */
export default function ContextHubRedirect() {
  redirect("/terminology/");
}
