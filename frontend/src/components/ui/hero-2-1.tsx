import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";


const Hero = () => {

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Gradient background with grain effect */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 ">
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-purple-600 to-sky-600"></div>
        <div className="h-[10rem] rounded-full w-[90rem] z-1 bg-gradient-to-b blur-[6rem] from-pink-900 to-yellow-400"></div>
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-yellow-600 to-sky-500"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-30"></div>

      {/* Content container */}
      <div className="relative z-10">
        



        {/* Badge */}
        <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-white">
            Get started now!
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
           Streamline Your Workflow: Efficient Task Management
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg xl:text-xl text-gray-300">
            Our task management system streamlines your workflow and boosts productivity. 
          </p>
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link to="/login" className="h-12 rounded-full bg-white px-8 text-base font-bold text-black hover:bg-white/90 flex items-center">
              <span>Sign In</span>
            </Link>
            <Link to="/signup" className="h-12 rounded-full border border-gray-600 px-8 text-base font-bold text-white hover:bg-white/10 flex items-center">
              <span>Sign Up</span>
            </Link>
          </div>

          <div className="relative mx-auto my-20 w-full max-w-6xl">
            <div className="absolute inset-0 rounded shadow-lg bg-white blur-[10rem] bg-grainy opacity-20" />

            <img
              src="/hero.png"
              alt="Hero Image"
              className="relative w-full h-auto shadow-md rounded-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export { Hero };
