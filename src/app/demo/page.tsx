import { redirect } from "next/navigation";

// The long synthetic overview was retired; /tour is the single demo.
export default function DemoPage() {
  redirect("/tour");
}
