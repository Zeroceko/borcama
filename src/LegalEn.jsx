// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
//
// Yalnız native (iOS) uygulamada, dil İngilizce iken Legal.jsx bu
// içerikleri gösterir. Web ve Türkçe metinler Legal.jsx'te olduğu gibi kalır.
// Köşeli parantezli alanlar ([COMPANY ADDRESS] vb.) Türkçe metinde bulunmayan
// şirket bilgileridir; tahmin edilmedi, hukuk kontrolünde doldurulmalı.
import React from "react";

const ILETISIM = "zero@borcama.com";

function Mail() {
  return <a href={`mailto:${ILETISIM}`}>{ILETISIM}</a>;
}

function Dis({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export const EN_BASLIKLAR = {
  terms: { title: "Terms of Use", tarih: "[EFFECTIVE DATE]", surum: "1.0" },
  privacy: { title: "Privacy Policy", tarih: "[EFFECTIVE DATE]", surum: "1.0" },
  refund: { title: "Cancellation and Refund Policy", tarih: "[EFFECTIVE DATE]", surum: "1.0" },
};

// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
export function TermsOfUseEn() {
  return (
    <>
      <p>
        These Terms of Use (“Terms”) govern your use of the Borcama iOS app
        and the Borcama service. By creating an account or using the app, you
        agree to these Terms. The Borcama service is provided by [LEGAL ENTITY
        NAME], [COMPANY ADDRESS] (“Borcama”, “we”, “us”).
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
        Apple devices you own or control, as permitted by the App Store Terms.
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
        support. Deleting your account does not cancel an App Store
        subscription; cancel it in your Apple Account settings. We may
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
export function PrivacyPolicyEn() {
  return (
    <>
      <p>
        This Privacy Policy explains how personal data is processed when you
        use the Borcama iOS app. It is written to meet the EU and UK General
        Data Protection Regulation (“GDPR”) and the Turkish Personal Data
        Protection Law No. 6698 (“KVKK”).
      </p>
      <h2>1. Data controller</h2>
      <p>
        The data controller is the Borcama service, operated by [LEGAL ENTITY
        NAME], [COMPANY ADDRESS]. Contact: <Mail />. Data protection contact /
        EU representative, if required: [DPO / EU REPRESENTATIVE].
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
          provided via Apple and RevenueCat. We do not receive your card or
          payment details.
        </li>
        <li>
          <b>Technical and security data:</b> session, device and app version
          information and limited logs needed to prevent abuse.
        </li>
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
      <h2>3. No tracking or advertising in the iOS app</h2>
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
          <b>Optional features or notifications that require it</b> — your
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
          needed for their purpose or required by law: [RETENTION PERIODS].
        </li>
        <li>
          Support messages are kept as long as needed to resolve your request:
          [RETENTION PERIOD].
        </li>
      </ul>
      <p>
        When a retention period ends, data is deleted, destroyed or
        anonymized. Purchase records held by Apple are governed by Apple's
        privacy policy.
      </p>
      <h2>9. Deleting your account</h2>
      <p>
        You can permanently delete your account and associated Borcama data at
        any time in the app under Settings → “Delete my account”, or by
        emailing <Mail />. Deleting your account does not cancel an App Store
        subscription; manage that in iOS Settings → Apple Account →
        Subscriptions.
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
        from children under 16 [MINIMUM AGE — confirm]. If you believe a child
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

// TASLAK — hukuk kontrolü bekliyor (Legal review pending). Yayından önce avukat onayı gerekir.
export function RefundPolicyEn() {
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
