import { redirect } from "next/navigation";

// 홈 화면이 루트("/")로 옮겨가면서 예전 /home 북마크·링크가 깨지지 않도록 리다이렉트만 남겨둠.
export default function HomePage() {
  redirect("/");
}
