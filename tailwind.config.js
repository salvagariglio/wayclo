/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,jsx}",
        "./src/components/**/*.{js,jsx}",
        "./src/components/ui/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: "#FAA896"
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem"
            }
        }
    },
    plugins: [require("tailwindcss-animate")]
};
