import { useMemo } from "react";

const FOOD_EMOJIS = [
  "🍕",
  "🍔",
  "🍟",
  "🌭",
  "🍿",
  "🍳",
  "🧇",
  "🥞",
  "🥪",
  "🌮",
  "🌯",
  "🥗",
  "🍲",
  "🍛",
  "🍣",
  "🥟",
  "🍝",
  "🍜",
  "🍞",
  "🧀",
];
const BG_COLORS = [
  "bg-brand-tomato",
  "bg-brand-sauce",
  "bg-brand-cheese",
  "bg-brand-basil",
  "bg-brand-crust",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-rose-600",
];

interface AvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ id, name, size = "md", className = "" }: AvatarProps) {
  const { emoji, bgColor } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const emojiIdx = Math.abs(hash) % FOOD_EMOJIS.length;
    const colorIdx = Math.abs(hash) % BG_COLORS.length;
    return {
      emoji: FOOD_EMOJIS[emojiIdx],
      bgColor: BG_COLORS[colorIdx],
    };
  }, [id]);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} ${className} flex shrink-0 items-center justify-center rounded-full border-2 border-brand-crust/50 shadow-inner`}
      title={name}
    >
      <span className="leading-none">{emoji}</span>
    </div>
  );
}
