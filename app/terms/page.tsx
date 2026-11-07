import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | Yakimel Empire LLC",
  description:
    "The terms that apply when you use yakimelempire.com or request services from Yakimel Empire LLC.",
};

const contact = SITE.email ? (
  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
) : (
  <Link href="/consultation">our contact form</Link>
);

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro={
        <p>
          These Terms apply when you use yakimelempire.com (the &quot;Site&quot;) or request
          services from {SITE.name} (&quot;we&quot;, &quot;us&quot;). By using the Site, you agree
          to these Terms.
        </p>
      }
      sections={[
        {
          heading: "Our services",
          body: (
            <p>
              We design and build websites, online stores, applications, software and AI tools, and
              offer consultation, maintenance and training. The specific scope, price, timeline and
              deliverables of any project are set out in a written quote or agreement between you
              and us. If that agreement differs from these Terms, the agreement applies.
            </p>
          ),
        },
        {
          heading: "Prices",
          body: (
            <>
              <p>
                Prices on the <Link href="/services">Services page</Link> are starting prices in US
                dollars. Your final price depends on your project and is confirmed in your quote.
              </p>
              <p>
                Domain names, hosting, premium themes, platform subscriptions (for example
                Shopify) and other third-party fees are billed separately unless your quote says
                otherwise.
              </p>
            </>
          ),
        },
        {
          heading: "Your content",
          body: (
            <p>
              You are responsible for the text, images, logos and other materials you give us, and
              you confirm you have the right to use them. You keep ownership of your content.
            </p>
          ),
        },
        {
          heading: "Ownership of the work",
          body: (
            <p>
              Ownership of the finished work and any licenses to code, designs or tools are
              defined in your project agreement. Third-party themes, plugins, fonts, photos and
              services remain subject to their own licenses.
            </p>
          ),
        },
        {
          heading: "Use of the Site",
          body: (
            <>
              <p>You agree not to misuse the Site, including by:</p>
              <ul>
                <li>sending spam or false information through our forms;</li>
                <li>trying to break, overload or gain unauthorized access to the Site;</li>
                <li>copying our content, designs or branding without permission.</li>
              </ul>
              <p>
                The Yakimel Empire name, logo and product names belong to {SITE.name} and may not
                be used without our written permission.
              </p>
            </>
          ),
        },
        {
          heading: "Information on the Site",
          body: (
            <p>
              We work to keep the Site accurate, but content is provided &quot;as is&quot; and may
              change. Products marked &quot;Coming soon&quot; are in development, and their
              features and availability may change. Concept designs shown on the Site are examples
              of our design work.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the extent permitted by law, {SITE.name} is not liable for indirect or
              consequential losses arising from your use of the Site. Our responsibility for
              client projects is set out in the project agreement.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: <p>These Terms are governed by the laws of the State of New York, USA.</p>,
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We may update these Terms from time to time; the date at the top shows the latest
              version. See our <Link href="/privacy">Privacy Policy</Link> for how we handle
              your information. Questions can be sent to {contact}.
            </p>
          ),
        },
      ]}
    />
  );
}
