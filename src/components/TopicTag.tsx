// Pastel pill for a question's topic. Each topic always gets the same tint.
const TINTS = ["bg-tint-blue", "bg-tint-lime", "bg-tint-peach", "bg-tint-pink", "bg-tint-cyan"];

function tintFor(topic: string) {
  let hash = 0;
  for (const ch of topic) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export default function TopicTag({ topic }: { topic: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-ink/80 ${tintFor(topic)}`}>
      {topic}
    </span>
  );
}
