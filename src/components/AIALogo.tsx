import aiaIcon from "@/assets/aia-icon.png.asset.json";

export function AIALogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <img
      src={aiaIcon.url}
      alt="AI Advantage"
      className={`${className} rounded-md object-contain`}
      draggable={false}
    />
  );
}
