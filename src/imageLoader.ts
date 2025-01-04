const imageLoader = ({
  src = "",
  width = 100,
  quality = 75,
}: {
  src?: string;
  width?: number;
  quality?: number;
}) => {
  const imgix = "https://imgix.cosmicjs.com/";
  const cosmicCdn = "https://cdn.cosmicjs.com/";
  let domainWithFile = src;
  if (src.includes(cosmicCdn)) {
    domainWithFile = domainWithFile.replace(cosmicCdn, imgix);
  }
  const url = `${domainWithFile}?w=${width}&q=${quality || 75}&fit=scale`;
  return url;
};

export default imageLoader;
