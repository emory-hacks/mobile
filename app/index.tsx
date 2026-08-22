import { restoreSession } from "@/utils/session";
import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [href, setHref] = useState<Href | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const signedIn = await restoreSession();
        if (active) {
          setHref(signedIn ? "/(tabs)/(home)" : "/login");
        }
      } catch {
        if (active) {
          setHref("/login");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!href) {
    return null;
  }

  return <Redirect href={href} />;
}
