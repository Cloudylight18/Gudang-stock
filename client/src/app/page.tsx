import { redirect } from "next/navigation";

export default function Home() {
  // Begitu halaman utama diakses, langsung arahkan ke /dashboard
  redirect("/dashboard");
}
