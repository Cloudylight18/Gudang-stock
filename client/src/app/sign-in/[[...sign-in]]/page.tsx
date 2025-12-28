import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-4">
        {/* Komponen SignIn bawaan Clerk yang sudah otomatis keren */}
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
              card: "shadow-xl border border-gray-200",
            },
          }}
        />
      </div>
    </div>
  );
}
