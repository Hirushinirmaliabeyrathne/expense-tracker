"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard"); 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Section - Image */}
      <section className="relative hidden md:block">
        <Image
          src="/image/login.jpg"
          alt="Login"
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Right Section - Login Form */}
      <section className="flex flex-col justify-center items-center px-8 md:px-20 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-[#001571] text-xl font-bold text-center mb-2">
            Welcome Back! Let&apos;s Get You Started.
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#001571]"
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-[#001571] underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#001571] text-white py-2 rounded-md hover:bg-blue-900 transition"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Logins */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 rounded-md mb-3 hover:bg-gray-100">
            <Image src="/image/Google.png" alt="Google" width={20} height={20} />
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-6">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-[#001571] underline">
              Register
            </a>
          </p>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:border-[#001571]"
            />
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowForgot(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-[#001571] text-white rounded-md">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
