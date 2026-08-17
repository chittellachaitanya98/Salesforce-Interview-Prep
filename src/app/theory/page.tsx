import { redirect } from "next/navigation";

/** Legacy Theory hub → Learn hub */
export default function TheoryHubRedirect() {
  redirect("/learn/");
}
