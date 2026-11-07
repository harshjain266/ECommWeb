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
  email: "sanskarandkabir@gmail.com",
  /** As written on the page. */
  phone: "9718282121",
  /** For `tel:` -- dialled from abroad, a bare local number does not connect. */
  phoneTel: "+919718282121",
  /**
   * For `wa.me`, which requires the country code and nothing else. A bare
   * "9718282121" resolves to no account at all, and a number with a space in
   * it -- which is how the product page had it -- resolves to an error page.
   */
  whatsapp: "919718282121",
  hours: "Tuesday to Saturday, 11am to 7pm",
} as const;

/** The full postal address as a single line. */
export const ATELIER_ADDRESS =
  `${ATELIER.line1}, ${ATELIER.line2}-${ATELIER.postcode}`;
