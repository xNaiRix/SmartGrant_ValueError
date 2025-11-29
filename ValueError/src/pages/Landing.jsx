import Button from "../components/Button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col justify-center text-center items-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <h1 className="text-5xl font-bold mb-6 leading-tight">
        Easy Funding <br />
        <span className="text-blue-500">No More Stress</span>
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mb-8">
        Application for scientists who need funds for their projects and
        companies that are looking for projects to fund
      </p>
      <div className="bg-gradient-to-r from-blue-400 to-violet-400 rounded-md mb-8 w-1/2 p-4">
        <p className="text-slate-700-400 max-w-2xl">
          Humans have unlimited ideas and creativity, but are often limited by
          financial problems. With this application, we hope to be able to grow
          the seeds of these ideas into reality by providing easier access to
          connect with wealth owners who have the same vision as them.
        </p>
      </div>
      <p>See More Content by Log/Sign in!</p>
    </div>
  );
}
