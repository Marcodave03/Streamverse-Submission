import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import GiftSelectionCard from "./GiftSelectionCard";
import ProfilePicture from "./ProfilePicture";

type User = {
  profile_picture: string;
  username: string;
};

type Streamer = {
  hederaAccountId: string;
  followerCount?: number;
};

type DonationPopoverProps = {
  user: User;
  balance: number;
  streamer: Streamer;
  topic_id: string;
  onDonate: (amount: string) => Promise<void>; // ✅ FIXED
  donationAmount: string;
  setDonationAmount: (val: string) => void;
  donateLoading: boolean;
  selectedGift: number | null;
  setSelectedGift: (val: number | null) => void;
  handleGiftChange: (amount: number) => void;
};


const DonationPopover = ({
  user,
  balance,
  streamer,
  onDonate,
  donationAmount,
  setDonationAmount,
  donateLoading,
  selectedGift,
  // setSelectedGift,
  handleGiftChange,
}: DonationPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="px-12 text-lg" variant={"outline"}>
          Gift
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[22rem] p-0">
        <div className="flex flex-col gap-4 h-96">
          <div className="flex gap-4 items-center px-6 pt-6">
            <ProfilePicture
              src={user.profile_picture}
              username={user.username}
              className="w-12 h-12"
            />
            <div className="flex flex-col">
              <p className="text-xl font-bold">{user.username}</p>
              <p className="font-semibold">
                {streamer?.followerCount || 0} Followers
              </p>
            </div>
          </div>

          <ScrollArea className="px-6 pb-6">
            <div className="flex flex-col">
              <p className="font-bold text-lg">Select gift</p>
              <p className="text-sm">Balance: {formatBalance(balance)} HBAR</p>
            </div>
            <div className="grid grid-cols-2 mt-2">
              {[10, 25, 50, 100, 200, 500].map((amount) => (
                <GiftSelectionCard
                  key={amount}
                  amount={amount}
                  isSelected={selectedGift === amount}
                  onSelect={() => handleGiftChange(amount)}
                />
              ))}
            </div>

            <div className="flex flex-col items-end gap-2 mt-4 px-2">
              <p className="font-bold w-full">Send custom amount</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onDonate(donationAmount);
                }}
                className="flex w-full flex-col gap-2 items-end"
              >
                <Input
                  placeholder="Enter HBar amount"
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="border border-input w-full"
                />
                <Button
                  disabled={donateLoading}
                  type="submit"
                  className="px-4 text-lg gap-4 max-w-40 text-md text-black border border-gray-600"
                >
                  Donate
                </Button>
              </form>
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

function formatBalance(balance: number): string {
  if (balance >= 1e9) return (balance / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (balance >= 1e6) return (balance / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (balance >= 1e3) return (balance / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return balance.toString();
}

export default DonationPopover;
