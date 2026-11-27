import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import bodyHtml from "@/site/body.html?raw";

const title = "Ember & Oak — Specialty Coffee House | A Moment of Calm, in Every Cup";
const description =
  "Ember & Oak is a specialty coffee house in Portland. Cinematically crafted espresso, slow mornings and a warm place to stay a while.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..700&family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "/css/style.css?v=6" },
      { rel: "icon", type: "image/svg+xml", href: "/assets/icons/favicon.svg" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    // The original site script expects the page markup to already exist; load it once after mount.
    if (document.getElementById("cafe-main-js")) return;
    const s = document.createElement("script");
    s.id = "cafe-main-js";
    s.src = "/js/main.js?v=6";
    s.onload = () => {
      if (document.readyState === "complete") window.dispatchEvent(new Event("load"));
    };
    document.body.appendChild(s);
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
