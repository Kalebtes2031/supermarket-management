/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
          secondary: ['Inter_400Regular', 'Inter_700Bold'], // Add your custom font here
        },
      },
    },
    plugins: [],
  }