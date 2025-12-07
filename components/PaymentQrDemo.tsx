// components/PaymentQrDemo.tsx
"use client";

import { useMemo } from "react";

type PaymentMethod = "ALIPAY" | "WECHAT" | "MANUAL";

interface PaymentQrDemoProps {
  orderId: string;
  amountUsd: number;
  paymentMethod: PaymentMethod | null;
}

const METHOD_LABEL: Record<Exclude<PaymentMethod, "MANUAL">, string> = {
  ALIPAY: "Alipay",
  WECHAT: "WeChat Pay",
};

const METHOD_BADGE: Record<Exclude<PaymentMethod, "MANUAL">, string> = {
  ALIPAY: "Alipay",
  WECHAT: "WeChat",
};

export function PaymentQrDemo({
  orderId,
  amountUsd,
  paymentMethod,
}: PaymentQrDemoProps) {
  const effectiveMethod: PaymentMethod | null = paymentMethod ?? null;

  const payload = useMemo(() => {
    if (!effectiveMethod || effectiveMethod === "MANUAL") return "";
    return `DEMO_PAYMENT | method=${effectiveMethod} | orderId=${orderId} | amount=${amountUsd} USD`;
  }, [effectiveMethod, orderId, amountUsd]);

  const qrUrl =
    payload.length > 0
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
          payload
        )}`
      : "";

  const isQrMethod =
    effectiveMethod === "ALIPAY" || effectiveMethod === "WECHAT";

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 md:px-5 md:py-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Payment (demo)
          </p>
          {isQrMethod ? (
            <p className="mt-1 text-[11px] text-slate-600">
              QR below is a demo of{" "}
              <span className="font-semibold">
                {METHOD_LABEL[effectiveMethod!]}
              </span>{" "}
              payment for this order. This is only a demo, not a real payment.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-600">
              Payment method is set to{" "}
              <span className="font-semibold">Manual / Bank transfer</span>.
              You can handle instructions manually (no QR demo).
            </p>
          )}
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
          {effectiveMethod === "ALIPAY" && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              Alipay
            </span>
          )}
          {effectiveMethod === "WECHAT" && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              WeChat
            </span>
          )}
          {effectiveMethod === "MANUAL" && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              Manual
            </span>
          )}
          <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-[9px] uppercase text-red-500">
            Demo
          </span>
        </div>
      </div>

      {isQrMethod ? (
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="flex items-center justify-center rounded-2xl bg-white p-4">
            {qrUrl ? (
              <img src={qrUrl} alt="Demo payment QR" className="h-44 w-44" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center text-[11px] text-slate-400">
                No QR generated
              </div>
            )}
          </div>

          <div className="space-y-2 text-[11px] text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Method:</span>{" "}
              <span className="uppercase font-semibold text-slate-800">
                {METHOD_LABEL[effectiveMethod!]}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Amount:</span>{" "}
              {amountUsd} USD
            </p>
            <p>
              QR payload:
              <br />
              <span className="break-all font-mono text-[10px] text-slate-500">
                {payload}
              </span>
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Nanti kalau payment gateway (Alipay / WeChat Pay) sudah siap,
              cukup ganti isi QR ini dengan data QR asli dari gateway.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-[11px] text-slate-600">
          <p>
            This order uses{" "}
            <span className="font-semibold">manual payment</span>. You can show
            bank account / USDT address / other instructions here later.
          </p>
        </div>
      )}
    </div>
  );
}
