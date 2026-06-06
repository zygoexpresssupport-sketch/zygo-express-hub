import { useEffect } from "react";

export default function Admin() {
  useEffect(() => {
    window.location.replace("/Admin3.html");
  }, []);
  return null;
}