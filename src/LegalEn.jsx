// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
//
// Dil Türkçe değilken Legal.jsx bu içerikleri gösterir (native ve web).
// web=true iken metin borcama.com'u da kapsar: web satın alımları Paddle
// (Merchant of Record) üzerinden yapılır ve web'de Pro yalnız Türkiye'de
// satılır. web=false (iOS) çıktısı değişmez. Türkçe metinler Legal.jsx'te.
// Kimlik App Store satici kaydindan (Ozer Ocek, Istanbul); saklama sureleri
// ve 16 yas siniri 1.69.0 icin secildi, hukuk kontrolunde teyit edilmeli.
import React from "react";

const ILETISIM = "zero@borcama.com";

function Mail() {
  return <a href={`mailto:${ILETISIM}`}>{ILETISIM}</a>;
}

const PADDLE_ALICI_SARTLARI = "https://www.paddle.com/legal/invoiced-consumer-terms";
const PADDLE_IADE = "https://www.paddle.com/legal/refund-policy";

function Dis({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export const EN_BASLIKLAR = {
  terms: { title: "Terms of Use", tarih: "27 October 2026", surum: "1.0" },
  privacy: { title: "Privacy Policy", tarih: "27 October 2026", surum: "1.0" },
  refund: { title: "Cancellation and Refund Policy", tarih: "27 October 2026", surum: "1.0" },
};

// Web Terms, bölüm 7: Pro web'de Paddle üzerinden ve yalnız Türkiye'de satılır.
function WebProKosullari() {
  return (
    <>
      <h2>7. Borcama Pro subscriptions</h2>
      <ul>
        <li>
          Borcama Pro is an auto-renewing digital subscription offered on a
          monthly or yearly basis. The price and period shown on the purchase
          screen apply.
        </li>
        <li>
          <b>Where Pro is sold on the web:</b> on borcama.com, Borcama Pro is
          currently sold only to customers in Türkiye. Outside Türkiye the web
          app does not offer Pro for purchase. Any Pro features made available
          to you there are provided free of charge, without a subscription,
          and we may change or withdraw them at any time.
        </li>
        <li>
          <b>Web purchases are made through Paddle:</b> our order process on
          borcama.com is conducted by our online reseller Paddle.com. Paddle.com
          is the Merchant of Record for all our web orders and handles payment,
          billing, invoices, applicable sales taxes, and returns. Paddle's{" "}
          <Dis href={PADDLE_ALICI_SARTLARI}>Buyer Terms</Dis> apply to your
          purchase in addition to these Terms.
        </li>
        <li>
          A web subscription renews automatically at the end of each period
          and the renewal is charged to the payment method you used, unless
          you cancel before the renewal date. You can cancel at any time in
          Borcama under Settings → “Manage subscription”, or with the “Manage
          subscription” link in the receipt email Paddle sent you.
          Cancellation takes effect at the end of the current paid period and
          does not by itself refund past payments.
        </li>
        <li>
          <b>iOS purchases:</b> in the iOS app, Pro is sold by Apple through
          the App Store as an in-app purchase. Apple is the seller and handles
          payment, billing and subscription management; manage or cancel it in
          iOS Settings → Apple Account → Subscriptions.
        </li>
        <li>
          Refunds are described in our{" "}
          <a href="/refund-policy">Cancellation and Refund Policy</a>.
        </li>
      </ul>
    </>
  );
}

// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
export function TermsOfUseEn({ web = false }) {
  return (
    <>
      <p>
        These Terms of Use (“Terms”) govern your use of{" "}
        {web ? "the Borcama web app at borcama.com, the Borcama iOS app" : "the Borcama iOS app"}
        {" "}and the Borcama service. By creating an account or using the app, you
        agree to these Terms. The Borcama service is provided by Özer Öcek (sole proprietor), Istanbul, Türkiye (“Borcama”, “we”, “us”).
      </p>
      <h2>1. What Borcama is</h2>
      <p>
        Borcama is a personal finance tracking tool that helps you keep the
        credit card, loan, overdraft account, income, spending and payment
        information you enter yourself in one place.
      </p>
      <ul>
        <li>
          Borcama is not a bank, payment institution, lender or investment
          adviser, and nothing in the app is financial, investment, tax or
          legal advice.
        </li>
        <li>
          Interest, payment and planning results shown in the app are
          estimates. Your bank's official records and agreements always
          prevail.
        </li>
        <li>
          No payments, money transfers or loan applications are made through
          the app.
        </li>
        <li>
          Statement reading (importing a credit card statement) currently
          supports statements from Turkish banks only. Results may be
          incomplete or inaccurate; please review them before saving.
        </li>
      </ul>
      <h2>2. Your account and security</h2>
      <p>
        You are responsible for using a valid email address and for keeping
        your password and sign-in methods (including Sign in with Apple and
        device passcode or Face ID / Touch ID lock, where enabled) secure. If
        you notice any unauthorized activity on your account, contact us
        without delay at <Mail />.
      </p>
      <h2>3. Your data and its accuracy</h2>
      <p>
        You are responsible for the accuracy of the information you add.
        Incorrect or incomplete entries can affect calculations. Always check
        your bank statements, loan agreements and official payment records.
        You keep ownership of the financial data you enter. Our use of your
        data is described in the <a href="/privacy">Privacy Policy</a>.
      </p>
      <h2>4. Acceptable use</h2>
      <p>
        You may not use the service for unlawful purposes, try to bypass its
        security, access other users' data, send automated requests that could
        disrupt the system, or copy, reverse engineer or redistribute the app
        without permission.
      </p>
      <h2>5. Intellectual property</h2>
      <p>
        All rights in the Borcama brand, interface, software and original
        content are reserved. Subject to these Terms, you receive a personal,
        non-exclusive, non-transferable, revocable license to use the app on
        Apple devices you own or control, as permitted by the App Store Terms
        {web ? ", and to use the web app in your browser" : ""}.
      </p>
      <h2>6. Availability and liability</h2>
      <p>
        We make reasonable efforts to keep the service secure and available,
        but maintenance, technical failures or third-party infrastructure
        problems may cause temporary interruptions. To the extent permitted by
        law, Borcama is not liable for losses resulting from financial
        decisions made solely on the basis of estimates shown in the app.
        Nothing in these Terms limits liability that cannot be limited under
        applicable law.
      </p>
      {web ? <WebProKosullari /> : (
      <>
      <h2>7. Borcama Pro subscriptions on iOS</h2>
      <ul>
        <li>
          Borcama Pro is an auto-renewing digital subscription offered on a
          monthly or yearly basis. In the iOS app, Pro is sold by Apple through
          the App Store as an in-app purchase; Apple is the seller and handles
          payment, billing and subscription management.
        </li>
        <li>
          Payment is charged to your Apple Account at confirmation of
          purchase. The price and period shown on the purchase screen apply.
        </li>
        <li>
          Your subscription renews automatically unless it is cancelled at
          least 24 hours before the end of the current period. Your Apple
          Account is charged for renewal within 24 hours before the end of the
          current period.
        </li>
        <li>
          You can manage or cancel your subscription in iOS Settings → Apple
          Account → Subscriptions. Cancellation takes effect at the end of the
          current paid period and does not by itself refund past payments.
        </li>
        <li>
          Refunds for App Store purchases are handled by Apple. See our{" "}
          <a href="/refund-policy">Cancellation and Refund Policy</a>.
        </li>
      </ul>
      </>
      )}
      <h2>8. Apple's terms</h2>
      <p>
        If you downloaded the app from the App Store, Apple's{" "}
        <Dis href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
          Licensed Application End User License Agreement
        </Dis>{" "}
        and the{" "}
        <Dis href="https://www.apple.com/legal/internet-services/itunes/">
          Apple Media Services Terms and Conditions
        </Dis>{" "}
        apply in addition to these Terms. These Terms are between you and
        Borcama, not Apple. Apple is not responsible for the app or its
        content, has no obligation to provide maintenance or support for it,
        and is not responsible for handling any claims relating to it. Apple
        and its subsidiaries are third-party beneficiaries of these Terms and
        may enforce them against you.
      </p>
      <h2>9. Closing your account</h2>
      <p>
        You can permanently delete your account and its Borcama data at any
        time in the app under Settings → “Delete my account”, or by contacting
        support. {web ? (
          <>
            Deleting your account does not by itself cancel a subscription:
            cancel a web subscription in Settings → “Manage subscription” and
            an App Store subscription in your Apple Account settings before
            deleting your account.
          </>
        ) : (
          <>
            Deleting your account does not cancel an App Store
            subscription; cancel it in your Apple Account settings.
          </>
        )} We may
        temporarily suspend access or close an account in case of unlawful use
        or a security risk.
      </p>
      <h2>10. Changes and governing law</h2>
      <p>
        We will notify you of material changes in the app or by email before
        they take effect. These Terms are governed by the laws of the Republic
        of Türkiye. Mandatory consumer rights under the laws of your country
        of residence remain unaffected.
      </p>
      <div className="legal-callout">
        <p>
          Questions: <Mail />
        </p>
      </div>
    </>
  );
}

// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
export function PrivacyPolicyEn({ web = false }) {
  return (
    <>
      <p>
        This Privacy Policy explains how personal data is processed when you
        use {web ? "the Borcama web app (borcama.com) or the Borcama iOS app" : "the Borcama iOS app"}. It is written to meet the EU and UK General
        Data Protection Regulation (“GDPR”) and the Turkish Personal Data
        Protection Law No. 6698 (“KVKK”).
      </p>
      <h2>1. Data controller</h2>
      <p>
        The data controller is the Borcama service, operated by Özer Öcek (sole proprietor), Istanbul, Türkiye. Contact: <Mail />. For any data protection request, write to the same address.
      </p>
      <h2>2. Data we process</h2>
      <ul>
        <li>
          <b>Account data:</b> email address, account ID, sign-up and last
          sign-in times. If you use Sign in with Apple, we receive the email
          address (or Apple private relay address) and identifier Apple shares
          with us.
        </li>
        <li>
          <b>Financial records you enter:</b> bank and card names, debts,
          credit limits, statements, payments, income and spending. If you
          import a statement, the file is read to extract these records.
        </li>
        <li>
          <b>Subscription data:</b> whether you have Borcama Pro, the product,
          purchase and renewal status, and an anonymous purchase identifier
          provided via {web ? "Paddle (web purchases), Apple (iOS purchases) and RevenueCat" : "Apple and RevenueCat"}. We do not receive your card or
          payment details.
        </li>
        <li>
          <b>Technical and security data:</b> session, device and app version
          information and limited logs needed to prevent abuse.
        </li>
        {web && (
          <li>
            <b>Approximate country (web):</b> our host Vercel derives your
            country from your IP address. The web app uses only the two-letter
            country code to decide whether Borcama Pro is offered in your
            country and to choose a default currency for new accounts. The
            code is kept in your browser; we do not store it or your IP
            address on our servers for this purpose.
          </li>
        )}
        <li>
          <b>Support communications:</b> messages you send us.
        </li>
      </ul>
      <p>
        Borcama never asks for your online banking password, full card number,
        CVV, national ID number or biometric data. Face ID / Touch ID lock is
        handled by your device; we never receive biometric data. Please do not
        type such information into free-text fields.
      </p>
      {web ? (
        <>
          <h2>3. Optional measurement on the website; none in the iOS app</h2>
          <p>
            On the website, Google Analytics and Google Ads conversion
            measurement are loaded only if you consent in the measurement
            banner, to see in aggregate whether visits and ads lead to sign-ups
            or purchases. Your email address and the financial records you
            enter are never included. You can change this choice at any time
            in Settings. We do not sell or rent your personal data and do not
            show ads in Borcama.
          </p>
        </>
      ) : (
      <h2>3. No tracking or advertising in the iOS app</h2>
      )}
      <p>
        The iOS app does not load Google Analytics, Google Ads or any other
        advertising or cross-app tracking tools, does not track you across
        other companies' apps or websites, and does not show ads. We do not
        sell or rent your personal data, and we do not share it for
        cross-context behavioral advertising.
      </p>
      <h2>4. Purposes and legal bases (GDPR Art. 6)</h2>
      <ul>
        <li>
          <b>Creating your account, secure sign-in, and providing debt,
          payment, income and spending tracking, statement comparison,
          interest estimates and debt plans</b> — performance of a contract
          (Art. 6(1)(b)).
        </li>
        <li>
          <b>Providing and verifying Borcama Pro</b> — performance of a
          contract (Art. 6(1)(b)).
        </li>
        <li>
          <b>Security, abuse prevention, fixing errors and improving the
          service</b> — our legitimate interests (Art. 6(1)(f)), which we
          balance against your rights.
        </li>
        <li>
          <b>Answering support requests</b> — performance of a contract or
          legitimate interests (Art. 6(1)(b) or (f)).
        </li>
        <li>
          <b>Complying with legal obligations</b> (e.g. responding to lawful
          requests from authorities) — legal obligation (Art. 6(1)(c)).
        </li>
        <li>
          <b>Optional features or notifications that require it</b>
          {web ? <b>, and optional analytics and ad measurement on the website</b> : null} — your
          consent (Art. 6(1)(a)), which you can withdraw at any time without
          affecting processing before withdrawal.
        </li>
      </ul>
      <p>
        We do not make decisions based solely on automated processing that
        produce legal or similarly significant effects on you.
      </p>
      <h2>5. Service providers (processors)</h2>
      <p>
        We share data only as needed to run the service, under data processing
        agreements:
      </p>
      <ul>
        <li>
          <b>Supabase</b> — authentication and database.
        </li>
        <li>
          <b>Vercel</b> — hosting.
        </li>
        <li>
          <b>Cloudflare</b> — security checks.
        </li>
        <li>
          <b>Sentry</b> — technical error monitoring (see section 7).
        </li>
        <li>
          <b>Apple</b> — App Store purchases and Sign in with Apple.
        </li>
        {web && (
          <>
            <li>
              <b>Paddle</b> — payment processing for purchases on borcama.com;
              Paddle is the Merchant of Record and processes your payment
              details under its own privacy policy.
            </li>
            <li>
              <b>Google (Analytics and Ads)</b> — only on the website and only
              with your consent (see section 3).
            </li>
          </>
        )}
        <li>
          <b>RevenueCat</b> — managing and verifying in-app subscriptions.
        </li>
        <li>
          <b>Google (Gemini API)</b> — only if you use the in-app assistant:
          your question and a summary of the relevant records you entered are
          sent to generate an answer.
        </li>
        <li>
          <b>Resend</b> — sending account and service emails.
        </li>
      </ul>
      <p>
        We may also disclose data to competent public authorities where
        required by law.
      </p>
      <h2>6. International transfers</h2>
      <p>
        Some of these providers process data outside your country, including
        in the United States and the European Union. Where data is
        transferred outside the EEA, UK or Türkiye, we rely on appropriate
        safeguards such as adequacy decisions, the European Commission's
        Standard Contractual Clauses (and the UK Addendum), and, for Türkiye,
        the transfer mechanisms of KVKK Article 9. You can request a copy of
        the relevant safeguards by contacting us.
      </p>
      <h2>7. Error reports</h2>
      <p>
        Sentry error reports contain the app version, error type and code
        location. Statement and form contents, financial records, email
        addresses and the private contents of error messages are not sent.
        Screen recordings and click histories are not collected. The provider
        can technically see your IP address while connecting; the user IP
        field in reports is masked.
      </p>
      <h2>8. Retention</h2>
      <ul>
        <li>
          Account data and the financial records you enter are kept while your
          account is active and deleted when you delete your account.
        </li>
        <li>
          Security and legal records are kept only for the limited period
          needed for their purpose: security logs for up to 12 months, and records we must keep by law (such as tax records) for the period the law requires.
        </li>
        <li>
          Support messages are kept for up to 24 months after your request is resolved.
        </li>
      </ul>
      <p>
        When a retention period ends, data is deleted, destroyed or
        anonymized. Purchase records held by Apple
        {web ? " or Paddle are governed by their privacy policies" : " are governed by Apple's privacy policy"}.
      </p>
      <h2>9. Deleting your account</h2>
      <p>
        You can permanently delete your account and associated Borcama data at
        any time in the app under Settings → “Delete my account”, or by
        emailing <Mail />. {web ? (
          <>
            Deleting your account does not by itself cancel a subscription:
            cancel a web subscription in Settings → “Manage subscription” and an
            App Store subscription in iOS Settings → Apple Account →
            Subscriptions.
          </>
        ) : (
          <>
            Deleting your account does not cancel an App Store
            subscription; manage that in iOS Settings → Apple Account →
            Subscriptions.
          </>
        )}
      </p>
      <h2>10. Security</h2>
      <p>
        We use access controls, row-level authorization, encrypted (TLS)
        connections and abuse-prevention measures. No system is completely
        secure, but we work to protect your data and will notify you and
        authorities of a personal data breach where required by law.
      </p>
      <h2>11. Your rights</h2>
      <p>Under the GDPR (and KVKK Article 11), you have the right to:</p>
      <ul>
        <li>access your personal data and receive a copy,</li>
        <li>rectify inaccurate or incomplete data,</li>
        <li>erasure of your data,</li>
        <li>restriction of processing,</li>
        <li>data portability,</li>
        <li>
          object to processing based on legitimate interests,
        </li>
        <li>
          withdraw consent at any time, where processing is based on consent,
        </li>
        <li>
          lodge a complaint with a supervisory authority, in particular in
          the country where you live or work (in Türkiye, the Personal Data
          Protection Authority).
        </li>
      </ul>
      <p>
        Send requests to <Mail /> with information that lets us verify your
        identity. We respond within one month, which may be extended where the
        law allows.
      </p>
      <h2>12. Children</h2>
      <p>
        Borcama is not directed to children and is intended for adults
        managing their own finances. We do not knowingly collect personal data
        from children under 16. If you believe a child
        has given us data, contact us and we will delete it.
      </p>
      <h2>13. Changes</h2>
      <p>
        When this policy is updated, the new version and effective date are
        published on this page. If a change materially affects the purposes or
        legal bases of processing, we will also notify you in the app or by
        email.
      </p>
      <div className="legal-callout">
        <p>
          Privacy questions: <Mail />
        </p>
      </div>
    </>
  );
}

// Web iade politikası: web satın alımları Paddle, iOS satın alımları Apple.
function WebIadePolitikasi() {
  return (
    <>
      <p>
        This policy explains how cancellations and refunds work for Borcama
        Pro monthly and yearly subscriptions. Borcama Pro is a digital
        subscription. Purchases on borcama.com are processed by our online
        reseller Paddle.com, which is the Merchant of Record for all our web
        orders. Purchases in the iOS app are sold by Apple through the App
        Store. On the web, Borcama Pro is currently sold only to customers in
        Türkiye; outside Türkiye it is not offered for purchase on the web.
      </p>
      <h2>1. Renewal</h2>
      <p>
        Borcama Pro renews automatically at the end of the monthly or yearly
        period you chose. The renewal price and frequency are shown on the
        purchase screen. Unless you cancel, the renewal is charged to the
        payment method you used: through Paddle for web purchases, or to your
        Apple Account (within 24 hours before the period ends) for App Store
        purchases.
      </p>
      <h2>2. Cancellation</h2>
      <ul>
        <li>
          <b>Web purchases:</b> cancel at any time in Borcama under Settings →
          “Manage subscription”, or with the “Manage subscription” link in the
          receipt email Paddle sent you.
        </li>
        <li>
          <b>App Store purchases:</b> cancel in iOS Settings → Apple Account →
          Subscriptions at least 24 hours before the current period ends.
        </li>
      </ul>
      <p>
        Cancellation takes effect at the end of the current billing period:
        you are not charged again and keep Pro features until then.
        Cancelling does not automatically refund any amount already charged.
      </p>
      <h2>3. Refunds for web purchases (Paddle)</h2>
      <p>
        Under Paddle's buyer refund policy in force, consumers can withdraw
        from eligible digital purchases and request a full refund within 14
        days of the transaction. Wider rights under mandatory consumer law in
        your country take priority. To request a refund:
      </p>
      <ul>
        <li>
          use the “View receipt” or “Manage subscription” link in Paddle's
          purchase confirmation email, or
        </li>
        <li>
          request a refund through{" "}
          <Dis href="https://paddle.net">Paddle's buyer support (paddle.net)</Dis>, or
        </li>
        <li>
          contact us at <Mail /> with your purchase email and, if possible, the
          receipt number; we will help pass your request to Paddle.
        </li>
      </ul>
      <p>
        Refunds approved under Paddle's policy are processed within 14 days and
        sent, where possible, to the original payment method; the time it
        takes to appear depends on your bank or card issuer. Borcama Pro
        access may end once the refund is completed.
      </p>
      <h2>4. Refunds for App Store purchases (Apple)</h2>
      <p>
        Apple processes all App Store payments, so refunds for purchases made
        in the iOS app are decided by Apple under its own policies. Request
        one at{" "}
        <Dis href="https://reportaproblem.apple.com">
          reportaproblem.apple.com
        </Dis>{" "}
        or with the “Report a Problem” link in Apple's purchase receipt.
      </p>
      <h2>5. Technical problems and abuse</h2>
      <p>
        If a persistent technical problem prevents you from using the Pro
        features you paid for, please contact Borcama support first. If we
        cannot fix it, your refund request is assessed under applicable
        consumer law and Paddle's or Apple's policy. Requests involving fraud
        or abuse of refund rights may be refused or reviewed.
      </p>
      <h2>6. Your statutory rights</h2>
      <p>
        This policy does not limit any consumer rights that cannot be waived
        under the law of your country of residence. Where Paddle's{" "}
        <Dis href={PADDLE_IADE}>refund policy</Dis> or Apple's{" "}
        <Dis href="https://www.apple.com/legal/internet-services/itunes/">
          terms
        </Dis>{" "}
        in force at the time of the transaction, or mandatory law, provide
        greater protection, that protection applies.
      </p>
      <div className="legal-callout">
        <p>
          Help with cancellations or refunds: <Mail />
        </p>
      </div>
    </>
  );
}

// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
export function RefundPolicyEn({ web = false }) {
  if (web) return <WebIadePolitikasi />;
  return (
    <>
      <p>
        This policy explains how cancellations and refunds work for Borcama
        Pro monthly and yearly subscriptions purchased in the iOS app. Borcama
        Pro is a digital subscription. For purchases made in the iOS app,
        Apple is the seller through the App Store.
      </p>
      <h2>1. Renewal</h2>
      <p>
        Borcama Pro renews automatically at the end of the monthly or yearly
        period you chose. The renewal price and frequency are shown on the
        purchase screen. Unless you cancel, your Apple Account is charged for
        renewal within 24 hours before the end of the current period.
      </p>
      <h2>2. Cancellation</h2>
      <p>
        You can cancel in iOS Settings → Apple Account → Subscriptions, or via
        the “Manage subscription in the App Store” link in the app. To stop
        the next renewal, cancel at least 24 hours before the current period
        ends. Cancellation takes effect at the end of the current billing
        period: you are not charged again and keep Pro features until then.
      </p>
      <p>
        Cancelling a subscription does not automatically refund any amount
        already charged.
      </p>
      <h2>3. Refunds are handled by Apple</h2>
      <p>
        Because Apple processes all App Store payments, Borcama cannot issue
        refunds for App Store purchases. Refund requests are decided by Apple
        under its own policies. To request a refund:
      </p>
      <ul>
        <li>
          Go to{" "}
          <Dis href="https://reportaproblem.apple.com">
            reportaproblem.apple.com
          </Dis>
          , sign in with your Apple Account and choose the purchase.
        </li>
        <li>
          Or use the “Report a Problem” link in the purchase receipt Apple
          emailed you.
        </li>
        <li>
          If you need help, contact us at <Mail /> with your purchase email
          and, if possible, the receipt number. We can help you reach Apple's
          refund process and resolve access problems.
        </li>
      </ul>
      <p>
        When Apple approves a refund, it is sent to the original payment
        method under Apple's processes; the time it takes to appear depends on
        your bank or card issuer. Borcama Pro access may end once the refund
        is completed.
      </p>
      <h2>4. Technical problems</h2>
      <p>
        If a persistent technical problem prevents you from using the Pro
        features you paid for, please contact Borcama support first. If we
        cannot fix it, you can request a refund from Apple as described
        above.
      </p>
      <h2>5. Your statutory rights</h2>
      <p>
        This policy does not limit any consumer rights that cannot be waived
        under the law of your country of residence. Where Apple's terms in
        force at the time of the transaction or mandatory law provide greater
        protection, that protection applies. Apple's current terms are
        available{" "}
        <Dis href="https://www.apple.com/legal/internet-services/itunes/">
          here
        </Dis>
        .
      </p>
      <div className="legal-callout">
        <p>
          Help with cancellations or refunds: <Mail />
        </p>
      </div>
    </>
  );
}
