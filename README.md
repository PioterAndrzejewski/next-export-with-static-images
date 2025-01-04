📸 Next.js Static Image Optimizer

🚀 Why?

Next.js still does not natively support downloading external images and including them in the build output when generating static websites. Workarounds are required, and existing packages like next-image-export-optimizer often require predefining image lists before the build process. This approach becomes impractical when dynamically generating pages from external CMS sources like Cosmic.js.

🛠️ What Does It Do?

This script scans all generated HTML files, detects external image references, downloads them, and replaces the src and srcset attributes with local static assets.

📚 How to Use?

This repository provides the essential changes required to integrate this optimization into your codebase.

📄 1. imageLoader.ts

Create your own image loader that generates links to optimized images. If you're using Cosmic.js with imgix, your loader might look something like this:

const imageLoader = ({ src, width, quality }) => {
  return `https://imgix.cosmicjs.com${src}?w=${width}&q=${quality || 75}&fit=scale`;
};

export default imageLoader;

📄 2. fetchImages.js

Include the provided fetchImages.js script in your project. This script will handle scanning and downloading images from the build output.

📦 3. package.json

Add the required dependencies and an npm script to run the fetch script:

"scripts": {
  "build-and-download": "next build && node fetchImages.js ./out"
}

Install the required packages:

npm install download jsdom walk

⚙️ 4. next.config.ts

Update your Next.js configuration to utilize your custom imageLoader:

module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './imageLoader.ts'
  }
};

🌟 Usage Example with Cosmic.js

In your Next.js components, use next/image as follows:

import Image from 'next/image';

<Image
  src={cosmicImage.url}
  width={800}
  height={600}
  alt="Example Image"
/>

🔄 Before Optimization (After next build)

Generated HTML:

<img
  srcset="https://imgix.cosmicjs.com/my-image.jpg?w=640&q=75&fit=scale 640w, ..."
  src="https://imgix.cosmicjs.com/my-image.jpg?w=3840&q=75&fit=scale"
/>

✅ After Optimization

After running the fetchImages.js script, images will be downloaded into the assets/ directory, and HTML will be updated:

<img
  srcset="assets/my-image-w=640&q=75&fit=scale.jpg 640w, ..."
  src="assets/my-image-w=3840&q=75&fit=scale.jpg"
/>

📥 Downloaded Files Example

assets/
├── my-image-w=640&q=75&fit=scale.jpg
├── my-image-w=750&q=75&fit=scale.jpg
├── my-image-w=828&q=75&fit=scale.jpg
└── ...

🎯 Conclusion

This setup allows you to optimize external images during the Next.js build process without needing to predefine every image source. Perfect for dynamic content sourced from external CMS platforms.

Happy building! 🚀

