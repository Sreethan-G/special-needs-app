import { useEffect, useState } from "react";
import { router, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { userId } = useAuth();
  const [ready, setReady] = useState(false);
  const navigation = useRouter();

  useEffect(() => {
    // Mark as ready after mount
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (userId) {
      navigation.replace("/home"); // or router.replace("/home")
    } else {
      navigation.replace("/login");
    }
  }, [userId, ready]);

  return null;
}
