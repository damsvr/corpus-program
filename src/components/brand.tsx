export function Brand({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <div>
      <div
        className={`grad-text font-extrabold tracking-tight ${size === "lg" ? "text-4xl" : "text-xl"}`}
      >
        CORPUS <span className="text-white">PROGRAM</span>
      </div>
      {size === "lg" && (
        <>
          <div className="grad-accent mt-3 h-[3px] w-12 rounded-full" />
          <p className="eyebrow mt-3">Train for life, compete for fun</p>
        </>
      )}
    </div>
  );
}
