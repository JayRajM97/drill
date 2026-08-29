// Generated from assets/seed/product-metrics.csv — do not edit by hand.
// Product metrics by industry: each metric card = name, one-line meaning, example value.

import type { NumberTopic } from './numbers';

export const METRIC_TOPICS: NumberTopic[] = [
  {
    "key": "pm-e-commerce",
    "title": "E-commerce",
    "emoji": "🛒",
    "blurb": "Traffic → discovery → conversion → retention, with ops and CX guardrails.",
    "groups": [
      {
        "title": "User Traffic",
        "covers": "Top-of-funnel user inflow and browsing behavior",
        "facts": [
          {
            "id": "m.e-commerce.dau",
            "label": "DAU",
            "value": "120k users opened app today",
            "note": "Daily active users visiting app"
          },
          {
            "id": "m.e-commerce.mau",
            "label": "MAU",
            "value": "1.2M users active this month",
            "note": "Monthly active users"
          },
          {
            "id": "m.e-commerce.new-users",
            "label": "New users",
            "value": "25k new users this week",
            "note": "First-time visitors or buyers"
          },
          {
            "id": "m.e-commerce.returning-users",
            "label": "Returning users",
            "value": "60% traffic is returning",
            "note": "Existing users coming back"
          },
          {
            "id": "m.e-commerce.session-duration",
            "label": "Session duration",
            "value": "6.5 mins per session",
            "note": "Avg time per session"
          },
          {
            "id": "m.e-commerce.bounce-rate",
            "label": "Bounce rate",
            "value": "40% users exit on homepage",
            "note": "% users leaving after 1 page"
          },
          {
            "id": "m.e-commerce.pages-session",
            "label": "Pages/session",
            "value": "Avg 5 pages viewed",
            "note": "Depth of browsing"
          }
        ]
      },
      {
        "title": "Discovery",
        "covers": "How well users find relevant products",
        "facts": [
          {
            "id": "m.e-commerce.search-usage-rate",
            "label": "Search usage rate",
            "value": "45% sessions use search",
            "note": "% sessions using search"
          },
          {
            "id": "m.e-commerce.search-to-pdp-rate",
            "label": "Search-to-PDP rate",
            "value": "55% search sessions open PDP",
            "note": "% searches leading to product page"
          },
          {
            "id": "m.e-commerce.ctr-on-listings",
            "label": "CTR on listings",
            "value": "9% CTR from listings",
            "note": "% impressions turning into clicks"
          },
          {
            "id": "m.e-commerce.filter-usage",
            "label": "Filter usage",
            "value": "30% users apply filters",
            "note": "% users refining catalog"
          }
        ]
      },
      {
        "title": "Conversion Funnel",
        "covers": "Movement from browsing to purchase",
        "facts": [
          {
            "id": "m.e-commerce.product-view-rate",
            "label": "Product view rate",
            "value": "70% users view ≥1 product",
            "note": "% users viewing product pages"
          },
          {
            "id": "m.e-commerce.add-to-cart-rate",
            "label": "Add-to-cart rate",
            "value": "30% add at least 1 item",
            "note": "% users adding item"
          },
          {
            "id": "m.e-commerce.cart-to-checkout-rate",
            "label": "Cart-to-checkout rate",
            "value": "65% carts start checkout",
            "note": "% carts that enter checkout"
          },
          {
            "id": "m.e-commerce.checkout-start-rate",
            "label": "Checkout start rate",
            "value": "20% start checkout",
            "note": "% users initiating checkout"
          },
          {
            "id": "m.e-commerce.payment-success-rate",
            "label": "Payment success rate",
            "value": "88% payments succeed",
            "note": "% checkout attempts that succeed"
          },
          {
            "id": "m.e-commerce.conversion-rate",
            "label": "Conversion rate",
            "value": "8% users purchase",
            "note": "% completing purchase"
          },
          {
            "id": "m.e-commerce.funnel-drop-off",
            "label": "Funnel drop-off",
            "value": "50% drop at payment",
            "note": "Loss at each step"
          }
        ]
      },
      {
        "title": "Business Health",
        "covers": "Commercial performance of the marketplace",
        "facts": [
          {
            "id": "m.e-commerce.gmv",
            "label": "GMV",
            "value": "₹5Cr GMV/day",
            "note": "Total value of goods sold"
          },
          {
            "id": "m.e-commerce.revenue",
            "label": "Revenue",
            "value": "₹50L revenue/day",
            "note": "Platform earnings"
          },
          {
            "id": "m.e-commerce.take-rate",
            "label": "Take rate",
            "value": "10% take rate",
            "note": "% cut from GMV"
          },
          {
            "id": "m.e-commerce.aov",
            "label": "AOV",
            "value": "₹1,200/order",
            "note": "Avg order value"
          },
          {
            "id": "m.e-commerce.orders-user",
            "label": "Orders/user",
            "value": "2 orders/user/month",
            "note": "Purchase frequency"
          },
          {
            "id": "m.e-commerce.gross-margin",
            "label": "Gross margin",
            "value": "28% gross margin",
            "note": "Margin after direct costs"
          }
        ]
      },
      {
        "title": "Retention & Loyalty",
        "covers": "Whether users come back and build habit",
        "facts": [
          {
            "id": "m.e-commerce.repeat-purchase-rate",
            "label": "Repeat purchase rate",
            "value": "35% users reorder",
            "note": "% returning buyers"
          },
          {
            "id": "m.e-commerce.purchase-frequency",
            "label": "Purchase frequency",
            "value": "2.4 orders/month",
            "note": "Avg orders per buyer over time"
          },
          {
            "id": "m.e-commerce.cohort-retention",
            "label": "Cohort retention",
            "value": "25% at Day 30",
            "note": "Users retained over time"
          },
          {
            "id": "m.e-commerce.ltv",
            "label": "LTV",
            "value": "₹4,800/user",
            "note": "Lifetime value per user"
          }
        ]
      },
      {
        "title": "Catalog & Inventory",
        "covers": "Assortment quality and stock health",
        "facts": [
          {
            "id": "m.e-commerce.catalog-completeness",
            "label": "Catalog completeness",
            "value": "85% listings fully complete",
            "note": "% listings with full info"
          },
          {
            "id": "m.e-commerce.listing-quality-score",
            "label": "Listing quality score",
            "value": "Avg score 78/100",
            "note": "Quality of title/image/attributes"
          },
          {
            "id": "m.e-commerce.inventory-availability",
            "label": "Inventory availability",
            "value": "92% SKUs available",
            "note": "% items in stock"
          },
          {
            "id": "m.e-commerce.oos-rate",
            "label": "OOS rate",
            "value": "8% items unavailable",
            "note": "Out of stock %"
          },
          {
            "id": "m.e-commerce.stock-freshness",
            "label": "Stock freshness",
            "value": "95% sync within 1 hour",
            "note": "How current inventory data is"
          }
        ]
      },
      {
        "title": "Fulfillment & Delivery",
        "covers": "Post-purchase execution quality",
        "facts": [
          {
            "id": "m.e-commerce.order-fulfillment-rate",
            "label": "Order fulfillment rate",
            "value": "96% orders fulfilled",
            "note": "% orders successfully fulfilled"
          },
          {
            "id": "m.e-commerce.sla-adherence",
            "label": "SLA adherence",
            "value": "90% within SLA",
            "note": "On-time delivery %"
          },
          {
            "id": "m.e-commerce.late-delivery-rate",
            "label": "Late delivery rate",
            "value": "12% delayed orders",
            "note": "% delivered after promised time"
          },
          {
            "id": "m.e-commerce.average-delivery-tat",
            "label": "Average delivery TAT",
            "value": "2.3 days",
            "note": "Avg time from order to delivery"
          }
        ]
      },
      {
        "title": "Guardrails / CX",
        "covers": "Protecting trust, quality, and cost",
        "facts": [
          {
            "id": "m.e-commerce.return-rate",
            "label": "Return rate",
            "value": "18% returns",
            "note": "% returned orders"
          },
          {
            "id": "m.e-commerce.refund-rate",
            "label": "Refund rate",
            "value": "12% refunds",
            "note": "% refunded orders"
          },
          {
            "id": "m.e-commerce.nps-csat",
            "label": "NPS / CSAT",
            "value": "CSAT 4.2/5",
            "note": "Customer satisfaction"
          },
          {
            "id": "m.e-commerce.complaint-rate",
            "label": "Complaint rate",
            "value": "3% complaint rate",
            "note": "% orders generating complaints"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-quick-commerce",
    "title": "Quick Commerce",
    "emoji": "⚡",
    "blurb": "Speed is the product: demand, dark-store ops, fleet, and the errors that eat margin.",
    "groups": [
      {
        "title": "User Demand",
        "covers": "Frequency and demand pattern of orders",
        "facts": [
          {
            "id": "m.quick-commerce.dau",
            "label": "DAU",
            "value": "80k DAU",
            "note": "Daily active users"
          },
          {
            "id": "m.quick-commerce.orders-user-week",
            "label": "Orders/user/week",
            "value": "3 orders/user/week",
            "note": "Frequency of orders"
          },
          {
            "id": "m.quick-commerce.peak-hour-demand",
            "label": "Peak hour demand",
            "value": "35% orders from 7-10 PM",
            "note": "Order concentration by time slot"
          },
          {
            "id": "m.quick-commerce.reorder-rate",
            "label": "Reorder rate",
            "value": "42% reorder within 14 days",
            "note": "How often users repeat essentials"
          }
        ]
      },
      {
        "title": "Speed & Reliability",
        "covers": "Core promise of fast delivery",
        "facts": [
          {
            "id": "m.quick-commerce.delivery-time",
            "label": "Delivery time",
            "value": "12 mins avg",
            "note": "Time from order to delivery"
          },
          {
            "id": "m.quick-commerce.store-to-door-time",
            "label": "Store-to-door time",
            "value": "8 mins avg",
            "note": "Fulfillment speed"
          },
          {
            "id": "m.quick-commerce.picker-to-pack-time",
            "label": "Picker-to-pack time",
            "value": "3 mins avg",
            "note": "Time to prepare order"
          },
          {
            "id": "m.quick-commerce.on-time-delivery-rate",
            "label": "On-time delivery rate",
            "value": "91% on time",
            "note": "% delivered within promise"
          }
        ]
      },
      {
        "title": "Conversion Funnel",
        "covers": "Shopping journey from intent to order",
        "facts": [
          {
            "id": "m.quick-commerce.search-to-cart-rate",
            "label": "Search-to-cart rate",
            "value": "22%",
            "note": "% searches adding an item"
          },
          {
            "id": "m.quick-commerce.cart-to-order-rate",
            "label": "Cart-to-order rate",
            "value": "25% conversion",
            "note": "Checkout conversion"
          },
          {
            "id": "m.quick-commerce.payment-success-rate",
            "label": "Payment success rate",
            "value": "93%",
            "note": "Successful payments"
          }
        ]
      },
      {
        "title": "Basket Economics",
        "covers": "Commercial value per order",
        "facts": [
          {
            "id": "m.quick-commerce.aov",
            "label": "AOV",
            "value": "₹450/order",
            "note": "Basket value"
          },
          {
            "id": "m.quick-commerce.basket-size",
            "label": "Basket size",
            "value": "6 items/order",
            "note": "Items/order"
          },
          {
            "id": "m.quick-commerce.gross-margin-order",
            "label": "Gross margin/order",
            "value": "₹70/order",
            "note": "Margin after direct costs"
          },
          {
            "id": "m.quick-commerce.contribution-margin",
            "label": "Contribution margin",
            "value": "₹20/order",
            "note": "Profit after fulfillment cost"
          }
        ]
      },
      {
        "title": "Dark Store Ops",
        "covers": "Efficiency inside micro-warehouses",
        "facts": [
          {
            "id": "m.quick-commerce.fill-rate",
            "label": "Fill rate",
            "value": "95% fill rate",
            "note": "% items fulfilled"
          },
          {
            "id": "m.quick-commerce.picker-efficiency",
            "label": "Picker efficiency",
            "value": "25 orders/hr",
            "note": "Orders picked/hour"
          },
          {
            "id": "m.quick-commerce.inventory-accuracy",
            "label": "Inventory accuracy",
            "value": "97% accurate",
            "note": "Match between system and actual stock"
          },
          {
            "id": "m.quick-commerce.stock-out-rate",
            "label": "Stock-out rate",
            "value": "6% stock-outs",
            "note": "Missing items at store level"
          }
        ]
      },
      {
        "title": "Delivery Fleet",
        "covers": "Rider productivity and service quality",
        "facts": [
          {
            "id": "m.quick-commerce.rider-utilization",
            "label": "Rider utilization",
            "value": "70% utilization",
            "note": "Active delivery time %"
          },
          {
            "id": "m.quick-commerce.orders-rider-hour",
            "label": "Orders/rider/hour",
            "value": "2.8 orders/hour",
            "note": "Productivity per rider"
          },
          {
            "id": "m.quick-commerce.idle-time",
            "label": "Idle time",
            "value": "18 mins/hour idle",
            "note": "Unused rider time"
          },
          {
            "id": "m.quick-commerce.rider-acceptance-rate",
            "label": "Rider acceptance rate",
            "value": "82%",
            "note": "% jobs accepted"
          }
        ]
      },
      {
        "title": "Guardrails / CX",
        "covers": "Errors that hurt trust and margins",
        "facts": [
          {
            "id": "m.quick-commerce.cancellation-rate",
            "label": "Cancellation rate",
            "value": "10% cancellations",
            "note": "% canceled orders"
          },
          {
            "id": "m.quick-commerce.wrong-item-rate",
            "label": "Wrong item rate",
            "value": "3% errors",
            "note": "Incorrect items %"
          },
          {
            "id": "m.quick-commerce.substitution-rate",
            "label": "Substitution rate",
            "value": "7% substituted",
            "note": "% items replaced"
          },
          {
            "id": "m.quick-commerce.refund-per-order",
            "label": "Refund per order",
            "value": "₹12/order refunded",
            "note": "Refund burden on business"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-mobility",
    "title": "Mobility",
    "emoji": "🚕",
    "blurb": "A two-sided marketplace: rider demand, driver supply, matching, and trip economics.",
    "groups": [
      {
        "title": "Rider Demand",
        "covers": "Customer demand for rides",
        "facts": [
          {
            "id": "m.mobility.ride-requests",
            "label": "Ride requests",
            "value": "200k/day",
            "note": "Demand volume"
          },
          {
            "id": "m.mobility.search-sessions",
            "label": "Search sessions",
            "value": "260k search sessions/day",
            "note": "Ride intent sessions opened"
          },
          {
            "id": "m.mobility.booking-conversion",
            "label": "Booking conversion",
            "value": "77%",
            "note": "% searches turning into requests"
          },
          {
            "id": "m.mobility.completed-rides",
            "label": "Completed rides",
            "value": "150k/day",
            "note": "Successful rides"
          }
        ]
      },
      {
        "title": "Driver Supply",
        "covers": "Availability and quality of drivers",
        "facts": [
          {
            "id": "m.mobility.online-driver-hours",
            "label": "Online driver hours",
            "value": "80k driver-hours/day",
            "note": "Supply available on platform"
          },
          {
            "id": "m.mobility.active-drivers",
            "label": "Active drivers",
            "value": "24k active drivers/day",
            "note": "Drivers completing at least one trip"
          },
          {
            "id": "m.mobility.acceptance-rate",
            "label": "Acceptance rate",
            "value": "75% acceptance",
            "note": "% accepted rides"
          },
          {
            "id": "m.mobility.earnings-hour",
            "label": "Earnings/hour",
            "value": "₹500/hr",
            "note": "Driver income"
          }
        ]
      },
      {
        "title": "Marketplace Balance",
        "covers": "Health of demand and supply matching",
        "facts": [
          {
            "id": "m.mobility.demand-supply-ratio",
            "label": "Demand-supply ratio",
            "value": "1.2 ratio",
            "note": "Balance of riders vs drivers"
          },
          {
            "id": "m.mobility.matching-time",
            "label": "Matching time",
            "value": "20 sec",
            "note": "Time to assign driver"
          },
          {
            "id": "m.mobility.eta-accuracy",
            "label": "ETA accuracy",
            "value": "85% within 2 mins",
            "note": "Accuracy of promised pickup time"
          },
          {
            "id": "m.mobility.surge-frequency",
            "label": "Surge frequency",
            "value": "18% rides on surge",
            "note": "% requests facing surge"
          }
        ]
      },
      {
        "title": "Trip Economics",
        "covers": "Revenue and unit economics per trip",
        "facts": [
          {
            "id": "m.mobility.revenue-ride",
            "label": "Revenue/ride",
            "value": "₹80/ride",
            "note": "Earnings per trip"
          },
          {
            "id": "m.mobility.take-rate",
            "label": "Take rate",
            "value": "18% take rate",
            "note": "Platform share from fare"
          },
          {
            "id": "m.mobility.incentive-burn",
            "label": "Incentive burn",
            "value": "₹9/ride",
            "note": "Driver/rider incentives spent"
          },
          {
            "id": "m.mobility.contribution-margin",
            "label": "Contribution margin",
            "value": "₹14/ride",
            "note": "Margin per completed ride"
          }
        ]
      },
      {
        "title": "Failure Metrics",
        "covers": "Leakages in the flow",
        "facts": [
          {
            "id": "m.mobility.cancellation-rate",
            "label": "Cancellation rate",
            "value": "18%",
            "note": "% canceled rides"
          },
          {
            "id": "m.mobility.driver-cancellation",
            "label": "Driver cancellation",
            "value": "11%",
            "note": "Cancellations by driver"
          },
          {
            "id": "m.mobility.rider-cancellation",
            "label": "Rider cancellation",
            "value": "7%",
            "note": "Cancellations by rider"
          },
          {
            "id": "m.mobility.failed-match-rate",
            "label": "Failed match rate",
            "value": "9% unmatched",
            "note": "Requests not matched"
          }
        ]
      },
      {
        "title": "Guardrails / Experience",
        "covers": "Protecting rider and driver experience",
        "facts": [
          {
            "id": "m.mobility.wait-time",
            "label": "Wait time",
            "value": "4 mins",
            "note": "Rider wait duration"
          },
          {
            "id": "m.mobility.driver-churn",
            "label": "Driver churn",
            "value": "6% monthly churn",
            "note": "% drivers leaving platform"
          },
          {
            "id": "m.mobility.support-ticket-rate",
            "label": "Support ticket rate",
            "value": "2.5% tickets",
            "note": "Trips creating support burden"
          },
          {
            "id": "m.mobility.safety-incidents",
            "label": "Safety incidents",
            "value": "0.03% trips flagged",
            "note": "Safety issue rate"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-geo-country",
    "title": "Geo / Country",
    "emoji": "🌍",
    "blurb": "How a product behaves market by market — adoption, stickiness, monetisation, local friction.",
    "groups": [
      {
        "title": "User Base",
        "covers": "Market-level adoption and user scale",
        "facts": [
          {
            "id": "m.geo-country.dau-by-country",
            "label": "DAU by country",
            "value": "India: 500k DAU",
            "note": "Usage per region"
          },
          {
            "id": "m.geo-country.mau-by-country",
            "label": "MAU by country",
            "value": "US: 1.8M MAU",
            "note": "Monthly users by region"
          },
          {
            "id": "m.geo-country.new-users-by-country",
            "label": "New users by country",
            "value": "Indonesia: 50k new users/month",
            "note": "Acquisition by geography"
          },
          {
            "id": "m.geo-country.penetration-rate",
            "label": "Penetration rate",
            "value": "12% of urban users",
            "note": "Share of target market using app"
          }
        ]
      },
      {
        "title": "Engagement & Retention",
        "covers": "Depth and stickiness by market",
        "facts": [
          {
            "id": "m.geo-country.time-spent",
            "label": "Time spent",
            "value": "Japan: 31 mins/day",
            "note": "Avg usage duration by country"
          },
          {
            "id": "m.geo-country.sessions-user",
            "label": "Sessions/user",
            "value": "Brazil: 4.5 sessions/day",
            "note": "Visit frequency by region"
          },
          {
            "id": "m.geo-country.retention-drop",
            "label": "Retention drop",
            "value": "Brazil D30 ↓ 10%",
            "note": "Cohort fall in region"
          },
          {
            "id": "m.geo-country.churn-rate",
            "label": "Churn rate",
            "value": "UK churn up 4 pts",
            "note": "Users leaving in that market"
          }
        ]
      },
      {
        "title": "Monetization & Payments",
        "covers": "Revenue quality by market",
        "facts": [
          {
            "id": "m.geo-country.arpu-by-country",
            "label": "ARPU by country",
            "value": "UAE ARPU ₹220",
            "note": "Revenue per user in a region"
          },
          {
            "id": "m.geo-country.conversion-to-paid",
            "label": "Conversion to paid",
            "value": "Germany 6% paid",
            "note": "% users paying in that market"
          },
          {
            "id": "m.geo-country.payment-success",
            "label": "Payment success",
            "value": "85% success in Tier-2",
            "note": "Successful tx %"
          },
          {
            "id": "m.geo-country.refund-rate",
            "label": "Refund rate",
            "value": "9% refunds in market X",
            "note": "Refund burden by country"
          }
        ]
      },
      {
        "title": "Infra & Localization",
        "covers": "Local friction that affects growth",
        "facts": [
          {
            "id": "m.geo-country.latency",
            "label": "Latency",
            "value": "2s avg latency",
            "note": "App/network delay"
          },
          {
            "id": "m.geo-country.crash-rate-by-device",
            "label": "Crash rate by device",
            "value": "4% crashes on low-end Android",
            "note": "Stability by device mix"
          },
          {
            "id": "m.geo-country.language-adoption",
            "label": "Language adoption",
            "value": "62% on Spanish UI",
            "note": "% users on local language"
          },
          {
            "id": "m.geo-country.local-content-relevance",
            "label": "Local content relevance",
            "value": "1.4x higher CTR on local playlists",
            "note": "Engagement with localized content"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-social-media",
    "title": "Social Media",
    "emoji": "💬",
    "blurb": "Audience, engagement depth, creator supply, and trust.",
    "groups": [
      {
        "title": "User Base",
        "covers": "Scale and active audience size",
        "facts": [
          {
            "id": "m.social-media.dau",
            "label": "DAU",
            "value": "2M DAU",
            "note": "Daily active users"
          },
          {
            "id": "m.social-media.mau",
            "label": "MAU",
            "value": "12M MAU",
            "note": "Monthly active users"
          },
          {
            "id": "m.social-media.new-signups",
            "label": "New signups",
            "value": "80k/week",
            "note": "New users entering product"
          }
        ]
      },
      {
        "title": "Engagement",
        "covers": "Depth and intensity of consumption",
        "facts": [
          {
            "id": "m.social-media.time-spent",
            "label": "Time spent",
            "value": "45 mins/user/day",
            "note": "Core engagement metric"
          },
          {
            "id": "m.social-media.sessions-day",
            "label": "Sessions/day",
            "value": "6 sessions/day",
            "note": "Usage frequency"
          },
          {
            "id": "m.social-media.feed-refresh-rate",
            "label": "Feed refresh rate",
            "value": "14 feed refreshes/day",
            "note": "How often users request more content"
          },
          {
            "id": "m.social-media.scroll-depth",
            "label": "Scroll depth",
            "value": "120 posts/session",
            "note": "Avg content consumed per session"
          }
        ]
      },
      {
        "title": "Creation Supply",
        "covers": "Health of creator-side supply",
        "facts": [
          {
            "id": "m.social-media.content-creation-rate",
            "label": "Content creation rate",
            "value": "10k posts/day",
            "note": "Content generated"
          },
          {
            "id": "m.social-media.active-creators",
            "label": "Active creators",
            "value": "120k active creators/month",
            "note": "Creators posting in a period"
          },
          {
            "id": "m.social-media.creator-retention",
            "label": "Creator retention",
            "value": "60% monthly",
            "note": "Active creators retained"
          },
          {
            "id": "m.social-media.post-frequency",
            "label": "Post frequency",
            "value": "3.2 posts/week",
            "note": "Avg posts per creator"
          }
        ]
      },
      {
        "title": "Interaction Quality",
        "covers": "Signals of meaningful engagement",
        "facts": [
          {
            "id": "m.social-media.likes-comments-shares",
            "label": "Likes/comments/shares",
            "value": "5M interactions/day",
            "note": "Engagement actions"
          },
          {
            "id": "m.social-media.save-rate",
            "label": "Save rate",
            "value": "7% save rate",
            "note": "% content saved"
          },
          {
            "id": "m.social-media.share-rate",
            "label": "Share rate",
            "value": "4% share rate",
            "note": "% content shared"
          },
          {
            "id": "m.social-media.comment-depth",
            "label": "Comment depth",
            "value": "Avg 3.6 comments/post",
            "note": "Quality of discussion"
          }
        ]
      },
      {
        "title": "Retention",
        "covers": "Habit and returning behavior",
        "facts": [
          {
            "id": "m.social-media.d1-retention",
            "label": "D1 retention",
            "value": "48% D1",
            "note": "Returning next day"
          },
          {
            "id": "m.social-media.d7-retention",
            "label": "D7 retention",
            "value": "40% D7",
            "note": "Returning users"
          },
          {
            "id": "m.social-media.d30-retention",
            "label": "D30 retention",
            "value": "24% D30",
            "note": "Long-term retention"
          }
        ]
      },
      {
        "title": "Guardrails / Trust",
        "covers": "Platform safety and content health",
        "facts": [
          {
            "id": "m.social-media.reports",
            "label": "Reports",
            "value": "2% posts flagged",
            "note": "Harmful content flags"
          },
          {
            "id": "m.social-media.moderation-accuracy",
            "label": "Moderation accuracy",
            "value": "93% accurate moderation",
            "note": "Precision of enforcement"
          },
          {
            "id": "m.social-media.spam-rate",
            "label": "Spam rate",
            "value": "1.2% posts spam",
            "note": "Spammy content proportion"
          },
          {
            "id": "m.social-media.block-mute-rate",
            "label": "Block / mute rate",
            "value": "5% users blocked accounts",
            "note": "User dissatisfaction signal"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-app-store",
    "title": "App Store",
    "emoji": "📲",
    "blurb": "The storefront funnel: impressions → installs → activation → retention → quality.",
    "groups": [
      {
        "title": "Discovery",
        "covers": "Storefront visibility and acquisition funnel",
        "facts": [
          {
            "id": "m.app-store.impressions",
            "label": "Impressions",
            "value": "1M impressions/week",
            "note": "App listing seen by users"
          },
          {
            "id": "m.app-store.ctr-to-listing",
            "label": "CTR to listing",
            "value": "12% CTR",
            "note": "% store viewers opening detail page"
          },
          {
            "id": "m.app-store.listing-cvr",
            "label": "Listing CVR",
            "value": "5% CVR",
            "note": "Impression→install"
          }
        ]
      },
      {
        "title": "Activation",
        "covers": "Install to first value conversion",
        "facts": [
          {
            "id": "m.app-store.installs",
            "label": "Installs",
            "value": "50k installs/day",
            "note": "App downloads"
          },
          {
            "id": "m.app-store.signup-rate",
            "label": "Signup rate",
            "value": "60% signup",
            "note": "Install→signup"
          },
          {
            "id": "m.app-store.onboarding-completion",
            "label": "Onboarding completion",
            "value": "72% completion",
            "note": "% finishing onboarding"
          },
          {
            "id": "m.app-store.first-key-action",
            "label": "First key action",
            "value": "41% create first playlist/order/ride",
            "note": "% reaching aha moment"
          }
        ]
      },
      {
        "title": "Retention",
        "covers": "Whether installs turn into habit",
        "facts": [
          {
            "id": "m.app-store.d1-retention",
            "label": "D1 retention",
            "value": "35%",
            "note": "Next-day return"
          },
          {
            "id": "m.app-store.d7-retention",
            "label": "D7 retention",
            "value": "18%",
            "note": "7-day return"
          },
          {
            "id": "m.app-store.d30-retention",
            "label": "D30 retention",
            "value": "9%",
            "note": "30-day return"
          }
        ]
      },
      {
        "title": "Quality",
        "covers": "Product quality signals visible to users",
        "facts": [
          {
            "id": "m.app-store.rating",
            "label": "Rating",
            "value": "4.3⭐",
            "note": "User rating"
          },
          {
            "id": "m.app-store.review-sentiment",
            "label": "Review sentiment",
            "value": "68% positive",
            "note": "Positive vs negative reviews"
          },
          {
            "id": "m.app-store.crash-rate",
            "label": "Crash rate",
            "value": "1.8% crash rate",
            "note": "Stability issues"
          },
          {
            "id": "m.app-store.uninstall-rate",
            "label": "Uninstall rate",
            "value": "20% uninstall",
            "note": "App churn"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-feature-adoption",
    "title": "Feature Adoption",
    "emoji": "🧩",
    "blurb": "Did anyone notice, use, keep using, and did it move the product?",
    "groups": [
      {
        "title": "Awareness",
        "covers": "Whether users even notice the feature",
        "facts": [
          {
            "id": "m.feature-adoption.feature-impression-rate",
            "label": "Feature impression rate",
            "value": "65% saw new widget",
            "note": "% exposed users seeing feature"
          },
          {
            "id": "m.feature-adoption.ctr-entry-rate",
            "label": "CTR / entry rate",
            "value": "18% clicked",
            "note": "% users clicking into feature"
          }
        ]
      },
      {
        "title": "Activation",
        "covers": "First successful use of feature",
        "facts": [
          {
            "id": "m.feature-adoption.users-using",
            "label": "% users using",
            "value": "25% users used feature",
            "note": "Feature penetration"
          },
          {
            "id": "m.feature-adoption.first-time-use",
            "label": "First-time use",
            "value": "40% try feature",
            "note": "Initial activation"
          },
          {
            "id": "m.feature-adoption.time-to-first-use",
            "label": "Time to first use",
            "value": "2.1 days to first use",
            "note": "Delay before first usage"
          }
        ]
      },
      {
        "title": "Engagement Depth",
        "covers": "Whether usage becomes repeated behavior",
        "facts": [
          {
            "id": "m.feature-adoption.usage-frequency",
            "label": "Usage frequency",
            "value": "3x/week usage",
            "note": "Repeat usage"
          },
          {
            "id": "m.feature-adoption.depth",
            "label": "Depth",
            "value": "5 actions/session",
            "note": "Feature usage depth"
          },
          {
            "id": "m.feature-adoption.power-user-rate",
            "label": "Power-user rate",
            "value": "12% weekly power users",
            "note": "% users using deeply"
          }
        ]
      },
      {
        "title": "Impact",
        "covers": "Whether feature improves the product",
        "facts": [
          {
            "id": "m.feature-adoption.retention-lift",
            "label": "Retention lift",
            "value": "+10% retention",
            "note": "Impact on retention"
          },
          {
            "id": "m.feature-adoption.conversion-lift",
            "label": "Conversion lift",
            "value": "+4 pts conversion",
            "note": "Uplift in purchase / booking / play"
          },
          {
            "id": "m.feature-adoption.revenue-impact",
            "label": "Revenue impact",
            "value": "₹18L/month uplift",
            "note": "Additional revenue contribution"
          }
        ]
      },
      {
        "title": "Guardrails",
        "covers": "Cannibalization or friction to core flow",
        "facts": [
          {
            "id": "m.feature-adoption.drop-in-core-flow",
            "label": "Drop in core flow",
            "value": "Checkout ↓ 5%",
            "note": "Cannibalization"
          },
          {
            "id": "m.feature-adoption.error-rate",
            "label": "Error rate",
            "value": "6% feature error rate",
            "note": "Failures while using feature"
          },
          {
            "id": "m.feature-adoption.support-ticket-rate",
            "label": "Support ticket rate",
            "value": "1.5% users raise tickets",
            "note": "Extra support burden"
          }
        ]
      }
    ]
  },
  {
    "key": "pm-growth-funnel",
    "title": "Growth Funnel",
    "emoji": "📈",
    "blurb": "AARRR end to end: acquisition, activation, engagement, retention, monetisation, profitability.",
    "groups": [
      {
        "title": "Acquisition",
        "covers": "Getting users into the funnel",
        "facts": [
          {
            "id": "m.growth-funnel.traffic",
            "label": "Traffic",
            "value": "1M visitors/month",
            "note": "Users entering funnel"
          },
          {
            "id": "m.growth-funnel.cac",
            "label": "CAC",
            "value": "₹200 CAC",
            "note": "Cost to acquire user"
          },
          {
            "id": "m.growth-funnel.channel-mix",
            "label": "Channel mix",
            "value": "40/35/25 mix",
            "note": "Split by paid/organic/referral"
          },
          {
            "id": "m.growth-funnel.install-signup-cvr",
            "label": "Install / signup CVR",
            "value": "8% landing-to-signup",
            "note": "Entry funnel efficiency"
          }
        ]
      },
      {
        "title": "Activation",
        "covers": "Reaching the first value moment",
        "facts": [
          {
            "id": "m.growth-funnel.signup-rate",
            "label": "Signup rate",
            "value": "50%",
            "note": "Users completing signup"
          },
          {
            "id": "m.growth-funnel.onboarding-completion",
            "label": "Onboarding completion",
            "value": "68%",
            "note": "Users finishing setup"
          },
          {
            "id": "m.growth-funnel.first-success-event",
            "label": "First success event",
            "value": "44% make first purchase/ride/post",
            "note": "Users completing key first action"
          }
        ]
      },
      {
        "title": "Engagement",
        "covers": "Ongoing product usage and stickiness",
        "facts": [
          {
            "id": "m.growth-funnel.dau-mau",
            "label": "DAU/MAU",
            "value": "0.3 ratio",
            "note": "Stickiness ratio"
          },
          {
            "id": "m.growth-funnel.session-frequency",
            "label": "Session frequency",
            "value": "4 visits/week",
            "note": "How often users return"
          },
          {
            "id": "m.growth-funnel.time-spent",
            "label": "Time spent",
            "value": "22 mins/day",
            "note": "Depth of usage"
          }
        ]
      },
      {
        "title": "Retention",
        "covers": "Long-term habit formation",
        "facts": [
          {
            "id": "m.growth-funnel.cohort-retention",
            "label": "Cohort retention",
            "value": "30% D30",
            "note": "Users retained"
          },
          {
            "id": "m.growth-funnel.churn-rate",
            "label": "Churn rate",
            "value": "6% monthly churn",
            "note": "Users dropping out"
          },
          {
            "id": "m.growth-funnel.resurrection-rate",
            "label": "Resurrection rate",
            "value": "9% resurrected",
            "note": "Inactive users coming back"
          }
        ]
      },
      {
        "title": "Monetization",
        "covers": "Turning usage into money",
        "facts": [
          {
            "id": "m.growth-funnel.conversion-to-paid",
            "label": "Conversion to paid",
            "value": "5%",
            "note": "% paying users"
          },
          {
            "id": "m.growth-funnel.arpu",
            "label": "ARPU",
            "value": "₹120/user",
            "note": "Revenue per user"
          },
          {
            "id": "m.growth-funnel.arppu",
            "label": "ARPPU",
            "value": "₹850/paying user",
            "note": "Revenue per paying user"
          }
        ]
      },
      {
        "title": "Revenue & Profitability",
        "covers": "Business sustainability and efficiency",
        "facts": [
          {
            "id": "m.growth-funnel.revenue",
            "label": "Revenue",
            "value": "₹2Cr/month",
            "note": "Total topline"
          },
          {
            "id": "m.growth-funnel.gross-margin",
            "label": "Gross margin",
            "value": "42% gross margin",
            "note": "Margin after direct costs"
          },
          {
            "id": "m.growth-funnel.contribution-margin",
            "label": "Contribution margin",
            "value": "20% margin",
            "note": "Profit per order/user"
          },
          {
            "id": "m.growth-funnel.ltv-cac",
            "label": "LTV:CAC",
            "value": "3.4x ratio",
            "note": "Efficiency of growth"
          }
        ]
      }
    ]
  }
];
