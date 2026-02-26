/**
 * Renders hidden img tags so browsers preload all sequence frames.
 */
export default function PreloadImages({ id, sources }) {
  return (
    <div id={id} className="pre-image-loader-data-mapping" style={{ display: 'none' }}>
      {sources.map((src, index) => (
        <img key={index} src={src} alt="" />
      ))}
    </div>
  );
}
