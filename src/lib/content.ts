import type { Block } from "@/components/site/Prose";

export type ContentPage = {
  eyebrow: string;
  title: string;
  blurb: string;
  /** Index into STILLS for the page's hero art. */
  art: number;
  blocks: Block[];
};

export const CONTENT: Record<string, ContentPage> = {
  "size-guide": {
    eyebrow: "Client care",
    title: "Size & measurement guide",
    blurb:
      "Ready sizes are cut to the table below. Anything marked Bespoke is cut to you instead, which is almost always the better answer for occasion wear.",
    art: 1,
    blocks: [
      { kind: "h", text: "Women's ready sizes" },
      {
        kind: "table",
        head: ["Size", "Bust (in)", "Waist (in)", "Hip (in)"],
        rows: [
          ["XS", "32", "26", "35"],
          ["S", "34", "28", "37"],
          ["M", "36", "30", "39"],
          ["L", "38", "32", "41"],
          ["XL", "40", "34", "43"],
        ],
      },
      { kind: "h", text: "Men's ready sizes" },
      {
        kind: "table",
        head: ["Size", "Chest (in)", "Waist (in)"],
        rows: [
          ['38"', "38", "32"],
          ['40"', "40", "34"],
          ['42"', "42", "36"],
          ['44"', "44", "38"],
          ['46"', "46", "40"],
        ],
      },
      { kind: "h", text: "How to measure yourself" },
      {
        kind: "list",
        items: [
          "Measure over the underwear you intend to wear on the day, not over clothes.",
          "Keep the tape level and snug but not pulled — if it dents the skin it is too tight.",
          "Bust is the fullest point; waist is the narrowest, usually just above the navel.",
          "Hip is the fullest point, roughly eight inches below the waist.",
          "Lehenga length is measured from the waist to the floor, barefoot. Tell us your heel height and we will add it.",
        ],
      },
      { kind: "h", text: "Why we recommend bespoke" },
      {
        kind: "p",
        text: "A ready size is cut to an average body. Occasion wear is photographed from every angle and worn for twelve hours, which is exactly when an average fit shows. Bespoke adds eight to ten weeks and a surcharge, and includes three fittings. If your date allows for it, take it.",
      },
    ],
  },

  faqs: {
    eyebrow: "Client care",
    title: "FAQ's",
    blurb: "The questions we are actually asked, answered at the length they deserve.",
    art: 7,
    blocks: [
      { kind: "h", text: "How far ahead should I commission a bridal piece?" },
      {
        kind: "p",
        text: "Nine months is comfortable; six is possible; under four we will usually say no rather than rush the embroidery. The frame time is the fixed part — a dense bridal skirt is four to seven months on the frame and no amount of money shortens it.",
      },
      { kind: "h", text: "Do you ship internationally?" },
      {
        kind: "p",
        text: "Yes, worldwide by DHL Express. Duties and import taxes are payable by the recipient and are not included in the price shown. Write to us for a freight quote before ordering — for a heavy bridal piece it is not trivial and we would rather you knew first.",
      },
      { kind: "h", text: "What does Custom Tailored actually include?" },
      {
        kind: "p",
        text: "Cut to your measurements over three fittings: a plain cotton toile, an embroidered fitting, and a final hem fitting with your shoes. Allow eight to ten weeks. The surcharge is shown on the size selector before you add to bag.",
      },
      { kind: "h", text: "Can I see the piece being made?" },
      {
        kind: "p",
        text: "Please do. Clients are welcome on the floor during a commission, and most people come twice. We will tell you which weeks are worth visiting — watching a toile being cut is less interesting than watching zardozi being couched.",
      },
      { kind: "h", text: "Is the jewellery sold separately from the clothes?" },
      {
        kind: "p",
        text: "Yes, everything on the jewellery side stands alone. But if you are commissioning both, say so at the consultation — Sanskar will match the gold to the zardozi thread lot, and that only works if it is planned from the start.",
      },
      { kind: "h", text: "Can I return something?" },
      {
        kind: "p",
        text: "Ready pieces, within seven days, unworn and with tags. Custom-tailored pieces cannot be returned — they are cut to one person — but three fittings mean nothing should reach you as a surprise, and if one does not fit on delivery that is our error to fix at our cost.",
      },
      { kind: "h", text: "What payment methods do you take?" },
      {
        kind: "p",
        text: "Cards, UPI, netbanking and wallets through Razorpay. Commissions are invoiced 50% to begin work and 50% before dispatch. We never see or store your card details.",
      },
      { kind: "h", text: "How should I store an embroidered piece?" },
      {
        kind: "p",
        text: "Flat, folded, in the muslin bag it arrived in — never hung. A zardozi lehenga can weigh seven kilograms and hanging it pulls the shoulder seams out of true over months. The full guidance is on the care page.",
      },
    ],
  },

  shipping: {
    eyebrow: "Client care",
    title: "Shipping & delivery",
    blurb:
      "Everything is shipped insured, in a rigid box with a muslin bag inside. We do not use poly mailers for embroidered pieces.",
    art: 3,
    blocks: [
      { kind: "h", text: "Within India" },
      {
        kind: "list",
        items: [
          "Complimentary on orders over ₹2,500; a flat ₹250 below that.",
          "Ready pieces dispatch within three working days.",
          "Metro delivery is typically two to four working days after dispatch; elsewhere four to seven.",
          "Every parcel is insured for its full value and needs a signature.",
        ],
      },
      { kind: "h", text: "Bespoke and bridal" },
      {
        kind: "p",
        text: "A commission ships when it is finished, not to a courier's schedule. You will have a date at the first fitting and we will hold to it; if anything slips, you will hear it from us before you have to ask.",
      },
      { kind: "h", text: "International" },
      {
        kind: "p",
        text: "We ship worldwide by DHL Express. Duties and import taxes are the recipient's responsibility and are not included in the price shown. Write to the atelier for a quote before you order — for a heavy bridal piece the freight is not trivial and we would rather you knew first.",
      },
      { kind: "h", text: "Tracking" },
      {
        kind: "p",
        text: "A tracking number is emailed on dispatch. Signed-in customers can also see order status under Your account.",
      },
    ],
  },

  returns: {
    eyebrow: "Client care",
    title: "Returns & exchanges",
    blurb:
      "Ready pieces can come back within seven days. Bespoke pieces cannot, for the obvious reason — but we would rather fix a problem than argue about a policy.",
    art: 5,
    blocks: [
      { kind: "h", text: "Ready pieces" },
      {
        kind: "list",
        items: [
          "Seven days from delivery to tell us you would like to return something.",
          "Unworn, unaltered, with the tags and the muslin bag.",
          "Refunds go back to the original payment method within seven working days of us receiving the piece.",
          "Return freight within India is on us for a fault, and on you for a change of mind.",
        ],
      },
      { kind: "h", text: "Bespoke and made-to-measure" },
      {
        kind: "p",
        text: "These are cut to one person's measurements and cannot be resold, so they are not returnable. What they do carry is three fittings — the point of which is that nothing reaches you as a surprise. If a bespoke piece does not fit on delivery, that is our error and we will remake or re-cut it at our cost.",
      },
      { kind: "h", text: "Alterations" },
      {
        kind: "p",
        text: "Complimentary for twelve months on anything bought here, whether ready or bespoke. Bodies change; a well-made piece should be able to follow.",
      },
      { kind: "h", text: "What is not a fault" },
      {
        kind: "p",
        text: "Hand work is not machine work. Slight irregularity in a mirror's reflection, a block print's registration, or the density of a zardozi vine is evidence of the hand, not a defect — and it is the reason the piece is worth what it costs.",
      },
    ],
  },

  care: {
    eyebrow: "Client care",
    title: "Caring for hand embroidery",
    blurb:
      "Most damage to an embroidered piece happens in storage, not in wear. Five minutes of care buys decades.",
    art: 8,
    blocks: [
      { kind: "h", text: "Never hang heavy work" },
      {
        kind: "p",
        text: "A zardozi lehenga can weigh seven kilograms. Hung, that weight pulls on the shoulder seams and the waistband for months at a time and will distort them permanently. Store it flat, folded along its existing creases, in the muslin bag it arrived in.",
      },
      { kind: "h", text: "Dry clean only, and choose who" },
      {
        kind: "p",
        text: "Take it to someone who handles hand embroidery specifically and tell them what the work is. A general dry cleaner's solvent and drum will flatten raised dabka and can pull threads. We are happy to recommend someone in Delhi, Mumbai or Bangalore.",
      },
      { kind: "h", text: "Keep it away from light and damp" },
      {
        kind: "list",
        items: [
          "Direct sunlight fades silk and tarnishes real zari faster than anything else.",
          "Use muslin or cotton, never plastic — plastic traps moisture and yellows silk.",
          "Refold along different lines once a year so a crease never becomes a permanent line.",
          "Keep naphthalene balls near but never touching the fabric.",
        ],
      },
      { kind: "h", text: "If something catches" },
      {
        kind: "p",
        text: "Do not pull it. Push the thread back through to the reverse with a blunt needle, or send it to us. A caught thread is a ten-minute repair; a pulled one is an afternoon.",
      },
    ],
  },

  craft: {
    eyebrow: "The house",
    title: "Our craft",
    blurb:
      "Six techniques account for almost everything we make. Knowing what they are is the difference between buying a price and buying a piece.",
    art: 10,
    blocks: [
      { kind: "h", text: "Zardozi" },
      {
        kind: "p",
        text: "Metal thread couched onto a stretched frame with a hooked needle. Worked from the back, which is why a good zardozi reverse looks almost as deliberate as its face. It is the densest and slowest of the techniques: nine hundred hours is normal for a bridal skirt.",
      },
      { kind: "h", text: "Dabka and kora" },
      {
        kind: "p",
        text: "Coiled metal wire, cut to length and sewn down like a bead. Dabka is matte and dense, kora is bright and open. Raised dabka over a cotton padding is what gives embroidery its shadow — and it is the first thing a careless dry cleaner flattens.",
      },
      { kind: "h", text: "Aari" },
      {
        kind: "p",
        text: "A chain stitch made with an awl rather than a needle, fast enough to cover ground and fine enough to draw with. Most of our thread florals are aari.",
      },
      { kind: "h", text: "Kadhwa handloom" },
      {
        kind: "p",
        text: "Not embroidery at all, but weaving. Each brocade motif is woven in as its own operation rather than carried across the back on a float, so the reverse is clean and the motif will never fray loose. It is roughly four times slower than the cutwork alternative, and it is the only Benarasi we sell.",
      },
      { kind: "h", text: "Chikankari" },
      {
        kind: "p",
        text: "Lucknow's white-on-white shadow work. Six stitch families — bakhiya, phanda, murri, jaali, hool, keel — each doing a different job. Jaali is the remarkable one: the threads of the fabric are teased apart with a needle to make a net, with nothing cut.",
      },
      { kind: "h", text: "Gota and shisha" },
      {
        kind: "p",
        text: "Rajasthani work. Gota is woven metal ribbon, appliquéd and couched by hand rather than run through a machine. Shisha mirrors are hand-cut and held by a thread bezel, which is why their reflections are irregular — pre-cut discs look uniform, and uniform looks manufactured.",
      },
    ],
  },

  journal: {
    eyebrow: "The house",
    title: "Journal",
    blurb:
      "Notes from the floor — what we are making, who is making it, and the occasional argument about technique.",
    art: 12,
    blocks: [
      { kind: "h", text: "On the nine-month calendar" },
      {
        kind: "p",
        text: "People are often surprised that a bridal commission wants nine months. The embroidery itself is four to seven; the rest is fittings, and the gap between them. A toile fitted in March and an embroidered fitting in July tell you different things, and you need both.",
      },
      { kind: "h", text: "Why we stopped outsourcing" },
      {
        kind: "p",
        text: "For our first three years part of the aari went out to a workshop we did not control. The work came back fine and we had no idea who had done it or what they had been paid. Bringing it in cost us margin and a year of hiring. It is the single best decision this house has made.",
      },
      { kind: "h", text: "Real zari tarnishes, and that is the point" },
      {
        kind: "p",
        text: "Silver thread gilded in gold will dull over a decade into something warmer and less showy. Synthetic zari will not — it will stay exactly as bright as the day you bought it, and then it will flake. We only use real zari, and we tell people to expect the change.",
      },
    ],
  },

  contact: {
    eyebrow: "The house",
    title: "Contact",
    blurb:
      "We answer email within two working days. For anything bridal, an appointment is a better use of your time than an email.",
    art: 14,
    blocks: [
      { kind: "h", text: "The atelier" },
      {
        kind: "list",
        items: [
          "Shop-32, Santushti Shopping Complex, Airforce Tejas Camp, Chanakyapuri-110021",
          "atelier@sanskarandkabir.com",
          "+91 11 4123 4567",
          "Tuesday to Saturday, 11am — 7pm. Sunday and Monday by appointment only.",
        ],
      },
      { kind: "h", text: "Bridal consultations" },
      {
        kind: "p",
        text: "Booked rather than walked in, because a consultation takes ninety minutes and a designer has to be free for all of it. Use the appointment form on the atelier page and we will come back with slots.",
      },
      { kind: "h", text: "Press and collaborations" },
      {
        kind: "p",
        text: "Write to atelier@sanskarandkabir.com with PRESS in the subject line. We lend pieces for editorial and we are happy to have the work photographed on the floor.",
      },
      { kind: "h", text: "Existing orders" },
      {
        kind: "p",
        text: "Quote your order number (it looks like SK-2026-0001) and we can answer in one reply rather than three. Signed-in customers can see live status under Your account.",
      },
    ],
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy",
    blurb:
      "What we collect, why, and how to get rid of it. Short, because we collect very little.",
    art: 16,
    blocks: [
      { kind: "h", text: "What we hold" },
      {
        kind: "list",
        items: [
          "Your name, email, phone and delivery address, so we can send you what you bought.",
          "Your measurements, if you have commissioned something, so the next piece need not start from scratch.",
          "Your order and payment history.",
          "A session cookie that keeps you signed in, and a cart cookie that remembers your bag.",
        ],
      },
      { kind: "h", text: "What we never hold" },
      {
        kind: "p",
        text: "Card numbers. Payment is handled entirely by Razorpay; card and UPI details are entered on their infrastructure and never reach our servers. We store only the provider's reference ids, which is what lets us match a payment to an order.",
      },
      { kind: "h", text: "Who else sees it" },
      {
        kind: "p",
        text: "Razorpay for payments, our courier for the delivery address, and Cloudinary which hosts our photography. We do not sell data and we do not run advertising trackers.",
      },
      { kind: "h", text: "Your rights" },
      {
        kind: "p",
        text: "Write to atelier@sanskarandkabir.com to see, correct or delete what we hold. We will action it within thirty days. Deleting your account removes your profile and measurements; order records are kept as long as tax law requires.",
      },
    ],
  },

  terms: {
    eyebrow: "Legal",
    title: "Terms",
    blurb: "The terms on which we sell. Plain language, and binding.",
    art: 18,
    blocks: [
      { kind: "h", text: "Orders" },
      {
        kind: "p",
        text: "An order is accepted when payment is captured and we have emailed you a confirmation. If something is mispriced or has sold out between your order and our confirmation, we will tell you and refund in full rather than substitute.",
      },
      { kind: "h", text: "Prices and payment" },
      {
        kind: "p",
        text: "Prices are in Indian rupees and include GST. Payment is taken through Razorpay by card, UPI, netbanking or wallet. Bespoke commissions are invoiced as 50% to begin work and 50% before dispatch.",
      },
      { kind: "h", text: "Hand work" },
      {
        kind: "p",
        text: "Every piece is made by hand and no two are identical. Colour on a screen is not colour in a room; we will send physical swatches for any commission, and we recommend you wait for them before deciding.",
      },
      { kind: "h", text: "Cancellation" },
      {
        kind: "list",
        items: [
          "A ready piece can be cancelled any time before dispatch for a full refund.",
          "A commission can be cancelled before the first cut for a full refund of the deposit.",
          "Once cloth is cut, the deposit is not refundable — the fabric and the frame time are already spent.",
        ],
      },
      { kind: "h", text: "Governing law" },
      {
        kind: "p",
        text: "These terms are governed by the laws of India, and disputes fall to the courts of New Delhi.",
      },
    ],
  },
};
