import { redirect } from "next/navigation";

export default function Home() {
  // Langsung arahkan ke dashboard. 
  // Middleware akan mencegat dan menyuruh login jika belum login.
  redirect("/dashboard");
}