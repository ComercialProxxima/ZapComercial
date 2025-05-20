import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "ZapComercial";

// Add meta description for SEO
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "WhatsApp Web Clone com chat em tempo real usando WebSockets. Entre com seu nome e converse com outros usuários.";
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social sharing
const ogTitle = document.createElement("meta");
ogTitle.property = "og:title";
ogTitle.content = "ZapComercial - Chat em Tempo Real";
document.head.appendChild(ogTitle);

const ogDescription = document.createElement("meta");
ogDescription.property = "og:description";
ogDescription.content = "Entre com seu nome e comece a conversar em tempo real com outros usuários neste clone do WhatsApp Web.";
document.head.appendChild(ogDescription);

const ogType = document.createElement("meta");
ogType.property = "og:type";
ogType.content = "website";
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
