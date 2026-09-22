export type AuctionStatus = "OPEN" | "CLOSING" | "SOLD" | "CLOSED";

export type Auction = {
  id: string;
  sellerClerkUserId: string;
  title: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  imageUrl: string | null;
  startPriceCents: number;
  minIncrementCents: number;
  currentPriceCents: number;
  leadingBidderClerkUserId: string | null;
  leadingBidId: string | null;
  status: AuctionStatus;
  endsAt: string;
  createdAt: string;
};

export type Bid = {
  id: string;
  auctionId: string;
  bidderClerkUserId: string;
  amountCents: number;
  status: string;
  createdAt: string;
};

export type Profile = {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  onboarded: boolean;
};

export type Wallet = {
  availableBalanceCents: number;
  heldBalanceCents: number;
  currency: string;
};

export type LedgerEntry = {
  id: string;
  entryType: string;
  amountCents: number;
  auctionId: string | null;
  bidId: string | null;
  createdAt: string;
};

export type Checkout = {
  paymentId: string;
  checkoutUrl: string;
  sessionId: string;
};

export type ApiError = {
  code?: string;
  message?: string;
};
