module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        // "nativewind/babel",
      ],
    //   plugins: [
    //     [
    //       "module-resolver",
    //       {
    //         root: ["./"],
    //         alias: {
    //           "@": "./", // or wherever your "assets" folder is located relative to your project root
    //         },
    //       },
    //     ],
    //   ],
    };
  };