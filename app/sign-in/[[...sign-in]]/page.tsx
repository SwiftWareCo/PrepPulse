import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <main className="auth-gradient flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-[440px]">
                <SignIn />
            </div>
        </main>
    );
}
