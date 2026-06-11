import { useEffect } from "react";

export default function Admin() {
  useEffect(() => {
    window.location.replace("/admin3.html");
  }, []);
  return null;
}