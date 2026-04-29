import {
  confirmSignUp,
  fetchUserAttributes,
  getCurrentUser,
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
  validatePersistedCredentials,
} from "../lib/auth/persistence";
import { getUserByEmail, getUserByRole } from "../lib/api/users";

interface AuthContextValue {
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  authMode: "mock" | "amplify";
  login: (input: { email: string; password: string }) => Promise<User>;
  loginAsDemo: (role: UserRole) => Promise<User>;
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
  }>;
  confirmRegistration: (input: {
    email: string;
    code: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const hasAmplifyOutputs = Object.keys(outputs).length > 0;

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

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!hasAmplifyOutputs) {
        setCurrentUser(getPersistedSession());
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
      const persistedUser = validatePersistedCredentials(email, password);
      const user =
        persistedUser ??
        (await getUserByEmail(email)) ??
        (await getUserByRole("tenant"));
      setCurrentUser(user);
      setPersistedSession(user);
      return user;
    }

    const result = await signIn({
      username: email,
      password,
    });

    if (result.nextStep.signInStep !== "DONE") {
      throw new Error(`Fluxo de login pendente: ${result.nextStep.signInStep}`);
    }

    const user = await getAmplifyUser();
    setCurrentUser(user);
    setPersistedSession(user);
    upsertPersistedUser(user, {
      provider: "cognito",
      cognitoSynced: true,
    });
    return user;
  };

  const loginAsDemo = async (role: UserRole) => {
    const user = await getUserByRole(role);
    setCurrentUser(user);
    setPersistedSession(user);
    return user;
  };

  const register: AuthContextValue["register"] = async (input) => {
    if (!hasAmplifyOutputs) {
      const demoUser: User = {
        id: `local-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: input.role,
        phone: input.phone,
        cro: input.cro,
        specialty: input.specialty,
        verified: false,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      upsertPersistedUser(demoUser, {
        password: input.password,
        provider: "local",
        cognitoSynced: false,
      });
      setCurrentUser(demoUser);
      setPersistedSession(demoUser);

      return {
        requiresConfirmation: false,
      };
    }

    const role = input.role === "owner" ? "OWNER" : "TENANT";

    const result = await signUp({
      username: input.email,
      password: input.password,
      options: {
        userAttributes: {
          email: input.email,
          name: input.name,
          phone_number: input.phone,
          "custom:role": role,
          "custom:cro": input.cro ?? "",
          "custom:specialty": input.specialty ?? "",
          "custom:verified": "false",
        },
      },
    });

    upsertPersistedUser(
      {
        id: input.email,
        name: input.name,
        email: input.email,
        role: input.role,
        phone: input.phone,
        cro: input.cro,
        specialty: input.specialty,
        verified: false,
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
    };
  };

  const confirmRegistration: AuthContextValue["confirmRegistration"] = async ({
    email,
    code,
  }) => {
    if (!hasAmplifyOutputs) {
      return;
    }

    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    const user = await getAmplifyUser();
    setCurrentUser(user);
    setPersistedSession(user);
    upsertPersistedUser(user, {
      provider: "cognito",
      cognitoSynced: true,
    });
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
        authMode: hasAmplifyOutputs ? "amplify" : "mock",
        login,
        loginAsDemo,
        register,
        confirmRegistration,
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
