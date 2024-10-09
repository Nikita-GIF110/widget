import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "./Map.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Map
      imageSrc="https://i.playground.ru/p/vyMHGjaxCXlvbts90HYCpQ.jpeg"
      // imageSrc="https://cdn.shopify.com/s/files/1/0082/4147/9737/products/CMYK_City_60x60_signed_4472x.jpg?v=1528014387"
      size="medium"
    />
  </StrictMode>
);
