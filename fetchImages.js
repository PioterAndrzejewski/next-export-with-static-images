const path = require("path");
const fsp = require("fs/promises");
const download = require("download");
const walk = require("walk");
const { JSDOM } = require("jsdom");

let startPath = process.argv[2];

async function fetchImages() {
  let walker = walk.walk(startPath);
  walker.on("file", async (root, fileStats, next) => {
    if (fileStats.name.indexOf(".html") > 0) {
      const filePath = path.join(root, fileStats.name);
      const file = await fsp.readFile(filePath, { encoding: "utf-8" });
      await handlePage(file, filePath);
    }
    next();
  });
  walker.on("errors", console.log);
  walker.on("end", function () {
    console.log("all done");
  });
}

async function handlePage(data, filePath) {
  let dom = new JSDOM(data, { resources: "usable" });
  let srcs = dom.window.document.querySelectorAll("img[src]");
  let srcSets = dom.window.document.querySelectorAll("img[srcset]");

  function setUrls(src) {
    if (src && src !== "") {
      if (src.indexOf("http") === 0) {
        downloadSrc(src.split(" ")[0]);
      }
    }
  }

  srcs.forEach((e) => setUrls(e.getAttribute("src")));

  srcSets.forEach((srcSet) => {
    const imgSrcSet = srcSet.getAttribute("srcset");
    imgSrcSet.split(", ").forEach((src) => {
      setUrls(src.split(" ")[0]);
    });
  });

  await updateHtmlFiles(dom, filePath);
}


async function downloadSrc(src) {
  const newFilename = transformFilename(src);
  try {
    await fsp.stat(path.join(startPath, "/assets", newFilename));
    console.log("skipping asset named", newFilename, "already exists");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log("downloading to assets", newFilename);
    await download(src, path.join(startPath, "/assets"), {
      filename: newFilename,
    });
  }
}

async function updateHtmlFiles(dom, filePath) {
  let srcs = dom.window.document.querySelectorAll("img[src]");
  let srcSets = dom.window.document.querySelectorAll("img[srcset]");

  srcs.forEach((img) => {
    const src = img.getAttribute("src");
    const newFilename = transformFilename(src);
    img.setAttribute("src", `assets/${newFilename}`);
  });

  srcSets.forEach((img) => {
    const srcSet = img.getAttribute("srcset");
    const newSrcSet = srcSet
      .split(", ")
      .map((src) => {
        const [url, size] = src.split(" ");
        const newFilename = transformFilename(url);
        return `assets/${newFilename} ${size}`;
      })
      .join(", ");
      img.setAttribute("srcset", newSrcSet);
    });

    console.log(`Updating file: ${filePath}`);
  await fsp.writeFile(filePath, dom.serialize(), { encoding: "utf-8" });
}

function transformFilename(src) {
  const urlTrimmed = src.split("?")[0];
  const queryParams = src.split("?")[1];
  const filename = urlTrimmed.split("/").slice(-1)[0];
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension);
  return `${baseName}-${queryParams}${extension}`;
}

fetchImages();
