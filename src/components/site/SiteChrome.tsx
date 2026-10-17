import { getNav } from "@/lib/nav";
import { getCartView } from "@/lib/cart";
import { getSession } from "@/lib/session";
import { getWishlistCount } from "@/lib/wishlist";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "./ChatWidget";

/**
 * Server shell: resolves nav, bag, wishlist and session once, then wraps the
 * page in the site header and footer.
 *
 * `overHero` is for pages whose first element is a full-bleed hero — the
 * header floats transparently on top instead of reserving layout height.
 */
export async function SiteChrome({
  children,
  overHero = false,
}: {
  children: React.ReactNode;
  overHero?: boolean;
}) {
  const [nav, cart, session, wishlistCount] = await Promise.all([
    getNav(),
    getCartView(),
    getSession(),
    getWishlistCount(),
  ]);

  return (
    <>
      <Header
        nav={nav}
        cartCount={cart.count}
        wishlistCount={wishlistCount}
        user={session ? { name: session.name, role: session.role } : null}
        overHero={overHero}
      />
      <main className={overHero ? "" : "pt-[62px] lg:pt-[122px]"}>{children}</main>
      <Footer nav={nav} />
      <ChatWidget />
    </>
  );
}
