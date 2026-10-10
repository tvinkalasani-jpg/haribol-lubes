"use client";

import { useMemo, useState } from "react";

import buttonStyles from "@/components/ui/button.module.css";
import { addCartLine } from "@/lib/checkout/cart";
import { parseStoredCart, serializeCart, storefrontCartStorageKey } from "@/lib/storefront/cart-storage";
import { createOfferDisplayModel } from "@/lib/storefront/presentation";
import type { CheckoutOffer } from "@/types/checkout";

import { QuantityControl } from "./quantity-control";
import styles from "./storefront.module.css";

export function ProductCommercePanel({ offers, quotePath }: { offers: readonly CheckoutOffer[]; quotePath: string }) {
  const [selectedId, setSelectedId] = useState(offers[0]?.id ?? "");
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0];
  const model = useMemo(() => selected ? createOfferDisplayModel(selected) : undefined, [selected]);
  const [quantity, setQuantity] = useState(model?.minimum ?? 1);
  const [announcement, setAnnouncement] = useState("");
  if (!selected || !model) return null;

  const choose = (offer: CheckoutOffer) => {
    const next = createOfferDisplayModel(offer);
    setSelectedId(offer.id);
    setQuantity(next.minimum);
    setAnnouncement(`${offer.displayName} selected. ${next.availability}.`);
  };

  const add = () => {
    if (!model.canAddToCart) return;
    const stored = parseStoredCart(window.localStorage.getItem(storefrontCartStorageKey));
    const next = addCartLine(stored, { offerId: selected.id, quantity });
    window.localStorage.setItem(storefrontCartStorageKey, serializeCart(next));
    setAnnouncement(`${quantity} ${selected.displayName} added to the synthetic test cart.`);
  };

  return (
    <section className={styles.productPanel} aria-labelledby="storefront-preview-title">
      <div className={styles.previewFlag}>Development preview · synthetic prices · not for sale</div>
      <header><p>Storefront readiness</p><h2 id="storefront-preview-title">Choose a test pack</h2></header>
      <div aria-label="Available synthetic packs" className={styles.offerSelector} role="radiogroup">
        {offers.map((offer) => <button aria-checked={offer.id === selected.id} key={offer.id} onClick={() => choose(offer)} role="radio" type="button"><span>{offer.displayName}</span><small>{createOfferDisplayModel(offer).availability}</small></button>)}
      </div>
      <div className={styles.offerDetails}>
        <div>
          {model.promotionLabel ? <span className={styles.promotion}>{model.promotionLabel}</span> : null}
          {model.price ? <p className={styles.price}>{model.price}</p> : <p className={styles.priceOnRequest}>Price on request</p>}
          {model.regularPrice ? <div className={styles.saleMeta}><del>{model.regularPrice}</del><strong>{model.discount}</strong></div> : null}
          <p className={styles.availability}>{model.availability}</p>
          {model.minimum > 1 ? <p>Minimum order: {model.minimum} units</p> : null}
          {model.maximum ? <p>Maximum online quantity: {model.maximum} units</p> : null}
        </div>
        <div className={styles.purchaseActions}>
          {model.canAddToCart ? <><QuantityControl label={selected.displayName} maximum={model.maximum} minimum={model.minimum} onChange={setQuantity} value={quantity} /><button className={`${buttonStyles.button} ${buttonStyles.primary}`} onClick={add} type="button">Add to test cart</button><a className={styles.cartLink} href="/cart">View test cart</a></> : null}
          {model.showQuote ? <a className={`${buttonStyles.button} ${buttonStyles.ghost}`} href={quotePath}>Request a Quote</a> : null}
        </div>
      </div>
      <p aria-live="polite" className={styles.srAnnouncement}>{announcement}</p>
    </section>
  );
}
