import goldSymbol from "@/assets/frassy-gold.png.asset.json";

export function FrassyGold({
  className = "",
  float = false,
}: {
  className?: string;
  float?: boolean;
}) {
  return (
    <img
      src={goldSymbol.url}
      alt="Afro Designers — gold Frassy emblem"
      className={`${className} ${float ? "afro-float" : ""} select-none`}
      draggable={false}
    />
  );
}
