"use client"

import type React from "react"

import { cx } from "@/lib/utils"

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-sm/5",
        active ? "bg-white text-black" : "bg-zinc-800 text-zinc-200",
      )}
    >
      {children}
    </span>
  )
}

interface ScopeSummaryProps {
  budget: number
  channels: string[]
  content: string[]
  styles: string[]
  recommendation: string
  creativeEstimate: number
  dark: boolean
  panel: string
  subtext: string
  timeline: string
  chain: string
}

const calculateItemizedBudget = (
  channels: string[],
  content: string[],
  styles: string[],
  timeline: string,
  chain: string,
  creativeEstimate: number,
) => {
  const CONTENT_TYPES = [
    { id: "launchFilm", label: "Launch Trailer (cinematic)", basePrice: 2000, complexity: 3 },
    { id: "memes", label: "Meme Assets", basePrice: 500, complexity: 1 },
    { id: "stickers", label: "Stickers / GIFs", basePrice: 300, complexity: 1 },
    { id: "shorts", label: "Shortform Verticals (TikTok/Reels)", basePrice: 800, complexity: 2 },
    { id: "webAssets", label: "Website Assets (hero, banners)", basePrice: 800, complexity: 2 },
    { id: "nftSeed", label: "NFT/PFP Collection (100+ assets)", basePrice: 3000, complexity: 4 },
    { id: "merchArt", label: "Merch Art (design only)", basePrice: 400, complexity: 1 },
    { id: "brandKit", label: "Brand Kit (logo, colors, fonts)", basePrice: 1200, complexity: 2 },
    { id: "motionGraphics", label: "Motion Graphics Package", basePrice: 1500, complexity: 3 },
  ]

  const CHANNELS = [
    { id: "twitter", label: "Twitter / X", multiplier: 1.0 },
    { id: "tiktok", label: "TikTok", multiplier: 1.2 },
    { id: "telegram", label: "Telegram", multiplier: 0.8 },
    { id: "discord", label: "Discord", multiplier: 0.9 },
    { id: "instagram", label: "Instagram / Reels", multiplier: 1.1 },
    { id: "website", label: "Website / Landing", multiplier: 1.3 },
  ]

  const breakdown = []
  let subtotal = 0

  // Management & Conceptualization Fee (always included)
  const managementFee = 1500
  breakdown.push({
    item: "Creative Pipeline & Brand Foundation",
    description: "One-time setup: creative pipeline, brand voice definition, scalable content production foundation",
    cost: managementFee,
  })
  subtotal += managementFee

  // Content items
  content.forEach((id) => {
    const item = CONTENT_TYPES.find((c) => c.id === id)
    if (!item) return

    let itemCost = item.basePrice

    // Apply channel scaling
    if (id === "memes" || id === "stickers") {
      itemCost *= Math.min(channels.length * 0.6, 2.5)
    } else if (id === "shorts") {
      itemCost *= channels.filter((c) => ["tiktok", "instagram"].includes(c)).length || 1
    } else if (id === "webAssets") {
      itemCost *= channels.includes("website") ? 1.0 : 0.4
    } else if (id !== "nftSeed" && id !== "brandKit" && id !== "merchArt") {
      itemCost *= 1 + (channels.length - 1) * 0.3
    }

    // Chain bonus for NFT
    if (id === "nftSeed") {
      itemCost += chain === "Ethereum" ? 2000 : chain === "Solana" ? 1500 : 1000
    }

    breakdown.push({
      item: item.label,
      description: `${channels.length} channel${channels.length > 1 ? "s" : ""} adaptation`,
      cost: Math.round(itemCost),
    })
    subtotal += Math.round(itemCost)
  })

  // Channel coordination fees
  if (channels.length >= 5) {
    breakdown.push({
      item: "Premium Multi-Channel Coordination",
      description: `${channels.length} channels - content adaptation & scheduling`,
      cost: 1200,
    })
    subtotal += 1200
  } else if (channels.length >= 4) {
    breakdown.push({
      item: "Multi-Channel Coordination",
      description: `${channels.length} channels - content adaptation & scheduling`,
      cost: 800,
    })
    subtotal += 800
  } else if (channels.length >= 3) {
    breakdown.push({
      item: "Channel Coordination",
      description: `${channels.length} channels - content adaptation`,
      cost: 400,
    })
    subtotal += 400
  }

  // Style complexity premium
  if (styles.includes("cinematic")) {
    breakdown.push({
      item: "Cinematic Quality Premium",
      description: "3D rendering, advanced post-production, premium assets",
      cost: 1500,
    })
    subtotal += 1500
  }

  // Timeline pressure
  if (timeline === "2-4 weeks") {
    const rushFee = Math.round(subtotal * 0.3)
    breakdown.push({
      item: "Rush Timeline Premium",
      description: "Expedited delivery, priority resource allocation",
      cost: rushFee,
    })
    subtotal += rushFee
  }

  // Adjust to match actual estimate
  const difference = creativeEstimate - subtotal
  if (Math.abs(difference) > 100) {
    breakdown.push({
      item: difference > 0 ? "Project Complexity Adjustment" : "Volume Discount",
      description: difference > 0 ? "Additional complexity factors" : "Multi-service discount applied",
      cost: difference,
    })
  }

  return {
    breakdown,
    total: creativeEstimate,
  }
}

export function ScopeSummary({
  budget,
  channels,
  content,
  styles,
  recommendation,
  creativeEstimate,
  dark,
  panel,
  subtext,
  timeline,
  chain,
}: ScopeSummaryProps) {
  const budgetBreakdown = calculateItemizedBudget(channels, content, styles, timeline, chain, creativeEstimate)

  return (
    <div className={cx("rounded-2xl p-6 border", panel)}>
      <h2 className="text-lg font-semibold">Scope Summary & Budget Breakdown</h2>
      <p className={cx("text-sm", subtext)}>Detailed pricing breakdown for your creative package.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill>Budget: ${budget.toLocaleString()}</Pill>
        {channels.slice(0, 3).map((c) => (
          <Pill key={c}>{c}</Pill>
        ))}
        {content.slice(0, 3).map((c) => (
          <Pill key={c}>{c}</Pill>
        ))}
        {styles.slice(0, 2).map((s) => (
          <Pill key={s}>{s}</Pill>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl p-4 border" style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Recommended Package</span>
            <span className="font-medium text-blue-600">{recommendation.toUpperCase()}</span>
          </div>

          <div className="space-y-2">
            {budgetBreakdown.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-2 border-b border-opacity-20"
                style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.item}</div>
                  <div className={cx("text-xs mt-1", subtext)}>{item.description}</div>
                </div>
                <div className="font-medium text-sm ml-4">${item.cost.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between mt-4 pt-3 border-t"
            style={{ borderColor: dark ? "#27272a" : "#e4e4e7" }}
          >
            <span className="font-semibold">Total Project Cost</span>
            <span className="font-semibold text-lg">${budgetBreakdown.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
