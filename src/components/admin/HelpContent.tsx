const h2 = "mt-10 font-display text-xl uppercase text-brand-violet print:text-black";
const p = "mt-3 font-body text-sm leading-relaxed text-brand-white/80 print:text-black";
const li = "mt-1.5 font-body text-sm leading-relaxed text-brand-white/80 print:text-black";

export function HelpContent() {
  return (
    <article className="max-w-3xl print:max-w-none print:text-black">
      <h1 className="font-display text-3xl uppercase text-brand-white print:text-black">
        Admin guide
      </h1>
      <p className={p}>
        Everything you need to manage donmickadelavega&apos;s site content. Changes go
        live within 5 minutes (the site refreshes its content cache automatically).
      </p>

      <h2 className={h2}>Getting started</h2>
      <p className={p}>
        Log in at <strong>/admin/login</strong> with your personal account. You can
        change your password anytime in <strong>Account</strong> (left sidebar). After
        changing it you&apos;ll be asked to log in again.
      </p>

      <h2 className={h2}>Albums &amp; photos</h2>
      <ul className="list-disc pl-5">
        <li className={li}>
          <strong>Categories</strong> group albums in the Portfolio page. Create them
          first (name in English and French).
        </li>
        <li className={li}>
          <strong>Albums</strong> need a title (EN/FR), a slug (the URL part, e.g.
          &quot;tour-2026&quot; — lowercase, hyphens, no spaces), a category and a cover
          image. Mark up to 3 as <strong>starred</strong> to feature them on the Home.
        </li>
        <li className={li}>
          <strong>Photos</strong> belong to one album. Upload one photo per record; the
          <strong> order</strong> field (a number) controls the position in the gallery
          — lower numbers first. Mark <strong>fave</strong> to feature a photo in the
          Home &quot;faves&quot; strip.
        </li>
        <li className={li}>
          Published toggle: unpublished records are hidden from the site but kept in
          the panel.
        </li>
      </ul>

      <h2 className={h2}>Reviews &amp; collabs</h2>
      <p className={p}>
        Reviews show on the Reviews page (author, text EN/FR, optional avatar).
        Collabs show logos and links on the Collabs page. Both support the published
        toggle and numeric ordering.
      </p>

      <h2 className={h2}>Site texts</h2>
      <p className={p}>
        The <strong>site_content</strong> collection holds the editable texts: the About
        page intro and body, and the Contact page intro — each in English and French.
        The rest of the site copy (Home sections, menus, form labels) is fixed: send
        corrections to Lautaro and he&apos;ll apply them.
      </p>

      <h2 className={h2}>Contact messages</h2>
      <p className={p}>
        Messages sent through the site&apos;s contact form land in
        <strong> contact_messages</strong> (read-only inbox). Check it periodically —
        email forwarding may also be configured, but the inbox is the source of truth.
      </p>

      <h2 className={h2}>Image guidelines</h2>
      <ul className="list-disc pl-5">
        <li className={li}>Max file size: <strong>15 MB</strong> per image.</li>
        <li className={li}>
          JPG is best for photos. The site generates optimized thumbnails
          automatically — upload your quality originals and don&apos;t worry about
          resizing.
        </li>
        <li className={li}>
          Always fill the <strong>alt</strong> text (EN/FR): it describes the photo for
          accessibility and search engines.
        </li>
      </ul>

      <p className={`${p} mt-10 border-t border-brand-light-gray pt-4 print:border-black`}>
        Questions or fixed-text corrections: contact Lautaro (LH Studio) —
        lhstudio.dev@gmail.com
      </p>
    </article>
  );
}
