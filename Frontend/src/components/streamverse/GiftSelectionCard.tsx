import HbarLogo from "@/assets/hedera-hbar-logo.png";

type GiftSelectionCardProps = {
  amount: number;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
};

const GiftSelectionCard = ({
  amount,
  isSelected,
  onSelect,
  className = "",
}: GiftSelectionCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={
        "flex flex-col items-center gap-2 hover:bg-gray-200 py-4 transition-all duration-300 ease-out cursor-pointer " +
        (isSelected ? "bg-gray-200" : "") +
        " " +
        className
      }
    >
      <img src={HbarLogo} alt="HBar" className="w-12 h-12" />
      <p className="text-sm font-semibold">{amount} HBars</p>
    </div>
  );
};

export default GiftSelectionCard;
