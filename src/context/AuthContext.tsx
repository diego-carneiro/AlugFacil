import {
  confirmSignUp,
  fetchUserAttributes,
  getCurrentUser,
  resendSignUpCode,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import outputs from "../../amplify_outputs.json";
import type { User, UserRole } from "../types/user";
import {
  clearPersistedSession,
  getPersistedSession,
  setPersistedSession,
  upsertPersistedUser,
} from "../lib/auth/persistence";
import { ensureUserProfile } from "../lib/api/users";

interface AuthContextValue {
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  authMode: "amplify";
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: {
    role: Exclude<UserRole, "admin">;
    name: string;
    email: string;
    phone: string;
    password: string;
    cro?: string;
    specialty?: string;
    cnpj?: string;
  }) => Promise<{
    requiresConfirmation: boolean;
    destination?: string;
    deliveryMedium?: string;
  }>;
  confirmRegistration: (input: {
    email: string;
    code: string;
  }) => Promise<void>;
  resendRegistrationCode: (input: {
    email: string;
  }) => Promise<{
    destination?: string;
    deliveryMedium?: string;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const hasAmplifyOutputs = Object.keys(outputs).length > 0;

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

function translateAuthError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const message = error.message;
    const name = (error as { name?: string }).name ?? "";

    if (name === "UsernameExistsException") {
      return "Já existe uma conta cadastrada com este e-mail.";
    }

    if (name === "UserNotConfirmedException") {
      return "Sua conta ainda não foi confirmada. Verifique seu e-mail para concluir o cadastro.";
    }

    if (name === "NotAuthorizedException") {
      return "E-mail ou senha inválidos.";
    }

    if (name === "UserNotFoundException") {
      return "Conta não encontrada para este e-mail.";
    }

    if (name === "CodeMismatchException") {
      return "Código de confirmação inválido.";
    }

    if (name === "ExpiredCodeException") {
      return "O código de confirmação expirou. Solicite um novo código.";
    }

    if (name === "LimitExceededException") {
      return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
    }

    if (name === "TooManyRequestsException") {
      return "Muitas requisições em sequência. Aguarde um pouco e tente novamente.";
    }

    if (name === "CodeDeliveryFailureException") {
      return "Não foi possível enviar o código de verificação agora. Tente novamente em instantes.";
    }

    if (name === "InvalidPasswordException") {
      return "Senha inválida. Use no mínimo 8 caracteres, com letra minúscula, número e símbolo.";
    }

    if (name === "InvalidParameterException") {
      const lower = message.toLowerCase();

      if (lower.includes("phone number")) {
        return "Telefone inválido. Use DDD + número (ex.: 12 99999-9999).";
      }

      if (lower.includes("password")) {
        return "Senha inválida. Use no mínimo 8 caracteres, com letra minúscula, número e símbolo.";
      }
    }

    const lower = message.toLowerCase();
    if (lower.includes("password did not conform with policy")) {
      return "Senha inválida. Use no mínimo 8 caracteres, com letra minúscula, número e símbolo.";
    }
    if (lower.includes("invalid phone number format")) {
      return "Telefone inválido. Use DDD + número (ex.: 12 99999-9999).";
    }

    return message || fallback;
  }

  return fallback;
}

function normalizePhoneNumber(input: string): string {
  const raw = input.trim();

  if (raw.startsWith("+")) {
    if (!/^\+\d{10,15}$/.test(raw)) {
      throw new Error("Telefone inválido. Use DDD + número (ex.: 12 99999-9999).");
    }
    return raw;
  }

  const digits = raw.replace(/\D/g, "");

  if (digits.length >= 12 && digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  throw new Error("Telefone inválido. Use DDD + número (ex.: 12 99999-9999).");
}

function mapRole(value?: string): UserRole {
  if (value === "OWNER") return "owner";
  if (value === "ADMIN") return "admin";
  return "tenant";
}

function toBoolean(value?: string): boolean {
  return value === "true" || value === "1";
}

async function getAmplifyUser(): Promise<User> {
  const authUser = await getCurrentUser();
  const attributes = await fetchUserAttributes();

  return {
    id: authUser.userId,
    name: attributes.name ?? authUser.username,
    email: attributes.email ?? authUser.username,
    role: mapRole(attributes["custom:role"]),
    phone: attributes.phone_number ?? "",
    cro: attributes["custom:cro"],
    specialty: attributes["custom:specialty"],
    verified: toBoolean(attributes["custom:verified"]),
    rating: 0,
    totalReviews: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(getPersistedSession());
  const [isAuthReady, setIsAuthReady] = useState(false);

  async function syncUserProfile(user: User): Promise<void> {
    if (!hasAmplifyOutputs) return;

    try {
      await ensureUserProfile(user);
    } catch (error) {
      console.error("Falha ao sincronizar perfil User no AppSync:", error);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!hasAmplifyOutputs) {
        setCurrentUser(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const user = await getAmplifyUser();
        if (!cancelled) {
          setCurrentUser(user);
          setPersistedSession(user);
          upsertPersistedUser(user, {
            provider: "cognito",
            cognitoSynced: true,
          });
          void syncUserProfile(user);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
          clearPersistedSession();
        }
      } finally {
        if (!cancelled) {
          setIsAuthReady(true);
        }
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    if (!hasAmplifyOutputs) {
      throw new Error("Backend AWS não está configurado para autenticação.");
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const result = await signIn({
        username: normalizedEmail,
        password,
      });

      if (result.nextStep.signInStep !== "DONE") {
        if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
          throw new Error("Sua conta ainda não foi confirmada. Verifique seu e-mail para concluir o cadastro.");
        }
        throw new Error("Não foi possível concluir o login neste momento.");
      }

      const user = await getAmplifyUser();
      await syncUserProfile(user);
      setCurrentUser(user);
      setPersistedSession(user);
      upsertPersistedUser(user, {
        provider: "cognito",
        cognitoSynced: true,
      });
      return user;
    } catch (error) {
      throw new Error(translateAuthError(error, "Não foi possível entrar."));
    }
  };

  const register: AuthContextValue["register"] = async (input) => {
    if (!hasAmplifyOutputs) {
      throw new Error("Backend AWS não está configurado para cadastro.");
    }

    try {
      const normalizedEmail = normalizeEmail(input.email);
      const role = input.role === "owner" ? "OWNER" : "TENANT";
      const normalizedPhone = normalizePhoneNumber(input.phone);

      const result = await signUp({
        username: normalizedEmail,
        password: input.password,
        options: {
          userAttributes: {
            email: normalizedEmail,
            name: input.name,
            phone_number: normalizedPhone,
            "custom:role": role,
            "custom:cro": input.cro ?? "",
            "custom:specialty": input.specialty ?? "",
            "custom:verified": "true",
          },
        },
      });

      upsertPersistedUser(
        {
          id: normalizedEmail,
          name: input.name,
          email: normalizedEmail,
          role: input.role,
          phone: normalizedPhone,
          cro: input.cro,
          specialty: input.specialty,
          verified: true,
          rating: 0,
          totalReviews: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        {
          password: input.password,
          provider: "cognito",
          cognitoSynced: false,
        }
      );

      return {
        requiresConfirmation: result.nextStep.signUpStep === "CONFIRM_SIGN_UP",
        destination: result.nextStep.signUpStep === "CONFIRM_SIGN_UP"
          ? result.nextStep.codeDeliveryDetails?.destination
          : undefined,
        deliveryMedium: result.nextStep.signUpStep === "CONFIRM_SIGN_UP"
          ? result.nextStep.codeDeliveryDetails?.deliveryMedium
          : undefined,
      };
    } catch (error) {
      throw new Error(translateAuthError(error, "Não foi possível concluir o cadastro."));
    }
  };

  const confirmRegistration: AuthContextValue["confirmRegistration"] = async ({
    email,
    code,
  }) => {
    if (!hasAmplifyOutputs) {
      throw new Error("Backend AWS não está configurado para confirmação de cadastro.");
    }

    try {
      await confirmSignUp({
        username: normalizeEmail(email),
        confirmationCode: code,
      });
    } catch (error) {
      throw new Error(translateAuthError(error, "Não foi possível confirmar o cadastro."));
    }
  };

  const resendRegistrationCode: AuthContextValue["resendRegistrationCode"] = async ({
    email,
  }) => {
    if (!hasAmplifyOutputs) {
      throw new Error("Backend AWS não está configurado para confirmação de cadastro.");
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      console.log("[Auth] Reenviando codigo de confirmacao", {
        email: normalizedEmail,
      });

      const result = await resendSignUpCode({
        username: normalizedEmail,
      });

      console.log("[Auth] Reenvio solicitado com sucesso", {
        email: normalizedEmail,
        destination: result.destination,
        deliveryMedium: result.deliveryMedium,
      });

      return {
        destination: result.destination,
        deliveryMedium: result.deliveryMedium,
      };
    } catch (error) {
      console.error("[Auth] Falha ao reenviar codigo de confirmacao", {
        email: normalizeEmail(email),
        error,
      });
      throw new Error(
        translateAuthError(error, "Não foi possível reenviar o código de confirmação.")
      );
    }
  };

  const logout = async () => {
    if (hasAmplifyOutputs) {
      await signOut();
    }
    setCurrentUser(null);
    clearPersistedSession();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: currentUser !== null,
        isAuthReady,
        authMode: "amplify",
        login,
        register,
        confirmRegistration,
        resendRegistrationCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
