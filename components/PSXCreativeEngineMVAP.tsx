"use client";

import React, { useEffect, useMemo, useState } from "react";
import VideoFrame from "./VideoFrame";
import VideoGrid from './VideoGrid';
import VideoPlayer from './VideoPlayer';
import { ClothingLineDesigner } from './ClothingLineDesigner';
import Image from 'next/image'; // Import the Image component from Next.js

/**
 * PSX Creative Engine — MVAP (Blacksite Edition)
 * -----------------------------------------------------
 * Tabs:
 *  - About (Hero, Services, Selected Work)
 *  - Creative Engine (Configurator with package recommender & estimator)
 *  - Bootstrap Store (a-la-carte ops)
 *  - Merch Shop (catalog -> per-item customizer -> add to cart -> checkout stub)
 *  - Dashboard (Client Portal)
 *  - Integrations (Airtable, Email Webhook, Stripe public key)
 *
 * TailwindCSS expected in host app. All network calls are optional and guarded.
 * If you want true 3D curvature (actual hat geometry), I can ship a variant
 * using three + react-three-fiber + @react-three/drei with GLTF mockups—just
 * say the word and I'll give you a lightweight implementation with lazy-loaded
 * bundles so the rest of the app stays snappy.
 */

// ---------------------------------------------
// Constants
// ---------------------------------------------
const CHAINS = ["Base", "Solana", "Ethereum", "Other"] as const;
const TIMELINES = ["2-4 weeks", "1-2 months", "3+ months"] as const;
// Add these type definitions near your other types
type ChainName = keyof typeof CHAIN_FACTORS;
type StyleName = keyof typeof STYLE_MULTIPLIERS;
interface BreakdownItem {
  label: string;
  value: string | number;
  subtotal?: number;
}

// Channels
const CHANNELS = [
  { id: "twitter", label: "Twitter / X" },
  { id: "tiktok", label: "TikTok" },
  { id: "telegram", label: "Telegram" },
  { id: "discord", label: "Discord" },
  { id: "instagram", label: "Instagram / Reels" },
  { id: "website", label: "Website / Landing" },
];

// Content types
const CONTENT_TYPES = [
  { 
    id: "launchFilm", 
    label: "Launch Trailer (cinematic)",
    basePrice: 2000,
    complexity: 3,
    minTimeWeeks: 3,
    channelMultipliers: {
      website: 1.3, twitter: 0.9, tiktok: 1.2, instagram: 1.1, telegram: 0.8, discord: 0.8
    }
  },
  { 
    id: "memes", 
    label: "Meme Assets",
    basePrice: 500,
    complexity: 1,
    minTimeWeeks: 1,
    batchSize: 10,
    batchDiscount: 0.9,
    channelMultipliers: {
      twitter: 1.2, tiktok: 1.1, instagram: 1.0, telegram: 0.9, discord: 0.9
    }
  },
  { 
    id: "stickers", 
    label: "Stickers / GIFs",
    basePrice: 300,
    complexity: 1,
    minTimeWeeks: 1,
    channelMultipliers: {
      telegram: 1.3, discord: 1.2, twitter: 0.8, instagram: 0.9
    }
  },
  { 
    id: "shorts", 
    label: "Shortform Verticals (TikTok/Reels)",
    basePrice: 800,
    complexity: 2,
    minTimeWeeks: 2,
    channelMultipliers: {
      tiktok: 1.3, instagram: 1.2, youtube: 1.1
    }
  },
  { 
    id: "webAssets", 
    label: "Website Assets (hero, banners)",
    basePrice: 800,
    complexity: 2,
    minTimeWeeks: 2,
    channelMultipliers: {
      website: 1.5
    }
  },
  { 
    id: "nftSeed", 
    label: "NFT/PFP Collection (100+ assets)",
    basePrice: 3000,
    complexity: 4,
    minTimeWeeks: 4,
    chainBonus: {
      ethereum: 2000,
      solana: 1500,
      base: 1000,
      other: 500
    }
  },
  { 
    id: "merchArt", 
    label: "Merch Art (design only)",
    basePrice: 400,
    complexity: 1,
    minTimeWeeks: 1
  },
  { 
    id: "brandKit", 
    label: "Brand Kit (logo, colors, fonts)",
    basePrice: 1200,
    complexity: 2,
    minTimeWeeks: 2
  },
  { 
    id: "motionGraphics", 
    label: "Motion Graphics Package",
    basePrice: 1500,
    complexity: 3,
    minTimeWeeks: 3,
    channelMultipliers: {
      website: 1.2, instagram: 1.1, tiktok: 1.1
    }
  },
];

// Style options
const STYLE_OPTIONS = [
  { id: "schizo", label: "Schizo / meme-native" },
  { id: "cinematic", label: "Cinematic / 3D" },
  { id: "minimal", label: "Minimal / clean" },
  { id: "dark", label: "Dark / edgy" },
  { id: "whimsical", label: "Whimsical / absurd" },
  { id: "cartoonish", label: "Cartoonish / playful" },
  { id: "animalMemes", label: "Animal Memes / funny" },
];

// Bootstrap SKUs (curated)
const DEVOPS = [
  { id: "zealy", title: "Zealy Quest System Setup", price: 1500, desc: "Quest tree, tiers, reward logic, bot integration, graphics kit" },
  { id: "discord", title: "Discord HQ Build", price: 1200, desc: "Roles, channels, guardrails, onboarding flows" },
  { id: "airdrop", title: "Coming Soon", price: 2000, desc: "TBD" },
  { id: "sticker", title: "Sticker Pack (+10)", price: 500, desc: "Customized sticker set" },
  { id: "callkit", title: "KOL INTRO", price: 800, desc: "Copy blocks, hooks, do/don'ts, asset pack" },
  { id: "site", title: "Launch Site", price: 2200, desc: "Hero, sections, token/NFT cards, countdown" },
  { id: "notion", title: "Advisory", price: 700, desc: "Lead → Proposal → Active → Case Study pipeline" },
  { id: "anim", title: "3D Animation", price: 800, desc: "SVG/Lottie loops, hover states" },
  { id: "brand", title: "Brand Package", price: 1800, desc: "Complete brand kit: logo suite, color palette, typography, social templates, brand guidelines, content calendar, bio optimization" },
  { id: "social", title: "Social Media Management", price: 2500, desc: "30-day content calendar, post templates, story highlights, bio optimization, engagement strategy" },
  { id: "audit", title: "Brand Audit & Strategy", price: 1200, desc: "Competitive analysis, brand positioning, messaging framework, growth recommendations" },
  { id: "influencer", title: "Influencer Kit", price: 900, desc: "Media kit, rate card, collaboration templates, brand deck, pitch materials" },
];

// Merch options
const MERCH_ITEMS = [
  { id: "hat", title: "PSX Hat", baseCost: 10, image: "/merch/hat.png", thumbnail: "/merch/hat.png" },
  { id: "tee", title: "PSX T-Shirt", baseCost: 20, image: "/merch/tee.png", thumbnail: "/merch/tee.png" },
  { id: "hoodie", title: "PSX Hoodie", baseCost: 45, image: "/merch/hoodie.png", thumbnail: "/merch/hoodie.png" },
  { id: "sticker", title: "PSX Sticker", baseCost: 2, image: "/merch/sticker.png", thumbnail: "/merch/sticker.png" },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

type Task = { id: string; title: string; status: "todo" | "doing" | "review" | "done"; assignee?: string; due?: string };
type Asset = { id: string; title: string; kind: "video" | "image" | "sticker" | "doc"; status: "wip" | "review" | "approved"; notes?: string; url?: string; createdAt: string };
type Invoice = { id: string; title: string; amount: number; status: "due" | "paid" | "past_due"; issuedAt: string; dueAt: string };

// ---------------------------------------------
// Utilities
// ---------------------------------------------
function cx(...xs: (string | false | null | undefined)[]) { return xs.filter(Boolean).join(" "); }
function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return <span className={cx("inline-flex items-center rounded-full px-3 py-1 text-sm/5", active ? "bg-white text-black" : "bg-zinc-800 text-zinc-200")}>{children}</span>;
}
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

// Add this near your other components
function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsOpen(true)} 
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b border-dashed border-gray-400"
      >
        {children}
      </div>
      {isOpen && (
        <div className="absolute z-10 w-72 p-3 mt-1 text-sm text-left text-gray-200 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
}

function PriceDisplay({ price, breakdown }: { price: string; breakdown: BreakdownItem[] }) {
  const total = breakdown.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  return (
    <Tooltip 
      content={
        <div className="space-y-2">
          <div className="font-medium text-white">Pricing Breakdown:</div>
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-300">{item.label}:</span>
              <div className="text-right">
                {item.value && <div className="text-gray-400">{item.value}</div>}
                {item.subtotal !== undefined && (
                  <div className="text-white">+${item.subtotal.toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-700 font-medium">
            <div className="flex justify-between">
              <span className="text-white">Total:</span>
              <span className="text-white">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      }
    >
      <span className="hover:text-blue-400 transition-colors">{price}</span>
    </Tooltip>
  );
};

// ---------------------------------------------
// Component
// ---------------------------------------------

// Chain-specific multipliers for pricing
const CHAIN_FACTORS = {
  ethereum: 1.5,
  solana: 1.3,
  polygon: 1.2,
  arbitrum: 1.2,
  optimism: 1.2,
  base: 1.2,
  avalanche: 1.1,
  bsc: 1.1,
  // Add more chains as needed with their respective multipliers
} as const;

// Style multipliers with new tone options
const STYLE_MULTIPLIERS = {
  cinematic: 1.5,
  schizo: 1.2,
  minimal: 1.0,
  dark: 1.1,
  whimsical: 1.3,
  cartoonish: 1.4,  // New style
  animalMemes: 1.25  // New style
} as const;

const calculateContentPricing = (contentId: string, channels: string[], styles: string[], chain: string) => {
  const content = CONTENT_TYPES.find(c => c.id === contentId);
  if (!content) return 0;

  let price = content.basePrice;

  // Apply channel multipliers
  if (content.channelMultipliers) {
    const channelMultiplier = channels.reduce((max, channel) => {
      return Math.max(max, content.channelMultipliers?.[channel] || 1.0);
    }, 1.0);
    price *= channelMultiplier;
  }

  // Apply style multipliers with type safety
  const styleMultiplier = styles.reduce((max, style) => {
    const styleKey = style as StyleName;
    return Math.max(max, STYLE_MULTIPLIERS[styleKey] ?? 1.0);
  }, 1.0);
  price *= styleMultiplier;

  // Apply chain factor with type safety
  const chainKey = chain.toLowerCase() as ChainName;
  const chainFactor = chainKey in CHAIN_FACTORS ? CHAIN_FACTORS[chainKey] : 1.0;
  price *= chainFactor;

  // Apply chain bonus for specific content types
  if (content.chainBonus && chain) {
    const bonus = content.chainBonus[chain.toLowerCase() as keyof typeof content.chainBonus] ?? 0;
    price += bonus;
  }

  return Math.round(price);
};

function getPricingBreakdown(contentId: string, channels: string[], styles: string[], chain: string): BreakdownItem[] {
  const content = CONTENT_TYPES.find(c => c.id === contentId);
  if (!content) return [];

  const breakdown: BreakdownItem[] = [
    { 
      label: 'Base Price', 
      value: content.basePrice,
      subtotal: content.basePrice 
    },
  ];

  // Add channel multipliers
  if (content.channelMultipliers) {
    channels.forEach(channel => {
      const multiplier = content.channelMultipliers?.[channel];
      if (multiplier) {
        breakdown.push({
          label: `${channel} multiplier`,
          value: `×${multiplier}`,
          subtotal: content.basePrice * (multiplier - 1)
        });
      }
    });
  }

  // Add style multipliers
  styles.forEach(style => {
    const styleKey = style as StyleName;
    const multiplier = STYLE_MULTIPLIERS[styleKey];
    if (multiplier && multiplier > 1) {
      breakdown.push({
        label: `${style} style`,
        value: `×${multiplier}`,
        subtotal: content.basePrice * (multiplier - 1)
      });
    }
  });

  // Add chain factor
  const chainKey = chain.toLowerCase() as keyof typeof CHAIN_FACTORS;
  const chainFactor = CHAIN_FACTORS[chainKey] || 1.0;
  if (chainFactor > 1) {
    breakdown.push({
      label: `${chain} chain factor`,
      value: `×${chainFactor}`,
      subtotal: content.basePrice * (chainFactor - 1)
    });
  }

  // Add chain bonus if applicable
  if (content.chainBonus && chain) {
    const bonus = content.chainBonus[chain.toLowerCase() as keyof typeof content.chainBonus] || 0;
    if (bonus > 0) {
      breakdown.push({
        label: `${chain} bonus`,
        value: `+${bonus}`,
        subtotal: bonus
      });
    }
  }

  return breakdown;
}

export default function PSXCreativeEngineMVAP() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<"home" | "config" | "devops" | "merch">("home");

  // Configurator state
  const [projectName, setProjectName] = useState("");
  const [chain, setChain] = useState<(typeof CHAINS)[number] | "">("");
  const [timeline, setTimeline] = useState<string>("");
  const [vision, setVision] = useState("");
  const [budget, setBudget] = useState<number>(5000);
  const [channels, setChannels] = useState<string[]>([]);
  const [content, setContent] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTelegram, setContactTelegram] = useState("");

  // Bootstrap Store
  const [cart, setCart] = useState<string[]>([]);

  // Merch shop (shared cart)
  const [merchDesigns, setMerchDesigns] = useState(3);
  const [merchItems, setMerchItems] = useState<string[]>(["tee", "hoodie"]);
  const [merchMethod, setMerchMethod] = useState<"POD" | "Bulk">("POD");
  const [merchPlatform, setMerchPlatform] = useState<"Shopify" | "Whop" | "Gumroad">("Shopify");
  const [merchQty, setMerchQty] = useState(100);
  const [merchMargin, setMerchMargin] = useState(0.5);
  const [shopCart, setShopCart] = useState<{ id: string; title: string; size: string; price: number; qty: number }[]>([]);

  // Dashboard (client portal)
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "Kickoff & brand intake", status: "doing", assignee: "PSX Producer", due: "" },
    { id: "t2", title: "Launch trailer storyboard", status: "review", assignee: "3D Lead", due: "" },
    { id: "t3", title: "Sticker pack set (x12)", status: "todo", assignee: "Design", due: "" },
    { id: "t4", title: "Website hero visuals", status: "todo", assignee: "Design", due: "" },
  ]);
  const [assets, setAssets] = useState<Asset[]>([
    { id: "a1", title: "Logo v1 Explorations", kind: "image", status: "review", createdAt: new Date().toISOString(), notes: "Choose A/B/C" },
    { id: "a2", title: "Storyboard v0.2 (trailer)", kind: "doc", status: "review", createdAt: new Date().toISOString() },
    { id: "a3", title: "Sticker sketches", kind: "image", status: "wip", createdAt: new Date().toISOString() },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "inv-001", title: "Deposit — Studio Package", amount: 5000, status: "paid", issuedAt: new Date().toISOString(), dueAt: new Date(Date.now()+7*864e5).toISOString() },
    { id: "inv-002", title: "Add-on — Zealy Setup", amount: 1500, status: "due", issuedAt: new Date().toISOString(), dueAt: new Date(Date.now()+10*864e5).toISOString() },
  ]);
  const [approvals, setApprovals] = useState<{ id: string; title: string; status: "pending" | "approved" | "changes"; note?: string }[]>([
    { id: "ap1", title: "Logo v1 chosen", status: "pending" },
    { id: "ap2", title: "Trailer storyboard v0.2", status: "pending" },
  ]);
  const [team, setTeam] = useState<{ id: string; name: string; role: string; email?: string }[]>([
    { id: "u1", name: "Stuff (Rigo)", role: "Creative Director" },
    { id: "u2", name: "Spike (JB)", role: "Ops / Project Lead" },
    { id: "u3", name: "Jay (Dimo)", role: "Producer / POC" },
  ]);
  const [accounts, setAccounts] = useState<{ id: string; platform: string; handle: string; connected: boolean }[]>([
    { id: "acc1", platform: "Twitter", handle: "@project", connected: false },
    { id: "acc2", platform: "Telegram", handle: "t.me/project", connected: false },
    { id: "acc3", platform: "Discord", handle: "discord.gg/project", connected: false },
  ]);
  const [messages, setMessages] = useState<{ id: string; from: string; text: string; at: string }[]>([
    { id: "m1", from: "PSX Producer", text: "Welcome! We'll post daily updates and assets here.", at: new Date().toISOString() }
  ]);
  const [newMsg, setNewMsg] = useState("");

  async function handleMerchCheckout(setView: (view: "catalog" | "customize") => void) {
    try {
      const projectName = prompt("Enter your project name:");
      if (!projectName) return alert("Project name is required.");

      const socials = prompt("Enter your socials (e.g., Twitter, Discord):");
      if (!socials) return alert("Socials are required.");

      // Show loading state
      const submitBtn = document.querySelector('button:contains("Send Cart via Email")') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      // Get cart items with proper type
      const cartItems = Array.isArray(shopCart) ? shopCart : [];
      
      // Prepare the request body with proper types
      interface CartItem {
        id: string;
        title: string;
        price: number;
        quantity?: number;
      }
      
      const requestBody = {
        type: 'merch-store-order' as const,
        project: { name: projectName },
        contact: { socials },
        cart: cartItems.map((item: CartItem) => ({
          id: item.id,
          title: item.title,
          price: item.price || 0,
          quantity: item.quantity || 1
        })),
        total: cartItems.reduce((sum: number, item: CartItem) => {
          const price = typeof item.price === 'number' ? item.price : 0;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
          return sum + (price * quantity);
        }, 0),
        metadata: {
          designs: merchDesigns,
          method: merchMethod,
          platform: merchPlatform,
          quantity: merchQty,
          margin: merchMargin
        }
      };

      // Make the API call
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit order');
      }

      const result = await response.json();
      
      alert('✅ Order submitted successfully! We\'ll be in touch soon.');
      setShopCart([]); // Clear the cart
      setView('catalog'); // Go back to catalog
      
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      alert(`❌ Failed to submit order: ${errorMessage}`);
    } finally {
      // Reset button state with proper type assertion
      const submitBtn = document.querySelector('button:contains("Sending...")') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.textContent = 'Send Cart via Email';
        submitBtn.disabled = false;
      }
    }
  }

  // Creative Factory Workflow State
  const [workflowStep, setWorkflowStep] = useState(1);
  const [workflowErrors, setWorkflowErrors] = useState<{[key: string]: string}>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Integrations (stored locally; guard your keys!)
  const [airtableKey, setAirtableKey] = useState("");
  const [airtableBase, setAirtableBase] = useState("");
  const [airtableTable, setAirtableTable] = useState("Leads");
  const [emailWebhook, setEmailWebhook] = useState(process.env.NEXT_PUBLIC_EMAIL_SERVICE_URL || "");
  const [stripePublicKey, setStripePublicKey] = useState("");

  // Helpers
  function toggle(list: string[], id: string, setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }
  const toggleCart = (id: string) => toggle(cart, id, setCart);
  const toggleMerchItem = (id: string) => toggle(merchItems, id, setMerchItems);

  // Creative Factory Workflow Functions
  const validateWorkflowStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!chain) newErrors.chain = "Please select a chain";
    if (!timeline) newErrors.timeline = "Please select a timeline";
    if (!vision.trim()) newErrors.vision = "Project vision is required";
    
    setWorkflowErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateWorkflowStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    if (channels.length === 0) newErrors.channels = "Please select at least one channel";
    if (content.length === 0) newErrors.content = "Please select at least one content type";
    if (styles.length === 0) newErrors.styles = "Please select at least one style";
    if (!contactName.trim()) newErrors.contactName = "Contact name is required";
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail)) newErrors.contactEmail = "Valid email is required";
    if (!contactTelegram.trim()) newErrors.contactTelegram = "Telegram username is required";
    
    setWorkflowErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextWorkflowStep = () => {
    if (workflowStep === 1 && !validateWorkflowStep1()) return;
    if (workflowStep === 2 && !validateWorkflowStep2()) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setWorkflowStep(workflowStep + 1);
      setIsAnimating(false);
    }, 200);
  };

  const prevWorkflowStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setWorkflowStep(workflowStep - 1);
      setIsAnimating(false);
    }, 200);
  };

  const saveWorkflowProgress = () => {
    const state = { projectName, chain, timeline, vision, budget, channels, content, styles, contactName, contactEmail, contactTelegram };
    localStorage.setItem("psx_creative_factory_progress", JSON.stringify(state));
    alert("Progress saved!");
  };

  const loadWorkflowProgress = () => {
    const saved = localStorage.getItem("psx_creative_factory_progress");
    if (saved) {
      const state = JSON.parse(saved);
      setProjectName(state.projectName || ""); setChain(state.chain || ""); setTimeline(state.timeline || ""); setVision(state.vision || "");
      setBudget(state.budget || 5000); setChannels(state.channels || []); setContent(state.content || []); setStyles(state.styles || []);
      setContactName(state.contactName || ""); setContactEmail(state.contactEmail || ""); setContactTelegram(state.contactTelegram || "");
      alert("Progress loaded!");
    }
  };

  // Package recommendation
  type PkgKey = "studio" | "mindshare" | "blacksite";

const recommendation: PkgKey = useMemo(() => {
  // 1. Base package based on budget
  let base: PkgKey = budget >= 15000 ? "blacksite" : 
                    budget >= 8000 ? "mindshare" : 
                    "studio";

  // 2. Calculate complexity score
  let score = 0;
  
  // Content complexity
  content.forEach(id => {
    const item = CONTENT_TYPES.find(c => c.id === id);
    if (item) score += item.complexity;
  });

  // Style complexity
  if (styles.includes("cinematic")) score += 2;
  if (styles.includes("schizo")) score += 1;
  if (styles.length > 1) score += 1; // Multiple styles add complexity

  // Channel complexity
  score += channels.length * 0.5;
  if (channels.length >= 3) score += 1; // Bonus for multi-channel

  // Timeline pressure
  if (timeline === "2-4 weeks") score += 2;
  else if (timeline === "1-2 months") score += 1;

  // Chain factor
  if (chain === "Ethereum") score += 1;
  else if (chain === "Solana") score += 0.5;

  // 3. Adjust package based on score
  if (base === "studio" && score >= 6) base = "mindshare";
  if (base === "mindshare" && score >= 8) base = "blacksite";
  if (base === "studio" && score <= 2) base = "studio"; // Force minimum

  return base;
}, [budget, styles, content, channels, timeline, chain]);
const creativeEstimate = useMemo(() => {
    if (channels.length === 0 && content.length === 0) return 0;
  
    // 1. Calculate base content costs
    let total = content.reduce((sum, contentId) => {
      return sum + calculateContentPricing(contentId, channels, styles, chain);
    }, 0);
  
    // 2. Apply timeline pressure
    if (timeline) {
      const timelineWeeks = timeline === "2-4 weeks" ? 3 : 
                           timeline === "1-2 months" ? 6 : 12;
      
      // Find most time-consuming content item
      const maxWeeks = content.reduce((max, contentId) => {
        const item = CONTENT_TYPES.find(c => c.id === contentId);
        return item ? Math.max(max, item.minTimeWeeks) : max;
      }, 0);
  
      if (timelineWeeks < maxWeeks) {
        const compressionFactor = 1 + ((maxWeeks - timelineWeeks) * 0.2);
        total *= compressionFactor;
      }
    }
  
  
  // Estimators
  
    // 3. Add coordination fees
    if (channels.length >= 3) {
      total += 400 + (Math.min(channels.length - 3, 2) * 400);
    }
  
    // 4. Add quality assurance premium
    if (styles.includes("cinematic")) {
      total += 1500;
    }
  
    // 5. Apply package tier minimums
    const packageTier = recommendation === "studio" ? 1 : 
                       recommendation === "mindshare" ? 2 : 3;
    const minPackagePrice = [2500, 9000, 20000][packageTier - 1];
    total = Math.max(total, minPackagePrice);
  
    // 6. Smart rounding
    return total >= 10000 
      ? Math.round(total / 500) * 500
      : Math.round(total / 100) * 100;
  }, [channels, content, styles, timeline, chain, recommendation]);

  const PACKAGES: Record<PkgKey, { name: string; price: string; blurb: string; deliverables: string[] }> = {
    studio: { 
      name: "Studio", 
      price: `$${creativeEstimate >= 2500 ? creativeEstimate.toLocaleString() : '5,000'}`, 
      blurb: "Premium first impression + steady social oxygen. Dedicated Producer.", 
      deliverables: [
        "Brand Kit v1 (logo, color, type, motion basics)","1× Launch Film (30–60s) + platform cuts","15–20 memes + 6–8 vertical shorts","Website starter art (hero + 2 sections)","Weekly review, 24–48h hotfix lane"
      ]
    },
    mindshare: { 
      name: "Momentum Package", 
      price: `$${creativeEstimate >= 9000 ? creativeEstimate.toLocaleString() : '10,000–12,000'}`, 
      blurb: "Ideal for projects scaling quickly, featuring a full creative suite with enhanced production.", 
      deliverables: [
        "Expanded Brand System (icons, FX library, motion grammar)","2× Launch Films (30–90s; mixed 3D + edit) + alt endings","30–40 memes + 12–16 shorts + sticker/GIF set","Website art pack (hero + 4–6 sections, animated headers)","NFT/PFP seed set (up to 100 assets)"
      ]
    },
    blacksite: { 
      name: "Blacksite Launch Package", 
      price: `$${creativeEstimate >= 20000 ? creativeEstimate.toLocaleString() : '20,000'}+`, 
      blurb: "For VC-backed or institutional launches requiring maximum production value and dedicated resources.", 
      deliverables: [
        "Narrative Bible + full Visual OS","3× Cinematic Films (teaser, main, lore vignette) with custom 3D","70–100 assets across memes/shorts/stickers/GIFs","Website system + modular scene library","Capsule merch art design (print-ready)"
      ]
    },
  };
  const pkg = PACKAGES[recommendation];

  const merchEstimate = useMemo(() => {
    const items = merchItems.map((id) => MERCH_ITEMS.find((m) => m.id === id) || DEVOPS.find((d) => d.id === id))!.filter(Boolean);
    const minUnits = merchMethod === "Bulk" ? merchQty : Math.max(merchQty, 50);
    const baseCost = items.reduce((s, m) => s + ('baseCost' in m ? m.baseCost : m.price), 0) * minUnits;
    const price = items.reduce((s, m) => s + ('baseCost' in m ? m.baseCost * (1 + merchMargin) : m.price), 0) * minUnits;
    const designFee = merchDesigns * 200;
    return { baseCost, price, designFee, grossProfit: Math.max(price - baseCost - designFee, 0) };
  }, [merchItems, merchMethod, merchQty, merchMargin, merchDesigns]);

  const packageDetails = useMemo(() => {
    if (!recommendation) return null;
  
    const basePackage = {
      studio: {
        name: "Studio Package",
        basePrice: 2500,
        description: "Premium first impression + steady social oxygen. Dedicated Producer."
      },
      mindshare: {
        name: "Momentum Package",
        basePrice: 9000,
        description: "Ideal for projects scaling quickly, featuring a full creative suite with enhanced production."
      },
      blacksite: {
        name: "Blacksite Launch Package",
        basePrice: 20000,
        description: "For VC-backed or institutional launches requiring maximum production value and dedicated resources."
      }
    }[recommendation];
  
    if (!basePackage) return null;
  
    const features = ["Creative Pipeline & Brand Foundation ($1,500)"];
  
    // Add content-specific features
    if (content.includes("launchFilm")) {
      features.push(
        recommendation === "blacksite" 
          ? "3x Cinematic Trailers (3D, schizo edits, TikTok cutdowns)"
          : "Launch Trailer (60-90 seconds, professional edit)"
      );
    }
  
    if (content.includes("nftSeed")) {
      features.push(
        recommendation === "blacksite"
          ? "NFT/PFP Collection: Up to 500 assets (custom 2D/3D)"
          : "NFT/PFP Design: Up to 100 assets"
      );
      if (recommendation === "blacksite") {
        features.push("Metadata and rarity distribution included");
      }
    }
  
    // Add style-specific features
    if (styles.includes("cinematic")) {
      features.push("Cinematic Quality Premium (3D rendering, advanced post-production)");
    }
  
    // Add timeline note
    const timelineText = timeline === "2-4 weeks" 
      ? "Rush delivery (2-4 weeks) - Priority scheduling applied"
      : timeline === "1-2 months" 
        ? "Standard delivery (1-2 months)"
        : "Extended timeline (2+ months) - Flexible scheduling";
    
    features.push(`Timeline: ${timelineText}`);
  
    // Add channel-specific notes
    if (channels.length > 0) {
      features.push(`Optimized for: ${channels.map(c => CHANNELS.find(ch => ch.id === c)?.label).filter(Boolean).join(', ')}`);
    }
  
    return {
      ...basePackage,
      price: creativeEstimate,
      features
    };
  }, [recommendation, content, styles, timeline, channels, creativeEstimate]);

  // Persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem("psx_ce_state_mvap");
      if (raw) {
        const s = JSON.parse(raw);
        setProjectName(s.projectName || ""); setChain(s.chain || ""); setTimeline(s.timeline || ""); setVision(s.vision || "");
        setBudget(s.budget || 5000); setChannels(s.channels || []); setContent(s.content || []); setStyles(s.styles || []);
        setContactName(s.contactName || ""); setContactEmail(s.contactEmail || ""); setContactTelegram(s.contactTelegram || "");
        setCart(s.cart || []);
        setMerchDesigns(s.merchDesigns ?? 3); setMerchItems(s.merchItems || ["tee","hoodie"]); setMerchMethod(s.merchMethod || "POD"); setMerchPlatform(s.merchPlatform || "Shopify"); setMerchQty(s.merchQty || 100); setMerchMargin(s.merchMargin ?? 0.5);
        setTasks(s.tasks || tasks); setAssets(s.assets || assets); setInvoices(s.invoices || invoices); setApprovals(s.approvals || approvals);
        setTeam(s.team || team); setAccounts(s.accounts || accounts); setMessages(s.messages || messages);
        setAirtableKey(s.airtableKey || ""); setAirtableBase(s.airtableBase || ""); setAirtableTable(s.airtableTable || "Leads"); setEmailWebhook(s.emailWebhook || ""); setStripePublicKey(s.stripePublicKey || "");
        setDark(s.dark ?? true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const state = { projectName, chain, timeline, vision, budget, channels, content, styles, contactName, contactEmail, contactTelegram, cart, merchDesigns, merchItems, merchMethod, merchPlatform, merchQty, merchMargin, tasks, assets, invoices, approvals, team, accounts, messages, airtableKey, airtableBase, airtableTable, emailWebhook, stripePublicKey, dark };
    localStorage.setItem("psx_ce_state_mvap", JSON.stringify(state));
  }, [projectName, chain, timeline, vision, budget, channels, content, styles, contactName, contactEmail, contactTelegram, cart, merchDesigns, merchItems, merchMethod, merchPlatform, merchQty, merchMargin, tasks, assets, invoices, approvals, team, accounts, messages, airtableKey, airtableBase, airtableTable, emailWebhook, stripePublicKey, dark]);

  // Payload
  function buildPayload() {
    return { project: { name: projectName, chain, timeline, notes: vision }, contact: { name: contactName, email: contactEmail, telegram: contactTelegram }, budget,
      selections: { channels, content, styles }, creative: { recommendedPackage: recommendation, packageDetails: pkg, estimate: creativeEstimate },
      devops: DEVOPS.filter((d) => cart.includes(d.id)), merch: { designs: merchDesigns, items: merchItems, method: merchMethod, platform: merchPlatform, qty: merchQty, margin: merchMargin, estimate: merchEstimate },
      dashboard: { tasks, assets, approvals, invoices, team, accounts }, createdAt: new Date().toISOString() };
  }

  function downloadJSON(filename = `psx-config-${Date.now()}.json`) {
    const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function copyLinkState() {
    const params = new URLSearchParams({ s: btoa(unescape(encodeURIComponent(JSON.stringify(buildPayload())))) });
    const link = `${window.location.origin}${window.location.pathname}?${params.toString()}`; navigator.clipboard?.writeText(link); alert("Sharable link copied.");
  }
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("s"); if (!q) return; try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(q))));
      setProjectName(decoded?.project?.name || ""); setChain(decoded?.project?.chain || ""); setTimeline(decoded?.project?.timeline || ""); setVision(decoded?.project?.notes || "");
      setBudget(decoded?.budget || 5000); setChannels(decoded?.selections?.channels || []); setContent(decoded?.selections?.content || []); setStyles(decoded?.selections?.styles || []);
      setContactName(decoded?.contact?.name || ""); setContactEmail(decoded?.contact?.email || ""); setContactTelegram(decoded?.contact?.telegram || "");
      setCart((decoded?.devops || []).map((d: any) => d.id).filter(Boolean));
      const merch = decoded?.merch || {}; setMerchDesigns(merch.designs ?? 3); setMerchItems(merch.items || ["tee","hoodie"]); setMerchMethod(merch.method || "POD"); setMerchPlatform(merch.platform || "Shopify"); setMerchQty(merch.qty || 100); setMerchMargin(merch.margin ?? 0.5);
      const db = decoded?.dashboard || {}; setTasks(db.tasks || []); setAssets(db.assets || []); setApprovals(db.approvals || []); setInvoices(db.invoices || []); setTeam(db.team || []); setAccounts(db.accounts || []);
      setTab("config");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Payload
  async function submitAll() {
    if (!validateWorkflowStep2()) return;
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'creative-factory-submission',
          project: {
            name: projectName,
            chain: chain,
            timeline: timeline,
            budget: budget,
            vision: vision
          },
          contact: {
            name: contactName,
            email: contactEmail,
            telegram: contactTelegram
          },
          selections: {
            channels: channels,
            content: content,
            styles: styles
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Server error:", result.error || 'Unknown error');
        alert(`❌ Submission failed: ${result.error || 'Please check the console for details'}`);
        return;
      }
      
      if (result.success) {
        alert("✅ Submission received! We'll be in touch soon.");
        // Reset form or navigate to success page
        setWorkflowStep(1);
        setProjectName("");
        setChain("");
        setTimeline("");
        setVision("");
        setChannels([]);
        setContent([]);
        setStyles([]);
        setContactName("");
        setContactEmail("");
        setContactTelegram("");
      } else {
        alert("⚠️ Submission received, but there was an issue processing it.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`❌ Failed to submit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleEmailCheckout() {
    const projectName = prompt("Enter your project name:");
    if (!projectName) return alert("Project name is required.");

    const socials = prompt("Enter your socials (e.g., Twitter, Discord):");
    if (!socials) return alert("Socials are required.");

    const description = prompt("Enter a short description of your project:");
    if (!description) return alert("Description is required.");

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map(id => DEVOPS.find(item => item.id === id)),
          projectName,
          socials,
          description,
          total: cart.reduce((sum, id) => sum + (DEVOPS.find(x => x.id === id)?.price || 0), 0),
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Server error:", result.error || 'Unknown error');
        alert(`❌ Submission failed: ${result.error || 'Please check the console for details'}`);
        return;
      }
      
      if (result.success) {
        alert("✅ Cart sent successfully! We'll be in touch soon.");
        setCart([]); // Clear the cart after successful submission
      } else {
        alert("⚠️ Submission received, but there was an issue with the email notification.");
      }
      
    } catch (e) {
      console.error("Error submitting cart:", e);
      alert("❌ Error submitting cart. Please check your connection and try again.");
    }
  };

  // Integrations (guarded stubs)
  async function sendToAirtable(record: any) {
    if (!airtableKey || !airtableBase || !airtableTable) { console.log("[Airtable] Skipped (missing config)"); return false; }
    try {
      const res = await fetch(`https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}`, {
        method: "POST", headers: { "Authorization": `Bearer ${airtableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ fields: { Name: record?.project?.name || "(no name)", Email: record?.contact?.email || "", Payload: JSON.stringify(record) } }] }),
      }); console.log("[Airtable] Response", res.status); return res.ok;
    } catch (e) { console.warn("[Airtable] Error", e); return false; }
  }
  async function sendEmailWebhook(record: any) {
    console.log("[DEBUG] Email Webhook URL:", process.env.NEXT_PUBLIC_EMAIL_SERVICE_URL);
    console.log("[DEBUG] Email API Key present:", !!process.env.NEXT_PUBLIC_EMAIL_API_KEY);
    
    if (!process.env.NEXT_PUBLIC_EMAIL_SERVICE_URL) { 
      console.error("[EmailWebhook] Error: Missing email service URL");
      return false; 
    }
    
    try { 
      const emailBody = `New Submission from PSX Creative Engine
-----------------------------------
Project: ${record?.project?.name || 'N/A'}
Contact: ${record?.contact?.name || 'N/A'} <${record?.contact?.email || 'N/A'}>

Details:
- Chain: ${record?.project?.chain || 'Not specified'}
- Timeline: ${record?.project?.timeline || 'Not specified'}
- Budget: $${record?.project?.budget || 0}

Selected Channels: ${record?.selections?.channels?.join(', ') || 'None'}
Content Types: ${record?.selections?.content?.join(', ') || 'None'}
Styles: ${record?.selections?.styles?.join(', ') || 'None'}`;

      console.log("[DEBUG] Sending email to:", process.env.NEXT_PUBLIC_TO_EMAIL);
      
      const res = await fetch(process.env.NEXT_PUBLIC_EMAIL_SERVICE_URL, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_EMAIL_API_KEY}`,
        }, 
        body: JSON.stringify({
          from: process.env.NEXT_PUBLIC_FROM_EMAIL,
          to: process.env.NEXT_PUBLIC_TO_EMAIL,
          subject: `New PSX Creative Engine Submission: ${record?.project?.name || 'New Project'}`,
          text: emailBody,
        }), 
      });
      
      const responseData = await res.json();
      console.log("[EmailWebhook] Response Status:", res.status);
      console.log("[EmailWebhook] Response Data:", responseData);
      
      if (!res.ok) {
        console.error("[EmailWebhook] Error Response:", responseData);
      }
      
      return res.ok; 
    } catch (e) { 
      console.error("[EmailWebhook] Exception:", e);
      return false; 
    }
  }
  async function startStripeCheckout(lineItems: { name: string; amount: number; quantity: number }[]) {
    if (!stripePublicKey) { alert("Stripe key not set. This is a stub."); console.log("[Stripe] Would start checkout with:", lineItems); return; }
    alert("Stripe (test) checkout would begin via your backend. See console for items."); console.log("[Stripe] Items:", lineItems);
  }

  async function sendCartEmail(cart: string[], projectName: string, socials: string, description: string) {
    try {
      // Format cart items
      const cartItems = cart.map((id) => {
        const item = DEVOPS.find((x) => x.id === id) || MERCH_ITEMS.find((x) => x.id === id);
        return item ? `- ${item.title} ($${'price' in item ? item.price : item.baseCost})` : "";
      }).filter(Boolean).join("\n");

      const emailContent = `
🚀 **New Bootstrap Store Order**

**Project Details:**
- Project Name: ${projectName}
- Contact: ${socials}
- Description: ${description}

**Order Items:**
${cartItems}

**Total Items:** ${cart.length}

---
This order was submitted through the PSX Creative Engine Bootstrap Store.`;

      // Send email using Resend
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: { name: projectName },
          contact: { socials },
          description,
          cart: cartItems,
          type: 'bootstrap-store-order'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Your order has been submitted successfully! We\'ll be in touch soon.');
      } else {
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit your order. Please try again or contact support.');
    }
  }

  // Dashboard helpers
  function moveTask(id: string, to: Task["status"]) { setTasks((ts) => ts.map(t => t.id === id ? { ...t, status: to } : t)); }
  function addMessage() {
    if (!newMsg.trim()) return;
    setMessages((ms) => [...ms, { id: `m${Date.now()}`, from: "Client", text: newMsg.trim(), at: new Date().toISOString() }]);
    setNewMsg("");
  }
  function approve(id: string, state: "approved" | "changes") { setApprovals((as) => as.map(a => a.id === id ? { ...a, status: state } : a)); }

  // Merch shop helpers (catalog in Bootstrap tab)
  function addMerchToCart(item: { id: string; title: string; baseCost: number }, size: string) {
    const existingIndex = shopCart.findIndex((it) => it.id === item.id && it.size === size);
    if (existingIndex >= 0) {
      const next = [...shopCart]; next[existingIndex].qty += 1; setShopCart(next);
    } else {
      setShopCart([...shopCart, { id: item.id, title: item.title, size, price: item.baseCost, qty: 1 }]);
    }
  }
  function updateMerchQty(index: number, qty: number) {
    const next = [...shopCart]; next[index].qty = Math.max(1, qty || 1); setShopCart(next);
  }
  function removeMerch(index: number) {
    const next = [...shopCart]; next.splice(index, 1); setShopCart(next);
  }
  const MerchCard: React.FC<{ 
    item: any; 
    onAdd: (params: { size: string }) => void; 
    dark: boolean; 
    panel: string; 
    subtext: string;
    setView: (view: "catalog" | "customize") => void;
  }> = ({ item, onAdd, dark, panel, subtext, setView }) => {
    const [size, setSize] = useState("M");
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Merch Engine</h1>
        <p className={cx("mt-2 max-w-2xl", subtext)}>Pick a product, then <b>Customize</b> to upload art and place it on a live mockup. Add variants before checkout.</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MERCH_ITEMS.map((m) => (
            <div key={m.id} className={cx("rounded-2xl p-4 border", panel)}>
              <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                <img 
                  src={m.thumbnail} 
                  alt={m.title} 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAxM2g1LjVMMTUuNSA3bC01IDUuNW0tNyAwbC01LjUtNS41bC0yLjUgMi41bTUuNS01LjVsLTUuNSA1LjVtMTEtNS41bC01LjUgNS41bS0xLTUuNWwtNS41IDUuNSIvPjwvc3ZnPg=='; 
                    e.currentTarget.className = 'w-full h-full object-contain p-2 opacity-20';
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className={cx("text-xs", subtext)}>${m.baseCost} base</div>
                </div>
                <button onClick={() => onAdd({ size })} className="rounded-md px-3 py-1 border text-sm">Customize</button>
              </div>
            </div>
          ))}
        </div>

        {/* quick cart summary */}
        <div className={cx("mt-8 rounded-2xl p-6 border", panel)}>
          <h2 className="text-lg font-semibold">Cart</h2>
          {shopCart.length === 0 ? (
            <p className={cx("mt-2", subtext)}>No items yet. Click <b>Customize</b> on a product to add your first item.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2 text-sm">
                {shopCart.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className={cx("text-xs", subtext)}>${it.price} base · Qty {it.qty}</div>
                    </div>
                    <button onClick={() => setShopCart(prev => prev.filter((_,i)=>i!==idx))} className={cx("text-xs px-2 py-1 rounded border", panel)}>Remove</button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4 flex items-center justify-between" style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}>
                <span className={cx("text-sm", subtext)}>Projected gross</span>
                <span className="font-semibold">
                  ${(
                    shopCart.reduce((s, i) => s + Math.round(i.price*(1+merchMargin))*i.qty, 0) -
                    shopCart.reduce((s, i) => s + i.price*i.qty, 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleMerchCheckout(setView)} className="rounded-2xl bg-white text-black px-4 py-2 text-sm">Send Cart via Email</button>
                <button onClick={()=>setView("catalog")} className={cx("rounded-2xl px-4 py-2 text-sm border", panel)}>Continue shopping</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const SAMPLE_VIDEOS = [
    {
      id: 'showcase1',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/showcase1.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/showcase1.jpg`,
      title: 'Showcase 1'
    },
    {
      id: 'showcase2',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/showcase2.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/showcase2.jpg`,
      title: 'Showcase 2'
    },
    {
      id: 'showcase3',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/showcase3.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/showcase3.jpg`,
      title: 'Showcase 3'
    },
    {
      id: 'sample1',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample1.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample1.jpg`,
      title: 'Sample 1'
    },
    {
      id: 'sample2',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample2.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample2.jpg`,
      title: 'Sample 2'
    },
    {
      id: 'sample3',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample3.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample3.jpg`,
      title: 'Sample 3'
    },
    {
      id: 'sample4',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample4.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample4.jpg`,
      title: 'Sample 4'
    },
    {
      id: 'sample5',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample5.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample5.jpg`,
      title: 'Sample 5'
    },
    {
      id: 'sample6',
      src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample6.MP4`,
      thumbnail: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/thumbnails/sample6.jpg`,
      title: 'Sample 6'
    }
  ];

  // ===== Merch Customizer Section (inline component) =====
  const MerchCustomizerSection: React.FC = () => {
    // local mini-router
    const [view, setView] = useState<"catalog" | "customize">("catalog");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [size, setSize] = useState("M");
    const [qty, setQty] = useState(50);
    const [upload, setUpload] = useState<string | null>(null);

    // transform controls
    const [scale, setScale] = useState(0.7);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [yaw, setYaw] = useState(0);
    const [pitch, setPitch] = useState(0);
    const [roll, setRoll] = useState(0);
    const [skewX, setSkewX] = useState(0);
    const [skewY, setSkewY] = useState(0);

    function startCustomize(item: any) {
      setSelectedId(item.id);
      setView("customize");
      setUpload(null);
      if (item.id === "hat") { setScale(0.55); setPosY(-5); setPosX(0); setYaw(0); setPitch(-5); setRoll(0); }
      if (item.id === "tee") { setScale(0.7); setPosY(-5); setPosX(0); setYaw(0); setPitch(0); setRoll(0); }
      if (item.id === "hoodie") { setScale(0.65); setPosY(-6); setPosX(0); setYaw(0); setPitch(0); setRoll(0); }
      if (item.id === "sticker") { setScale(0.85); setPosY(0); setPosX(0); setYaw(0); setPitch(0); setRoll(0); }
    }

    function backToCatalog() { setView("catalog"); setSelectedId(null); setUpload(null); }

    function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const f = e.target.files?.[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = () => setUpload(reader.result as string);
      reader.readAsDataURL(f);
    }

    function addToCart() {
      if (!selectedId) return;
      const base = MERCH_ITEMS.find(m => m.id === selectedId)!;
      const desc = `custom:${selectedId}:${size}:scale${scale.toFixed(2)}@x${posX}@y${posY}@r${yaw}/${pitch}/${roll}@k${skewX}/${skewY}`;
      setShopCart(prev => [...prev, {
        id: `${base.id}-${Date.now()}`,
        title: `${base.title} · ${size}`, // Only include the item title and size
        size,
        price: base.baseCost,
        qty: Math.max(1, qty),
        desc, // Keep the desc for internal use if needed
      }]);
      alert("Added customized item to cart");
    }

    function checkout() {
      const projectName = prompt("Enter your project name:");
      if (!projectName) return alert("Project name is required.");

      const socials = prompt("Enter your socials (e.g., Twitter, Discord):");
      if (!socials) return alert("Socials are required.");

      const description = prompt("Enter a short description of your project:");
      if (!description) return alert("Description is required.");

      handleMerchCheckout(setView);
    }

    // simple "3D-ish" mock
    const Mockup: React.FC<{ kind: string; img: string | null }> = ({ kind, img }) => {
      const wrap = "relative w-full h-96 rounded-3xl p-1"; // Fixed height for better control
      const bgFill = dark ? "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" : "bg-gradient-to-br from-zinc-200 via-zinc-100 to-white";
      const panelColor = dark ? "#27272a" : "#e4e4e7";
      const transform =
        `translate(-50%, -50%) translate(${posX}%, ${posY}%) ` +
        `rotateY(${yaw}deg) rotateX(${pitch}deg) rotateZ(${roll}deg) ` +
        `skew(${skewX}deg, ${skewY}deg) scale(${scale})`;

      // Get the base image for the product
      const baseImage = MERCH_ITEMS.find(item => item.id === kind)?.image || '';
      
      const Art = (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Base product image - background layer */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src={baseImage} 
              alt={kind}
              className="h-full w-auto max-w-full object-contain"
              style={{ 
                filter: 'brightness(0.95) contrast(1.05)',
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* User's uploaded image - top layer */}
          {img && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img 
                src={img} 
                alt="custom design" 
                className="max-w-[90%] max-h-[90%] object-contain"
                style={{ 
                  transformOrigin: 'center', 
                  transform: `${transform} translate(-50%, -50%)`,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  maxHeight: '80%',
                  maxWidth: '80%',
                }} 
              />
            </div>
          )}
          
          {/* Upload prompt - only shown when no image is uploaded */}
          {!img && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 bg-black/50 text-white rounded-lg border border-white/20">
                <div className="text-sm mb-2">Upload your design</div>
                <div className="text-xs opacity-80">PNG with transparency recommended</div>
              </div>
            </div>
          )}
        </div>
      );

      // Container for all mockup types
      return (
        <div className={cx(wrap, bgFill)} style={{ perspective: "1000px" }}>
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
          {Art}
          <div className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white/80 backdrop-blur-sm">
            {kind} mock
          </div>
        </div>
      </div>
      );
    };

    const Customizer: React.FC = () => {
      const item = MERCH_ITEMS.find(m => m.id === selectedId)!;
      if (!item) return null;

      return (
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Customize — {item.title}</h1>
            <button onClick={backToCatalog} className={cx("rounded-xl px-4 py-2 text-sm border", panel)}>Back to catalog</button>
          </div>
          <p className={cx("mt-2 max-w-2xl", subtext)}>Upload art, adjust placement, preview in 3D-ish view, then add to cart.</p>

          <div className="mt-6 grid lg:grid-cols-5 gap-8">
            {/* Preview */}
            <div className="lg:col-span-3"><Mockup kind={item.id} img={upload} /></div>

            {/* Controls */}
            <div className={cx("lg:col-span-2 rounded-2xl p-6 border", panel)}>
              <h2 className="text-lg font-semibold">Artwork & Settings</h2>

              <div className="mt-4">
                <label className="text-sm block">Upload image</label>
                <input type="file" accept="image/*" onChange={onUpload} className="mt-1 block w-full text-sm" />
                {!upload && <p className={cx("text-xs mt-1", subtext)}>PNG with transparency recommended.</p>}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div><label>Scale</label><input type="range" min={0.2} max={1.2} step={0.01} value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))} className="w-full" /></div>
                <div><label>Yaw</label><input type="range" min={-40} max={40} step={1} value={yaw} onChange={(e)=>setYaw(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Pitch</label><input type="range" min={-20} max={20} step={1} value={pitch} onChange={(e)=>setPitch(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Roll</label><input type="range" min={-15} max={15} step={1} value={roll} onChange={(e)=>setRoll(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Pos X</label><input type="range" min={-100} max={100} step={1} value={posX} onChange={(e)=>setPosX(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Pos Y</label><input type="range" min={-100} max={100} step={1} value={posY} onChange={(e)=>setPosY(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Skew X</label><input type="range" min={-10} max={10} step={1} value={skewX} onChange={(e)=>setSkewX(parseInt(e.target.value))} className="w-full" /></div>
                <div><label>Skew Y</label><input type="range" min={-10} max={10} step={1} value={skewY} onChange={(e)=>setSkewY(parseInt(e.target.value))} className="w-full" /></div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <label>Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className={cx("mt-1 w-full rounded-md px-2 py-1", panel)}>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label>Qty</label>
                  <input type="number" min={1} step={1} value={qty} onChange={(e)=>setQty(Math.max(1, parseInt(e.target.value)||1))} className={cx("mt-1 w-full rounded-md px-2 py-1", panel)} />
                </div>
                <div>
                  <label>Platform</label>
                  <select value={merchPlatform} onChange={(e)=>setMerchPlatform(e.target.value as any)} className={cx("mt-1 w-full rounded-md px-2 py-1", panel)}>
                    {(["Shopify","Whop","Gumroad"] as const).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm">Markup over base</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={2} step={0.05} value={merchMargin} onChange={(e)=>setMerchMargin(parseFloat(e.target.value))} className="w-full" />
                  <div className="w-16 text-right text-sm">{Math.round(merchMargin*100)}%</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={addToCart} className="rounded-2xl bg-white text-black py-2 font-medium">Add to Cart</button>
                <button onClick={checkout} className={cx("rounded-2xl py-2 font-medium border", panel)}>Send Cart via Email</button>
              </div>
              <p className={cx("text-xs mt-3", subtext)}>Checkout uses email submission.</p>
            </div>
          </div>
        </div>
      );
    };

    const Catalog: React.FC<{ setView: (view: "catalog" | "customize") => void }> = ({ setView }) => (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Merch Engine</h1>
        <p className={cx("mt-2 max-w-2xl", subtext)}>Pick a product, then <b>Customize</b> to upload art and place it on a live mockup. Add variants before checkout.</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MERCH_ITEMS.map((m) => (
            <div key={m.id} className={cx("rounded-2xl p-4 border", panel)}>
              <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                <img 
                  src={m.thumbnail} 
                  alt={m.title} 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAxM2g1LjVMMTUuNSA3bC01IDUuNW0tNyAwbC01LjUtNS41bC0yLjUgMi41bTUuNS01LjVsLTUuNSA1LjVtMTEtNS41bC01LjUgNS41bS0xLTUuNWwtNS41IDUuNSIvPjwvc3ZnPg=='; 
                    e.currentTarget.className = 'w-full h-full object-contain p-2 opacity-20';
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className={cx("text-xs", subtext)}>${m.baseCost} base</div>
                </div>
                <button onClick={() => startCustomize(m)} className="rounded-md px-3 py-1 border text-sm">Customize</button>
              </div>
            </div>
          ))}
        </div>

        {/* quick cart summary */}
        <div className={cx("mt-8 rounded-2xl p-6 border", panel)}>
          <h2 className="text-lg font-semibold">Cart</h2>
          {shopCart.length === 0 ? (
            <p className={cx("mt-2", subtext)}>No items yet. Click <b>Customize</b> on a product to add your first item.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2 text-sm">
                {shopCart.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className={cx("text-xs", subtext)}>${it.price} base · Qty {it.qty}</div>
                    </div>
                    <button onClick={() => setShopCart(prev => prev.filter((_,i)=>i!==idx))} className={cx("text-xs px-2 py-1 rounded border", panel)}>Remove</button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4 flex items-center justify-between" style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}>
                <span className={cx("text-sm", subtext)}>Projected gross</span>
                <span className="font-semibold">
                  ${(
                    shopCart.reduce((s, i) => s + Math.round(i.price*(1+merchMargin))*i.qty, 0) -
                    shopCart.reduce((s, i) => s + i.price*i.qty, 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleMerchCheckout(setView)} className="rounded-2xl bg-white text-black px-4 py-2 text-sm">Send Cart via Email</button>
                <button onClick={()=>setView("catalog")} className={cx("rounded-2xl px-4 py-2 text-sm border", panel)}>Continue shopping</button>
              </div>
            </>
          )}
        </div>
      </div>
    );

    return view === "catalog" ? <Catalog setView={setView} /> : <Customizer />;
  };
  // ===== end Merch Customizer Section =====

  // Shell styles
  const bg = dark ? "bg-zinc-950" : "bg-white";
  const fg = dark ? "text-zinc-100" : "text-zinc-900";
  const panel = dark ? "border-zinc-800" : "border-zinc-200";
  const subtext = dark ? "text-zinc-400" : "text-zinc-600";

  // Add this state near the top of your component
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle function for mobile menu
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className={cx("min-h-screen", bg, fg)}>
      {/* Header */}
      <header className={cx("sticky top-0 z-40 w-full border-b", panel)}>
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/picture 2.PNG" 
              alt="PSX Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-xl object-cover"
              priority
            />
            <span className="font-semibold tracking-tight">PSX | Creative Factory</span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => { setTab("home"); closeMobileMenu(); }} className={cx(tab === "home" && "font-medium underline underline-offset-4")}>Home</button>
            <button onClick={() => { setTab("config"); closeMobileMenu(); }} className={cx(tab === "config" && "font-medium underline underline-offset-4")}>Creative Factory</button>
            <button onClick={() => { setTab("devops"); closeMobileMenu(); }} className={cx(tab === "devops" && "font-medium underline underline-offset-4")}>Bootstrap</button>
            <button onClick={() => { setTab("merch"); closeMobileMenu(); }} className={cx(tab === "merch" && "font-medium underline underline-offset-4")}>Merch Engine</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setDark((d) => !d)} className={cx("rounded-full px-3 py-1 text-xs border", panel)}>
              {dark ? "Light" : "Blacksite"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} border-t ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button 
            onClick={() => { setTab("home"); closeMobileMenu(); }}
            className={`block w-full px-4 py-3 text-left ${tab === "home" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
          >
            Home
          </button>
          <button 
            onClick={() => { setTab("config"); closeMobileMenu(); }}
            className={`block w-full px-4 py-3 text-left ${tab === "config" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
          >
            Creative Factory
          </button>
          <button 
            onClick={() => { setTab("devops"); closeMobileMenu(); }}
            className={`block w-full px-4 py-3 text-left ${tab === "devops" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
          >
            Bootstrap
          </button>
          <button 
            onClick={() => { setTab("merch"); closeMobileMenu(); }}
            className={`block w-full px-4 py-3 text-left ${tab === "merch" ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
          >
            Merch Engine
          </button>
          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => { 
                setDark(d => !d);
                closeMobileMenu();
              }}
              className="w-full text-left"
            >
              {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      {/* Home */}
      {tab === "home" && (
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-6xl px-6 pt-16 pb-12">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Culture. Growth. Execution.</h1>
                  <p className={cx("mt-4 text-lg max-w-prose", subtext)}>
                    PSX is a white-label creative factory for Web3 projects. Two years of live experiments, multiple launches,
                    and a relentless culture bar distilled into a turn-key studio that makes your project look inevitable.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setTab("config")} className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium">Start Creative Factory</button>
                    <button onClick={() => setTab("devops")} className={cx("rounded-2xl px-5 py-3 text-sm border", panel)}>Browse Bootstrap</button>
                  </div>
                  <div className={cx("mt-6 flex gap-4 text-xs", subtext)}>
                    <div>24+ months mindshare</div><div>Turn-Key Delivery</div><div>Culture-first, founder-tight</div>
                  </div>
                </div>
                <div className="relative">
                  <div className={cx("aspect-[4/3] w-full rounded-3xl p-1", dark ? "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" : "bg-gradient-to-br from-zinc-200 via-zinc-100 to-white")}>
                    <div className="relative w-full h-full overflow-hidden rounded-2xl">
                      <div className="grid grid-cols-3 gap-3 p-6 w-full">
                        {SAMPLE_VIDEOS.map((video, i) => (
                          <div key={video.id} className="aspect-video rounded-xl overflow-hidden hover:z-10 hover:ring-2 hover:ring-white/50 transition-all duration-300">
                            <VideoFrame 
                              src={Array.isArray(video.src) ? video.src[0] : video.src}
                              className="h-full w-full"
                              autoCycle={false}
                              showControls={false}
                              showNavDots={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={cx("mt-3 text-sm", subtext)}>PSX Visual OS — Click any video to view fullscreen</div>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold">Services</h2>
            <p className={cx("mt-1 max-w-2xl", subtext)}>Two focused divisions to make launches inevitable.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className={cx("rounded-2xl p-6 border", panel)}>
                <h3 className="text-lg font-semibold">Creative Factory</h3>
                <p className={cx("mt-2", subtext)}>White-label content & branding: cinematic launch films, meme systems, shorts, stickers, website art, full Visual OS.</p>
              </div>
              <div className={cx("rounded-2xl p-6 border", panel)}>
                <h3 className="text-lg font-semibold">Merch Engine</h3>
                <p className={cx("mt-2", subtext)}>Design → production → storefront. POD or bulk, profit modeling, and platform setup (Shopify/Whop/Gumroad).</p>
              </div>
            </div>
          </section>

          {/* Case Study */}
          <section className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold">Case Study: TENGE Partnership</h2>
                <p className={cx("mt-1", subtext)}>Our first major partnership showcasing complete brand ecosystem delivery.</p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">TENGE Launch Video</h3>
                  <p className={cx("mt-1", subtext)}>3D animated launch trailer</p>
                  
                  <div className="mt-6">
                    <h4 className="font-medium">Deliverables</h4>
                    <ul className={cx("mt-2 space-y-1 text-sm list-disc list-inside", subtext)}>
                      <li>Complete brand identity system</li>
                      <li>3D animated launch trailer</li>
                      <li>50+ meme template collection</li>
                      <li>Animated sticker pack (12 pieces)</li>
                      <li>Website visual assets</li>
                      <li>Social media kit</li>
                      <li>Community management tools</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium">Results</h4>
                    <ul className={cx("mt-2 space-y-1 text-sm list-disc list-inside", subtext)}>
                      <li>Successful token launch</li>
                      <li>Strong community engagement</li>
                      <li>Scalable content pipeline</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Video Placeholder */}
              <div className="bg-black rounded-xl overflow-hidden aspect-video h-full">
                <VideoFrame 
                  src={[
                    `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample1.MP4`,
                    `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample2.MP4`,
                    `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample3.MP4`,
                    `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/sample4.MP4`,
                  ]}
                  autoCycle={true}
                  cycleInterval={5000} // 5 seconds per video
                  showControls={false}
                  showNavDots={true}
                />
              </div>
            </div>
          </section>

          {/* Selected Work */}
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold">Selected Work</h2>
            <p className={cx("mt-1 max-w-2xl", subtext)}>Real projects that showcase our creative execution.</p>
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { 
                  id: 1, 
                  title: "Evil Corp Launch", 
                  image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop&crop=center",
                  category: "Memecoin Launch",
                  description: "Full visual identity + launch campaign"
                },
                { 
                  id: 2, 
                  title: "Base Protocol", 
                  image: "https://images.unsplash.com/photo-1659088515547-18c277330d19?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  category: "Protocol Branding",
                  description: "Cinematic launch film + brand system"
                },
                { 
                  id: 3, 
                  title: "DeFi Dashboard", 
                  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  category: "Web Application",
                  description: "UI/UX design + motion graphics"
                },
                { 
                  id: 4, 
                  title: "NFT Collection", 
                  image: "https://images.unsplash.com/photo-1642525027649-00d7397a6d4a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  category: "Digital Art",
                  description: "10k PFP collection + marketing"
                },
                { 
                  id: 5, 
                  title: "Merch Store", 
                  image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center",
                  category: "E-commerce",
                  description: "Design + production + storefront"
                },
                { 
                  id: 6, 
                  title: "Social Campaign", 
                  image: "https://images.unsplash.com/photo-1716846612426-af01430bb40f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  category: "Social Media",
                  description: "Multi-platform content strategy"
                }
              ].map((project) => (
                <div 
                  key={project.id} 
                  className={cx(
                    "group relative aspect-video rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300",
                    panel,
                    "hover:scale-105 hover:shadow-xl hover:shadow-black/20"
                  )}
                >
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-sm font-semibold">{project.title}</div>
                    <div className="text-xs opacity-75 mb-1">{project.category}</div>
                    <div className="text-xs opacity-90">{project.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why PSX */}
          <section className={cx(dark ? "bg-zinc-900" : "bg-zinc-50")}>
            <div className="mx-auto max-w-6xl px-6 py-12">
              <h2 className="text-2xl font-semibold">Why PSX</h2>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                <div className={cx("rounded-2xl p-6 border", panel)}>
                  <h3 className="font-medium">Mindshare, not vanity</h3>
                  <p className={cx("mt-2", subtext)}>24 months of live experiments, multiple launches,
                    and a relentless culture bar distilled into a turn-key studio that makes your project look inevitable.</p>
                </div>
                <div className={cx("rounded-2xl p-6 border", panel)}>
                  <h3 className="font-medium">Quality over quantity</h3>
                  <p className={cx("mt-2", subtext)}>$5k minimum so we operate above the noise and protect the taste bar.</p>
                </div>
                <div className={cx("rounded-2xl p-6 border", panel)}>
                  <h3 className="font-medium">Turn-key, founder-tight</h3>
                  <p className={cx("mt-2", subtext)}>Dedicated Producer/POC, minimal meetings, maximum craft.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Creative Engine */}
      {tab === "config" && (
        <main className="mx-auto max-w-4xl px-6 py-10">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold tracking-tight">Creative Factory</h1>
              <div className="flex items-center gap-2">
                <button onClick={saveWorkflowProgress} className={cx("rounded-lg px-3 py-1 text-sm border", panel)}>Save Progress</button>
                <button onClick={loadWorkflowProgress} className={cx("rounded-lg px-3 py-1 text-sm border", panel)}>Load Progress</button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", workflowStep >= 1 ? "bg-white text-black" : "bg-zinc-800 text-zinc-400")}>1</div>
                <span className={cx("text-sm", workflowStep >= 1 ? "text-white" : "text-zinc-400")}>Project Overview</span>
              </div>
              <div className={cx("flex-1 h-px", workflowStep >= 2 ? "bg-white" : "bg-zinc-800")} />
              <div className="flex items-center gap-2">
                <div className={cx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", workflowStep >= 2 ? "bg-white text-black" : "bg-zinc-800 text-zinc-400")}>2</div>
                <span className={cx("text-sm", workflowStep >= 2 ? "text-white" : "text-zinc-400")}>Specifications</span>
              </div>
              <div className={cx("flex-1 h-px", workflowStep >= 3 ? "bg-white" : "bg-zinc-800")} />
              <div className="flex items-center gap-2">
                <div className={cx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", workflowStep >= 3 ? "bg-white text-black" : "bg-zinc-800 text-zinc-400")}>3</div>
                <span className={cx("text-sm", workflowStep >= 3 ? "text-white" : "text-zinc-400")}>Review & Submit</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className={cx("transition-all duration-300", isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100")}>
            {workflowStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Project Overview & Basic Requirements</h2>
                  <p className={cx("mt-1 text-sm", subtext)}>Tell us about your project and basic requirements.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium block mb-2">Project Name *</label>
                      <input 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        placeholder="E.g., Evil Corp v2" 
                        className={cx("w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all", 
                          dark ? "bg-zinc-900 border border-zinc-800 focus:ring-white" : "bg-white border border-zinc-200 focus:ring-black",
                          workflowErrors.projectName ? "border-red-500" : ""
                        )} 
                      />
                      {workflowErrors.projectName && <p className="text-red-500 text-xs mt-1">{workflowErrors.projectName}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Chain *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CHAINS.map((c) => (
                          <button 
                            key={c} 
                            onClick={() => setChain(c)} 
                            className={cx("rounded-xl border px-4 py-3 text-sm transition-all", 
                              chain === c ? (dark ? "border-white bg-white text-black" : "border-black bg-black text-white") : (panel + " hover:opacity-90"),
                              workflowErrors.chain && !chain ? "border-red-500" : ""
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      {workflowErrors.chain && <p className="text-red-500 text-xs mt-1">{workflowErrors.chain}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Timeline *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMELINES.map((t) => (
                          <button 
                            key={t} 
                            onClick={() => setTimeline(t)} 
                            className={cx("rounded-xl border px-4 py-3 text-sm transition-all", 
                              timeline === t ? (dark ? "border-white bg-white text-black" : "border-black bg-black text-white") : (panel + " hover:opacity-90"),
                              workflowErrors.timeline && !timeline ? "border-red-500" : ""
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {workflowErrors.timeline && <p className="text-red-500 text-xs mt-1">{workflowErrors.timeline}</p>}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium block mb-2">Project Vision *</label>
                      <textarea 
                        value={vision} 
                        onChange={(e) => setVision(e.target.value)} 
                        placeholder="Describe your project vision, goals, and what makes it unique..." 
                        rows={4}
                        className={cx("w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all resize-none", 
                          dark ? "bg-zinc-900 border border-zinc-800 focus:ring-white" : "bg-white border border-zinc-200 focus:ring-black",
                          workflowErrors.vision ? "border-red-500" : ""
                        )} 
                      />
                      {workflowErrors.vision && <p className="text-red-500 text-xs">{workflowErrors.vision}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Budget Range</label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">${budget.toLocaleString()}</span>
                          <span className={cx("text-xs", subtext)}>Minimum $2.5k</span>
                        </div>
                        <input 
                          type="range" 
                          min={2500} 
                          max={30000} 
                          step={500} 
                          value={budget} 
                          onChange={(e) => setBudget(Number(e.target.value))} 
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex gap-2 flex-wrap">
                          {[2500, 5000, 10000, 20000, 30000].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setBudget(b)}
                              className={cx(
                                "text-xs px-2 py-1 rounded",
                                budget === b 
                                  ? "bg-white text-black" 
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              )}
                            >
                              ${b >= 1000 ? `${b/1000}k` : b}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={nextWorkflowStep} 
                    className="rounded-xl bg-white text-black px-6 py-3 font-medium hover:opacity-90 transition-all"
                  >
                    Continue to Specifications →
                  </button>
                </div>
              </div>
            )}

            {workflowStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Detailed Specifications & Budget</h2>
                  <p className={cx("text-sm", subtext)}>Define your content needs and style preferences.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Content Types</h2>
                      <p className={cx("mt-1 text-sm mb-4", subtext)}>Select the types of content you need</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CONTENT_TYPES.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggle(content, item.id, setContent)}
                            className={cx(
                              "text-left p-3 rounded-xl border text-sm transition-colors flex items-center min-h-[60px]",
                              content.includes(item.id) 
                                ? "border-blue-500 bg-blue-500/10" 
                                : panel,
                              "hover:bg-opacity-80"
                            )}
                          >
                            <div className="font-medium">{item.label}</div>
                          </button>
                        ))}
                      </div>
                      {workflowErrors.content && (
                        <p className="text-red-500 text-xs mt-1">{workflowErrors.content}</p>
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-2">Style & Tone</h2>
                      <p className={cx("mt-1 text-sm mb-4", subtext)}>Define your visual style and tone</p>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_OPTIONS.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => toggle(styles, style.id, setStyles)}
                            className={cx(
                              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                              styles.includes(style.id)
                                ? "bg-blue-500 text-white"
                                : cx("border", panel),
                              "hover:opacity-90"
                            )}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                      {workflowErrors.styles && (
                        <p className="text-red-500 text-xs mt-1">{workflowErrors.styles}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium block mb-2">Social Channels *</label>
                      <div className="grid grid-cols-1 gap-2">
                        {CHANNELS.map((c) => (
                          <button 
                            key={c.id} 
                            onClick={() => toggle(channels, c.id, setChannels)} 
                            className={cx("rounded-xl border px-4 py-3 text-left text-sm transition-all", 
                              channels.includes(c.id) ? (dark ? "border-white bg-white text-black" : "border-black bg-black text-white") : (panel + " hover:opacity-90"),
                              workflowErrors.channels && channels.length === 0 ? "border-red-500" : ""
                            )}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      {workflowErrors.channels && <p className="text-red-500 text-xs mt-1">{workflowErrors.channels}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Contact Information *</label>
                      <div className="space-y-3">
                        <input 
                          value={contactName} 
                          onChange={(e) => setContactName(e.target.value)} 
                          placeholder="Your name" 
                          className={cx("w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all", 
                            dark ? "bg-zinc-900 border border-zinc-800 focus:ring-white" : "bg-white border border-zinc-200 focus:ring-black",
                            workflowErrors.contactName ? "border-red-500" : ""
                          )} 
                        />
                        {workflowErrors.contactName && <p className="text-red-500 text-xs">{workflowErrors.contactName}</p>}
                        
                        <input 
                          type="email" 
                          value={contactEmail} 
                          onChange={(e) => setContactEmail(e.target.value)} 
                          placeholder="your@email.com" 
                          className={cx("w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all", 
                            dark ? "bg-zinc-900 border border-zinc-800 focus:ring-white" : "bg-white border border-zinc-200 focus:ring-black",
                            workflowErrors.contactEmail ? "border-red-500" : ""
                          )} 
                        />
                        {workflowErrors.contactEmail && <p className="text-red-500 text-xs">{workflowErrors.contactEmail}</p>}
                        
                        <input 
                          type="text" 
                          value={contactTelegram} 
                          onChange={(e) => setContactTelegram(e.target.value)} 
                          placeholder="Your Telegram username (e.g. @username)" 
                          className={cx("w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all", 
                            dark ? "bg-zinc-900 border border-zinc-800 focus:ring-white" : "bg-white border border-zinc-200 focus:ring-black",
                            workflowErrors.contactTelegram ? "border-red-500" : ""
                          )} 
                        />
                        {workflowErrors.contactTelegram && <p className="text-red-500 text-xs">{workflowErrors.contactTelegram}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button 
                    onClick={prevWorkflowStep} 
                    className={cx("rounded-xl px-6 py-3 font-medium border", panel)}
                  >
                    ← Back to Overview
                  </button>
                  <button 
                    onClick={nextWorkflowStep} 
                    className="rounded-xl bg-white text-black px-6 py-3 font-medium hover:opacity-90 transition-all"
                  >
                    Review & Submit →
                  </button>
                </div>
              </div>
            )}

            {workflowStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
                  <p className={cx("text-sm", subtext)}>Review your project details and submit to PSX.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className={cx("rounded-2xl p-6 border", panel)}>
                      <h3 className="text-lg font-semibold mb-4">Project Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className={subtext}>Project Name:</span>
                          <span className="font-medium">{projectName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={subtext}>Chain:</span>
                          <span className="font-medium">{chain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={subtext}>Timeline:</span>
                          <span className="font-medium">{timeline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={subtext}>Budget:</span>
                          <span className="font-medium">${budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={cx("rounded-2xl p-6 border", panel)}>
                      <h3 className="text-lg font-semibold mb-4">Selected Channels & Content</h3>
                      <div className="space-y-3">
                        <div>
                          <span className={cx("text-sm", subtext)}>Channels:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {channels.map((c) => (
                              <Pill key={c} active>{CHANNELS.find(ch => ch.id === c)?.label}</Pill>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className={cx("text-sm", subtext)}>Content Types:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {content.map((c) => (
                              <Pill key={c} active>{CONTENT_TYPES.find(ct => ct.id === c)?.label}</Pill>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className={cx("text-sm", subtext)}>Styles:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {styles.map((s) => (
                              <Pill key={s} active>{STYLE_OPTIONS.find(st => st.id === s)?.label}</Pill>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={cx("rounded-2xl p-6 border", panel)}>
                      <h3 className="text-lg font-semibold mb-4">Recommended Package</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-lg font-semibold">
                            <PriceDisplay 
                              price={pkg.price} 
                              breakdown={getPricingBreakdown('launchFilm', [], [], 'ethereum')} 
                            />
                          </span>
                        </div>
                        <p className={cx("text-sm", subtext)}>{pkg.blurb}</p>
                        <div className="text-sm">
                          <span className={subtext}>Estimated Scope:</span>
                          <div className="font-medium">~${creativeEstimate.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className={cx("rounded-2xl p-6 border", panel)}>
                      <h3 className="text-lg font-semibold mb-4">Contact</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className={subtext}>Name:</span> {contactName}</div>
                        <div><span className={subtext}>Email:</span> {contactEmail}</div>
                        <div><span className={subtext}>Telegram:</span> {contactTelegram}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={submitAll} 
                        className="w-full rounded-xl bg-white text-black py-3 font-medium"
                      >
                        Submit to PSX Producer
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={copyLinkState} 
                          className={cx("flex-1 rounded-xl px-4 py-2 text-sm border transition-all", panel)}
                        >
                          Copy Link
                        </button>
                        <button 
                          onClick={() => downloadJSON()} 
                          className={cx("flex-1 rounded-xl px-4 py-2 text-sm border transition-all", panel)}
                        >
                          Download JSON
                        </button>
                      </div>
                      <button 
                        onClick={prevWorkflowStep} 
                        className={cx("w-full rounded-xl px-4 py-2 text-sm border transition-all", panel)}
                      >
                        ← Back to Specifications
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

     {/* Bootstrap */}
{tab === "devops" && (
  <main className="mx-auto max-w-6xl px-6 py-10">
    <h1 className="text-2xl font-semibold tracking-tight">Bootstrap Store (a-la-carte launch ops)</h1>
    <p className={cx("mt-2 max-w-2xl", subtext)}>Operational glue for launch readiness: quests, Discord HQ, airdrop light backends, websites, CRM, animations.</p>

    <div className="mt-6 grid md:grid-cols-3 gap-6">
      {DEVOPS.map((d) => {
        const selected = cart.includes(d.id);
        return (
          <div key={d.id} className={cx("rounded-2xl p-6 flex flex-col border", panel)}>
            <h3 className="text-lg font-semibold">{d.title}</h3>
            <div className="font-medium mt-1">${d.price.toLocaleString()}</div>
            <p className={cx("mt-2 flex-1 text-sm", subtext)}>{d.desc}</p>
            <button 
              onClick={() => toggleCart(d.id)} 
              className={cx("mt-6 rounded-xl px-4 py-2 text-sm", selected ? "bg-white text-black" : "bg-blue-500 text-white hover:bg-blue-600")}
            >
              {selected ? "Remove" : "Add"}
            </button>
          </div>
        );
      })}
    </div>

    <div className="mt-8 grid lg:grid-cols-5 gap-8">
      <div className={cx("lg:col-span-3 rounded-2xl p-6 border", panel)}>
        <h2 className="text-lg font-semibold">Cart</h2>
        {cart.length === 0 ? (
          <p className={cx("mt-2", subtext)}>No items yet. Add Bootstrap utilities to scope with your Producer.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((id) => {
              const item = DEVOPS.find((x) => x.id === id)!;
              return (
                <li key={id} className="flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="font-medium">${item.price.toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 border-t pt-4 flex items-center justify-between" style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}>
          <span className={cx("text-sm", subtext)}>Subtotal</span>
          <span className="font-semibold">${cart.reduce((s, id) => s + (DEVOPS.find((x) => x.id === id)?.price || 0), 0).toLocaleString()}</span>
        </div>
      </div>
      <div className={cx("lg:col-span-2 rounded-2xl p-6 border", panel)}>
        <h2 className="text-lg font-semibold">Checkout</h2>
        <p className={cx("mt-1 text-sm", subtext)}>Send your cart details via email for further processing.</p>
        <button
          onClick={handleEmailCheckout}
          className="mt-3 w-full rounded-2xl border-2 border-black bg-white py-3 font-medium text-black hover:bg-gray-100 transition-colors"
        >
          Send Cart via Email
        </button>
      </div>
    </div>
  </main>
)}

      {/* Merch Engine */}
      {tab === "merch" && (
        <div className="max-w-6xl mx-auto py-6 px-4">
          <ClothingLineDesigner 
            onSubmit={async (data) => {
              try {
                const response = await fetch('/api/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'merch-store-order',
                    collection: data
                  })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  alert('✅ Collection submitted successfully!');
                } else {
                  throw new Error(result.error || 'Failed to submit collection');
                }
              } catch (error) {
                console.error('Error submitting collection:', error);
                alert(`❌ Failed to submit collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }} 
          />
        </div>
      )}

      {/* Footer */}
      <footer className={cx("border-t", dark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white")}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://x.com/PSXonBase" aria-label="Twitter" className={cx("hover:opacity-75", subtext)}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.9 7.25c.7-.4 1.2-1.1 1.5-1.9-.7.4-1.4.7-2.2.8-.6-.7-1.5-1.1-2.5-1.1-1.9 0-3.4 1.5-3.4 3.4 0 .3 0 .5.1.7-2.8-.1-5.3-1.5-7-3.6-.3.5-.5 1.1-.5 1.8 0 1.2.6 2.2 1.5 2.8-.5 0-1-.2-1.5-.4 0 1.6 1.2 3 2.8 3.3-.3.1-.6.1-1 .1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.6 3.5 2.6-1.3 1-2.9 1.6-4.6 1.6-.3 0-.6 0-.9-.1 1.6 1 3.5 1.6 5.5 1.6 6.6 0 10.2-5.5 10.2-10.2 0-.2 0-.3 0-.5.7-.5 1.3-1.1 1.8-1.8z"/>
              </svg>
            </a>
            <a href="https://github.com" aria-label="GitHub" className={cx("hover:opacity-75", subtext)}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"></path></svg>
            </a>
            <a href="https://discord.gg/psxonbase" target="_blank" rel="noopener noreferrer" aria-label="Discord" className={cx("hover:opacity-75", subtext)}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.453.864-.62 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.1 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.1c.36.698.772 1.362 1.225 1.993.078.078 0 00.084-.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.158-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.158 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className={cx("text-center text-xs leading-5", subtext)}>&copy; 2025 PSX, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}