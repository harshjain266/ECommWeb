/**
 * The house's own contact details, in one place.
 *
 * They were previously written out in eight files -- the footer, the
 * appointment form, the confirmation email, two content pages and the chat
 * widget. Moving the studio meant finding all eight, and missing one would
 * have sent a client to the wrong door.
 */
export const ATELIER = {
  line1: "Shop-32, Santushti Shopping Complex",
  line2: "Airforce Tejas Camp, Chanakyapuri",
  postcode: "110021",
  city: "New Delhi",
  /** Short form for eyebrows and running prose. */
  area: "Chanakyapuri, New Delhi",
  email: "atelier@sanskarandkabir.com",
  phone: "+91 98701 96806",
  /** Digits only, for `tel:` and `wa.me` links. */
  phoneDigits: "919870196806",
  hours: "Tuesday to Saturday, 11am to 7pm",
} as const;

/** The full postal address as a single line. */
export const ATELIER_ADDRESS =
  `${ATELIER.line1}, ${ATELIER.line2}-${ATELIER.postcode}`;
