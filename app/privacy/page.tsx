import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Yakimel Empire LLC",
  description:
    "How Yakimel Empire LLC collects, uses and protects the information you share through yakimelempire.com.",
};

const contact = SITE.email ? (
  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
) : (
  <Link href="/consultation">our contact form</Link>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <p>
          This Privacy Policy explains how {SITE.name} (&quot;we&quot;, &quot;us&quot;) handles
          information you share with us through yakimelempire.com (the &quot;Site&quot;). Our
          separate products, such as DigiMarket, may have their own privacy policies, which apply
          when you use those products.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>We only collect information you choose to send us:</p>
              <ul>
                <li>
                  <strong>Project requests:</strong> your name, business name, email, phone number,
                  project type, budget, timeline, project description and existing website.
                </li>
                <li>
                  <strong>Messages and chat:</strong> your name, email and message, including the
                  chat conversation if you ask the chat assistant to connect you with our team.
                </li>
              </ul>
              <p>
                Like most websites, our hosting provider may automatically record basic technical
                data such as your IP address, browser type and the pages you visit, for security
                and to keep the Site running.
              </p>
            </>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul>
              <li>To reply to your request and discuss your project.</li>
              <li>To send you a confirmation and reference number for your request.</li>
              <li>To prepare quotes, proposals and agreements you ask for.</li>
              <li>To keep the Site secure and prevent spam or abuse.</li>
            </ul>
          ),
        },
        {
          heading: "How we share it",
          body: (
            <>
              <p>We do not sell your personal information.</p>
              <p>
                We share it only with service providers that help us run the Site and respond to
                you, such as our website hosting and email providers, and only as needed for that
                purpose. We may also disclose information if required by law.
              </p>
            </>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              The Site does not use advertising or tracking cookies. If we add analytics or similar
              tools in the future, we will update this policy.
            </p>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              We keep project requests and messages for as long as needed to respond to you, carry
              out any work we agree on, and meet our legal and accounting obligations.
            </p>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <p>
              You can ask us to access, correct or delete the personal information you sent us by
              contacting {contact}. We will respond within a reasonable time.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              The Site uses HTTPS, and we take reasonable measures to protect the information you
              send us. No method of transmission or storage is completely secure, so we cannot
              guarantee absolute security.
            </p>
          ),
        },
        {
          heading: "Children",
          body: (
            <p>
              The Site is intended for businesses and adults. We do not knowingly collect
              information from children under 13.
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We may update this policy from time to time; the date at the top shows the latest
              version. Questions about this policy can be sent to {contact}.
            </p>
          ),
        },
      ]}
    />
  );
}
