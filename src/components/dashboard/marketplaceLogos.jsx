import falabellaLogo from "../../assets/marketplace/falabella.png";
import mercadolibreLogo from "../../assets/marketplace/mercadolibre.png";
import parisLogo from "../../assets/marketplace/paris.png";
import prestashopLogo from "../../assets/marketplace/prestashop.png";
import ripleyLogo from "../../assets/marketplace/ripley.png";
import shopifyLogo from "../../assets/marketplace/shopify.png";
import tiendaNuevaLogo from "../../assets/marketplace/tiendaNube.png";
import walmartLogo from "../../assets/marketplace/walmart.png";
import woocommerceLogo from "../../assets/marketplace/woocommerce.png";
import hitesLogo from "../../assets/marketplace/hites.jpg";
import anymarketLogo from "../../assets/marketplace/anymarket.webp";    
import jumpsellerLogo from "../../assets/marketplace/jumpseller.png";
import meliLogo from "../../assets/marketplace/meli.png";
import softlandLogo from "../../assets/marketplace/softland.png";
import rappiLogo from "../../assets/marketplace/rappi.jpg";
import fardoLogo from "../../assets/marketplace/fardo.webp";

import defaultLogo from "../../assets/marketplace/middify.png";


const normalizeName = (name) =>
  typeof name === "string" ? name.trim().toLowerCase() : "";

export const getMarketplaceLogoByName = (name) => {
  const n = normalizeName(name);

  if (n.includes("falabella")) {
    return falabellaLogo;
  }
  if (n.includes("mercadolibre")) {
    return mercadolibreLogo;
  }
  if (n.includes("prestashop")) {
    return prestashopLogo;
  }
  if (n.includes("tiendanube")) {
    return tiendaNuevaLogo;
  }
  if (n.includes("walmart")) {
    return walmartLogo;
  }
  if (n.includes("woocommerce")) {
    return woocommerceLogo;
  }
  if (n.includes("shopify")) { 
    return shopifyLogo;
  }
  if (n.includes("ripley")) {
    return ripleyLogo;
  }
  if (n.includes("paris")) {
    return parisLogo;
  }
  if (n.includes("hites")) {
    return hitesLogo;
  }
  if (n.includes("anymarket")) {
    return anymarketLogo;
  }
  if (n.includes("jumpseller")) {
    return jumpsellerLogo;
  }
  if (n.includes("meli")) {
    return meliLogo;
  }
  if (n.includes("softland")) {
    return softlandLogo;
  }
  if (n.includes("rappi")) {
    return rappiLogo;
  }
  if (n.includes("fardo")) {
    return fardoLogo;
  }
  return defaultLogo;
};

export const MarketplaceLogo = ({ name, className = "h-20 w-20" }) => {
  const src = getMarketplaceLogoByName(name);
  const alt = typeof name === "string" && name ? name : "sin marketplace";
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      title={alt}
      loading="lazy"
      decoding="async"
    />
  );
};

export default MarketplaceLogo;


