import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <main className="auth-gradient flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-[440px]">
                <SignUp />
            </div>
        </main>
    );
}
