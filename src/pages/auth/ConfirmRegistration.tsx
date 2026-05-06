import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, RotateCw, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  clearPendingConfirmation,
  getPendingConfirmation,
  setPendingConfirmation,
} from "../../lib/auth/pendingConfirmation";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function toMediumLabel(value?: string): string {
  if (value === "SMS") return "SMS";
  if (value === "PHONE") return "telefone";
  return "e-mail";
}

export default function ConfirmRegistration() {
  const navigate = useNavigate();
  const { confirmRegistration, resendRegistrationCode } = useAuth();

  const [email, setEmail] = useState("");
  const [destination, setDestination] = useState<string | undefined>(undefined);
  const [deliveryMedium, setDeliveryMedium] = useState<string | undefined>(undefined);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasAutoResentRef = useRef(false);

  useEffect(() => {
    const pending = getPendingConfirmation();
    if (!pending?.email) {
      navigate("/entrar", { replace: true });
      return;
    }

    setEmail(pending.email);
    setDestination(pending.destination);
    setDeliveryMedium(pending.deliveryMedium);
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!email || destination || isResending || hasAutoResentRef.current) {
      return;
    }

    hasAutoResentRef.current = true;
    setInfo("Solicitando um novo codigo de verificacao...");
    setIsResending(true);

    void resendRegistrationCode({ email })
      .then((result) => {
        setDestination(result.destination);
        setDeliveryMedium(result.deliveryMedium);
        setPendingConfirmation({
          email,
          destination: result.destination,
          deliveryMedium: result.deliveryMedium,
        });
        setInfo(
          result.destination
            ? `Novo codigo enviado para ${result.destination} via ${toMediumLabel(result.deliveryMedium)}.`
            : "Novo codigo enviado com sucesso."
        );
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      })
      .catch((resendError: unknown) => {
        hasAutoResentRef.current = false;
        const message =
          resendError instanceof Error
            ? resendError.message
            : "Nao foi possivel reenviar o codigo automaticamente.";
        setError(message);
        setInfo("");
      })
      .finally(() => {
        setIsResending(false);
      });
  }, [destination, email, isResending, resendRegistrationCode]);

  useEffect(() => {
    if (!isConfirmed) return;
    const timer = window.setTimeout(() => {
      navigate("/entrar", { replace: true });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [isConfirmed, navigate]);

  const code = useMemo(() => digits.join(""), [digits]);
  const isCodeComplete = code.length === CODE_LENGTH;

  const handleDigitChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!cleaned) return;

    const next = Array(CODE_LENGTH).fill("").map((_, idx) => cleaned[idx] ?? "");
    setDigits(next);

    const focusIndex = Math.min(cleaned.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Não foi possível identificar o e-mail de confirmação. Faça o cadastro novamente.");
      return;
    }

    if (!isCodeComplete) {
      setError("Informe os 6 dígitos do código para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmRegistration({
        email,
        code,
      });
      clearPendingConfirmation();
      setIsConfirmed(true);
    } catch (confirmError) {
      const message =
        confirmError instanceof Error
          ? confirmError.message
          : "Não foi possível confirmar o cadastro.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending || resendCooldown > 0) return;
    setError("");
    setInfo("");
    setIsResending(true);

    try {
      const result = await resendRegistrationCode({ email });
      setDestination(result.destination);
      setDeliveryMedium(result.deliveryMedium);
      setPendingConfirmation({
        email,
        destination: result.destination,
        deliveryMedium: result.deliveryMedium,
      });
      setInfo(
        result.destination
          ? `Código reenviado para ${result.destination} via ${toMediumLabel(result.deliveryMedium)}.`
          : "Código reenviado com sucesso."
      );
      hasAutoResentRef.current = true;
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (resendError) {
      const message =
        resendError instanceof Error
          ? resendError.message
          : "Não foi possível reenviar o código.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,102,204,0.12)] text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 mb-2">
            Conta confirmada!
          </h1>
          <p className="text-sm text-neutral-500">
            Verificação concluída com sucesso. Redirecionando para o login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,102,204,0.12)]"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🦷</span>
          <span className="font-display font-bold text-xl text-primary-500">AlugFácil</span>
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-neutral-900">
              Confirmar cadastro
            </h1>
            <p className="text-sm text-neutral-500">Digite o código de 6 dígitos recebido.</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          <p className="font-medium text-neutral-700">{email}</p>
          {destination && (
            <p className="mt-1">
              Código enviado para {destination} via {toMediumLabel(deliveryMedium)}.
            </p>
          )}
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          <div
            className="grid grid-cols-6 gap-2"
            onPaste={(event) => {
              event.preventDefault();
              handlePaste(event.clipboardData.getData("text"));
            }}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleDigitChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event.key)}
                className="h-12 w-full rounded-xl border border-neutral-200 text-center text-lg font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                aria-label={`Dígito ${index + 1} do código`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isCodeComplete}
            className="w-full bg-primary-500 text-white rounded-xl py-3 font-display font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar código"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw size={14} className={isResending ? "animate-spin" : ""} />
            {resendCooldown > 0
              ? `Reenviar em ${resendCooldown}s`
              : (isResending ? "Reenviando..." : "Reenviar código")}
          </button>

          <Link to="/cadastro" className="text-sm text-neutral-500 hover:text-neutral-700">
            Alterar cadastro
          </Link>
        </div>

        {info && <p className="mt-4 text-sm text-green-600">{info}</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </motion.div>
    </div>
  );
}
