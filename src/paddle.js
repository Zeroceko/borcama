import { initializePaddle } from "@paddle/paddle-js";

const token = String(import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "").trim();
const environment = String(import.meta.env.VITE_PADDLE_ENVIRONMENT || "").trim();
const validEnvironments = new Set(["production", "sandbox"]);
const configurationError = !token
  ? "VITE_PADDLE_CLIENT_TOKEN tanımlı değil."
  : !validEnvironments.has(environment)
    ? "VITE_PADDLE_ENVIRONMENT production veya sandbox olmalı."
    : "";

let paddlePromise = null;
let tamamlaninca = null;

function paddleSdk() {
  if (configurationError) throw new Error(configurationError);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token,
      ...(environment === "sandbox" ? { environment: "sandbox" } : {}),
      eventCallback(event) {
        if (event?.name === "checkout.completed" && tamamlaninca) {
          const callback = tamamlaninca;
          tamamlaninca = null;
          callback();
        }
        if (event?.name === "checkout.closed") tamamlaninca = null;
      },
    });
  }
  return paddlePromise;
}

export const paddleKartYonetimiHazir = !configurationError;

export async function paddleKartGuncellemeEkraniAc(transactionId, onCompleted) {
  if (!/^txn_[a-z\d]{26}$/.test(String(transactionId || "")))
    throw new Error("PADDLE_TRANSACTION_INVALID");
  const paddle = await paddleSdk();
  if (!paddle) throw new Error("PADDLE_SDK_NOT_READY");
  tamamlaninca = typeof onCompleted === "function" ? onCompleted : null;
  paddle.Checkout.open({
    transactionId,
    settings: {
      displayMode: "overlay",
      variant: "one-page",
      locale: "tr",
      theme: "light",
      allowLogout: false,
    },
  });
}
