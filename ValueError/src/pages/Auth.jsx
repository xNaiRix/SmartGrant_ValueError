import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom"; // Tambah Link
import { useApp } from "../context/AppContext";
import { ArrowLeft } from "lucide-react"; 
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const { login, register } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "scientist",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      login(form.email, form.password, form.role);
    } else {
      register(form.email, form.name, form.password, form.role);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8">
        <Button variant="outline" className="flex items-center gap-2 px-6">
          <ArrowLeft size={18} /> 
          Back
        </Button>
      </Link>

      <Card className="w-full max-w-md relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-center font-serif">
          {mode === "login" ? "Welcome Back" : "Join SmartGrant"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Choose Role */}
          <div className="flex gap-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg transition font-medium ${
                form.role === "scientist"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setForm({ ...form, role: "scientist" })}
            >
              Scientist
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg transition font-medium ${
                form.role === "company"
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setForm({ ...form, role: "company" })}
            >
              Company
            </button>
          </div>

          {mode === "register" && (
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}

          <Input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <Button type="submit" variant="primary" className="mt-4 w-full">
            {mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-400">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <Link
            to={`/auth?mode=${mode === "login" ? "register" : "login"}`}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </Link>
        </div>
      </Card>
    </div>
  );
}
