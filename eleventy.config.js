import fs from "fs";
import path from "path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import cssnano from "cssnano";

export default function (eleventyConfig) {
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("dist/**");
  eleventyConfig.ignores.add("test/**");

  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
  // The custom domain, dannycaruso.link, has to ship with every build.
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  const cssProcessor = postcss([
    tailwindcss(),
    ...(process.env.NODE_ENV === "production" ? [cssnano({ preset: "default" })] : []),
  ]);

  eleventyConfig.on("eleventy.before", async () => {
    const inputPath = path.resolve("./src/assets/css/main.css");
    const outputPath = "./dist/assets/css/main.css";
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const css = fs.readFileSync(inputPath, "utf8");
    const result = await cssProcessor.process(css, { from: inputPath, to: outputPath });
    fs.writeFileSync(outputPath, result.css);
  });

  eleventyConfig.addWatchTarget("./src/assets/css/");
  eleventyConfig.addWatchTarget("./src/assets/js/");

  return {
    pathPrefix: "/",
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
