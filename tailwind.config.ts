import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1F33",
        cloud: "#F2FAFC",
        line: "#D6EDF2",
        brand: "#00AFCA",
        lime: "#F6C445",
        cobalt: "#1BA9D2",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(11, 31, 51, 0.09)",
      },
    },
  },
  plugins: [],
};

export default config;
