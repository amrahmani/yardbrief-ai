import { ProductType } from "@/types/yardbrief";
import { productTypes } from "@/data/productTypes";
import type {
  DashboardStat,
  FormSection,
  PricingPlan,
  ProductRoadmapItem,
  Project,
  Report,
  ReportTypeOption,
  SettingsPanel,
} from "@/types/yardbrief";

const roadmapSummaries: Record<ProductType, string> = {
  [ProductType.YardBrief]:
    "Capture site visits, shape a design brief, and send polished client reports.",
  [ProductType.DecorBrief]:
    "Translate room walkthroughs into concept boards, notes, and handoff-ready briefs.",
  [ProductType.KitchenBrief]:
    "Structure renovation scope, selections, and client approvals in one workflow.",
  [ProductType.EventBrief]:
    "Turn venue visits into cohesive creative direction, staging notes, and delivery packs.",
};

export const platformRoadmap: ProductRoadmapItem[] = productTypes.map((product) => ({
  name: product.product_name,
  audience: product.target_user,
  status: product.enabled ? "Live now" : "Coming soon",
  summary: roadmapSummaries[product.product_type],
}));

export const mockProjects: Project[] = [
  {
    id: "oak-house",
    name: "Oak House Front Garden",
    clientName: "Harris Family",
    clientNickname: "Harris family",
    location: "Willoughby, NSW",
    siteType: "Front garden",
    briefType: "Concept brief",
    summary:
      "Refresh a sloped front garden with native planting, layered privacy, and easier guest access from the street.",
    notes:
      "Clients want the arrival to feel calmer and less exposed from the street. They are open to staged work if drainage and screening are handled first.",
    stage: "Design brief",
    status: "Active",
    budgetRange: "$28k - $40k",
    dueDate: "12 May 2026",
    lastUpdated: "1 May 2026",
    tags: ["Native palette", "Street appeal", "Low water"],
    metrics: [
      { label: "Budget", value: "$28k - $40k", detail: "Aligned to staged implementation" },
      { label: "Report due", value: "12 May", detail: "Client concept brief" },
      { label: "Site size", value: "310 sqm", detail: "Frontage plus side path" },
    ],
    goals: [
      "Create a stronger arrival sequence from the driveway to the porch.",
      "Improve privacy from the street without blocking northern light.",
      "Reduce lawn area in favour of lower-maintenance planting bands.",
    ],
    deliverables: [
      "Concept narrative",
      "Planting mood direction",
      "Site constraints summary",
      "Stage-one cost guidance",
    ],
    timeline: [
      { label: "Lead captured", date: "21 Apr", detail: "Initial enquiry approved for paid consult." },
      { label: "Site visit", date: "3 May", detail: "On-site notes and photo set booked." },
      { label: "Draft report", date: "9 May", detail: "Share first design brief internally." },
      { label: "Client review", date: "12 May", detail: "Send polished report for sign-off." },
    ],
    siteVisit: {
      scheduledFor: "Sunday, 3 May at 9:30 AM",
      lead: "Lina Ortega",
      attendees: ["Lina Ortega", "Jess Harris", "Tom Harris"],
      checklist: [
        "Confirm utilities and drainage outlets.",
        "Photograph street approach and boundary conditions.",
        "Measure porch, side path, and driveway taper points.",
        "Note maintenance concerns from current planting.",
      ],
      observations: [
        { label: "Sun", value: "Strong morning sun, shaded by neighbouring canopy after 2 PM." },
        { label: "Slope", value: "Approximate 650 mm fall from porch to kerb." },
        { label: "Drainage", value: "Runoff pools along the driveway edge during heavy rain." },
        { label: "Material cue", value: "Existing brick and sandstone details worth echoing." },
      ],
      constraints: [
        "Letterbox and existing services limit hardscape width at the front boundary.",
        "Clients want to keep sight lines from the kitchen to the street.",
        "Current irrigation can stay only if planters remain in the same zones.",
      ],
      opportunities: [
        "Terraced planting can soften the slope while framing the porch.",
        "A widened path improves access and gives room for layered screening.",
        "Feature pots near the entry can bring colour without major construction.",
      ],
      equipment: ["Laser measure", "Phone photo set", "Voice note summary", "Sketch overlay"],
      photos: [
        { label: "Street elevation", caption: "Capture how the façade reads from the curb." },
        { label: "Driveway edge", caption: "Document runoff path and paving wear." },
        { label: "Entry view", caption: "Record focal points from porch to gate." },
      ],
    },
    recentSiteVisits: [
      {
        id: "oak-house-initial",
        title: "Initial frontage walkthrough",
        date: "21 Apr 2026",
        lead: "Lina Ortega",
        summary:
          "Captured street approach, slope concerns, and the clients' priority for privacy without heavy screening.",
      },
      {
        id: "oak-house-followup",
        title: "Measurement and drainage check",
        date: "1 May 2026",
        lead: "Lina Ortega",
        summary:
          "Confirmed driveway runoff path and porch-to-gate dimensions before drafting the concept brief.",
      },
    ],
    reports: [
      {
        id: "concept-brief-v1",
        title: "Concept Brief V1",
        type: "Concept brief",
        status: "Ready to send",
        createdAt: "28 Apr 2026",
        updatedAt: "1 May 2026",
        audience: "Homeowner",
        summary:
          "An early narrative that frames the site visit, core constraints, and the front garden direction before design development begins.",
        highlights: [
          "Shift the front garden toward a native, textural palette with controlled screening.",
          "Open the entry sequence with a wider path and fewer competing focal points.",
          "Treat drainage and slope early so planting recommendations remain realistic.",
        ],
        sections: [
          {
            title: "Design direction",
            body:
              "The proposal leans into a calm, layered streetscape with low-water planting and a stronger sense of arrival.",
            bullets: [
              "Use foliage contrast rather than bright flowering as the main visual device.",
              "Echo sandstone and brick tones through path edging and pots.",
            ],
          },
          {
            title: "Site risks",
            body:
              "Drainage and service positions will influence where new retaining and edging can sit.",
            bullets: [
              "Verify runoff path before locking hardscape widths.",
              "Allow planting zones to work with existing irrigation lines where possible.",
            ],
          },
        ],
        nextSteps: [
          "Run the site visit and confirm dimensions.",
          "Translate observations into a refined concept brief V2.",
        ],
      },
      {
        id: "site-summary",
        title: "Site Visit Summary",
        type: "Site summary",
        status: "Drafting",
        createdAt: "2 May 2026",
        updatedAt: "2 May 2026",
        audience: "Internal",
        summary:
          "Internal summary page used to consolidate the key site conditions and photo references before drafting the client-facing report.",
        highlights: [
          "The northern light is a strength and should not be over-screened.",
          "Driveway runoff is the main technical constraint.",
        ],
        sections: [
          {
            title: "Captured notes",
            body: "Initial notes align with the discovery call and support a staged front-yard refresh.",
            bullets: [
              "Street appeal is a priority before backyard work.",
              "The family wants minimal weekly maintenance.",
            ],
          },
        ],
        nextSteps: ["Add dimension checks after the on-site visit."],
      },
    ],
  },
  {
    id: "courtyard-loop",
    name: "Courtyard Loop Upgrade",
    clientName: "Riverview Retreat",
    clientNickname: "Riverview",
    location: "Lane Cove, NSW",
    siteType: "Hospitality courtyard",
    briefType: "Planting report",
    summary:
      "Reconnect a tired courtyard loop with softer planting, improved wayfinding, and hospitality-friendly maintenance notes.",
    notes:
      "The client needs a planting direction that looks polished for guests but remains easy for staff to maintain during active service hours.",
    stage: "Site visit",
    status: "Awaiting site visit",
    budgetRange: "$16k - $24k",
    dueDate: "18 May 2026",
    lastUpdated: "2 May 2026",
    tags: ["Hospitality", "Shade tolerant", "Wayfinding"],
    metrics: [
      { label: "Budget", value: "$16k - $24k", detail: "Client wants options in stages" },
      { label: "Visit booked", value: "6 May", detail: "Morning walkthrough" },
      { label: "Beds", value: "7 zones", detail: "Includes entry and courtyard loop" },
    ],
    goals: [
      "Bring cohesion to fragmented planting beds.",
      "Improve guest legibility through the courtyard loop.",
      "Build a practical maintenance summary for staff handover.",
    ],
    deliverables: ["Planting report", "Maintenance notes", "Priority works list"],
    timeline: [
      { label: "Discovery call", date: "25 Apr", detail: "Operations manager confirmed scope." },
      { label: "Site visit", date: "6 May", detail: "Capture shade and circulation notes." },
      { label: "Report assembly", date: "12 May", detail: "Draft planting summary." },
      { label: "Client send", date: "18 May", detail: "Deliver first report." },
    ],
    siteVisit: {
      scheduledFor: "Wednesday, 6 May at 8:00 AM",
      lead: "Lina Ortega",
      attendees: ["Lina Ortega", "Mina Doyle"],
      checklist: [
        "Document guest circulation pinch points.",
        "Log deep-shade areas and reflected heat pockets.",
        "Check irrigation coverage across looping beds.",
      ],
      observations: [
        { label: "Shade", value: "Dense afternoon shade under the western canopy." },
        { label: "Traffic", value: "Guests cut through mulch beds near the café edge." },
      ],
      constraints: [
        "Beds remain open during trade, so works staging matters.",
        "Planting must cope with occasional foot traffic and compaction.",
      ],
      opportunities: [
        "Low edging and clearer path markers can reduce shortcutting.",
        "Shade-loving foliage can provide a stronger identity through the loop.",
      ],
      equipment: ["Shade map", "Irrigation checklist", "Photo walkthrough"],
      photos: [
        { label: "Loop junction", caption: "Guest decision point beside café seating." },
        { label: "West bed", caption: "Deep shade under mature canopy." },
        { label: "Entry line", caption: "How the courtyard is read on approach." },
      ],
    },
    recentSiteVisits: [
      {
        id: "courtyard-loop-scout",
        title: "Pre-quote scout visit",
        date: "25 Apr 2026",
        lead: "Lina Ortega",
        summary:
          "Flagged circulation pinch points and identified the shaded western beds as the highest-risk zones.",
      },
    ],
    reports: [
      {
        id: "planting-outline",
        title: "Planting Outline",
        type: "Planting report",
        status: "Drafting",
        createdAt: "30 Apr 2026",
        updatedAt: "2 May 2026",
        audience: "Operations team",
        summary:
          "Outline structure for a hospitality-focused planting plan with care notes and zone priorities.",
        highlights: [
          "Need stronger evergreen structure in the shaded beds.",
          "Circulation fixes should be paired with planting changes.",
        ],
        sections: [
          {
            title: "Hospitality lens",
            body:
              "Every planting recommendation should balance visual calm with durability and operational simplicity.",
            bullets: ["Avoid species with heavy litter around seating.", "Keep sight lines clear at junctions."],
          },
        ],
        nextSteps: ["Complete the site visit photo set.", "Confirm irrigation constraints with staff."],
      },
    ],
  },
  {
    id: "harbour-row",
    name: "Harbour Row Entry Sequence",
    clientName: "Sutherland Residence",
    clientNickname: "Sutherland residence",
    location: "Mosman, NSW",
    siteType: "Urban entry frontage",
    briefType: "Presentation report",
    summary:
      "Refine the entry walk, pots, and layered screening around a compact urban frontage with strong architectural lines.",
    notes:
      "The homeowner prefers a restrained look with stronger entry definition, minimal demolition, and a neat presentation pack for quick approval.",
    stage: "Client review",
    status: "Report ready",
    budgetRange: "$22k - $30k",
    dueDate: "7 May 2026",
    lastUpdated: "1 May 2026",
    tags: ["Urban frontage", "Architectural", "Pots and screening"],
    metrics: [
      { label: "Budget", value: "$22k - $30k", detail: "Presentation-ready scope" },
      { label: "Review", value: "7 May", detail: "Waiting on client comments" },
      { label: "Report", value: "Final draft", detail: "Ready to share" },
    ],
    goals: [
      "Tighten the visual sequence from gate to front door.",
      "Use pots to bring softness without major structural work.",
      "Balance privacy with the existing architecture.",
    ],
    deliverables: ["Presentation report", "Mood cues", "Implementation priorities"],
    timeline: [
      { label: "Site visit", date: "14 Apr", detail: "Measured frontage and pot positions." },
      { label: "Draft report", date: "26 Apr", detail: "Internal markup complete." },
      { label: "Final polish", date: "1 May", detail: "Report updated for client send." },
      { label: "Review window", date: "7 May", detail: "Awaiting feedback." },
    ],
    siteVisit: {
      scheduledFor: "Completed on Tuesday, 14 April",
      lead: "Lina Ortega",
      attendees: ["Lina Ortega", "Elliot Sutherland"],
      checklist: [
        "Measure gate offset and existing planter widths.",
        "Check reflected heat from the rendered walls.",
      ],
      observations: [
        { label: "Scale", value: "Compact footprint, but strong vertical walls create a gallery-like approach." },
        { label: "Climate", value: "Wind exposure along the upper edge needs hardier screening." },
      ],
      constraints: [
        "Existing paving remains in place.",
        "No appetite for structural retaining or major demolition.",
      ],
      opportunities: [
        "Oversized pots can become the main sculptural gesture.",
        "A restrained evergreen palette will suit the architecture.",
      ],
      equipment: ["Annotated photos", "Plan overlay", "Material notes"],
      photos: [
        { label: "Gate view", caption: "Primary arrival moment from the street." },
        { label: "Door approach", caption: "Compression point near the front threshold." },
        { label: "Wind edge", caption: "Upper corner that needs tougher screening." },
      ],
    },
    recentSiteVisits: [
      {
        id: "harbour-row-site-visit",
        title: "Primary site visit",
        date: "14 Apr 2026",
        lead: "Lina Ortega",
        summary:
          "Measured gate offset, documented wind exposure, and photographed the strongest threshold views for the presentation pack.",
      },
      {
        id: "harbour-row-review",
        title: "Final review pass",
        date: "1 May 2026",
        lead: "Lina Ortega",
        summary:
          "Checked pot placement logic and tightened the screening recommendations before client send.",
      },
    ],
    reports: [
      {
        id: "presentation-pack",
        title: "Presentation Pack",
        type: "Presentation report",
        status: "Shared",
        createdAt: "20 Apr 2026",
        updatedAt: "1 May 2026",
        audience: "Homeowner",
        summary:
          "A client-facing deck-style report that packages the entry sequence concept, planting cues, and staged recommendations.",
        highlights: [
          "Feature pots anchor the design without rebuilding the frontage.",
          "A limited evergreen palette keeps the outcome architectural and calm.",
          "Screening is focused only where privacy improves the arrival experience.",
        ],
        sections: [
          {
            title: "Arrival story",
            body:
              "The concept sharpens the procession from gate to front door using fewer but more deliberate elements.",
            bullets: [
              "Create one hero threshold moment with paired pots.",
              "Reserve screening for the exposed upper edge.",
            ],
          },
          {
            title: "Implementation notes",
            body:
              "Staging begins with pots and screening, followed by finer planting adjustments once the client confirms the palette.",
            bullets: [
              "Retain existing paving.",
              "Specify low-litter evergreen species with strong structure.",
            ],
          },
        ],
        nextSteps: ["Collect client feedback.", "Prepare implementation-ready plant schedule if approved."],
      },
    ],
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    starterPrice: "$0",
    cadenceLabel: "starter plan",
    summary:
      "Best for trying YardBrief AI with a small number of active jobs and basic export needs.",
    ctaLabel: "Start Free",
    features: [
      "2 projects",
      "5 reports per month",
      "Basic report templates",
      "PDF export with YardBrief watermark",
    ],
  },
  {
    key: "solo",
    name: "Solo",
    monthlyPrice: "AUD $12.99",
    yearlyPrice: "AUD $129.99",
    cadenceLabel: "solo subscription",
    summary:
      "For individual landscapers who want more project capacity and polished client-ready outputs.",
    ctaLabel: "Upgrade to Solo",
    features: [
      "20 projects",
      "50 AI-generated reports per month",
      "No watermark",
      "PDF export",
      "Client approval messages",
      "Aftercare guides",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthlyPrice: "AUD $29.99",
    yearlyPrice: "AUD $299.99",
    cadenceLabel: "pro subscription",
    summary:
      "For growing landscape studios that want branded outputs, saved templates, and broader report coverage.",
    featured: true,
    ctaLabel: "Upgrade to Pro",
    features: [
      "Unlimited projects",
      "200 AI-generated reports per month",
      "Business logo on PDF",
      "Custom business details",
      "Saved report templates",
      "Before/after reports",
      "Change request notes",
      "Quote-ready summaries",
    ],
  },
  {
    key: "team",
    name: "Team",
    monthlyPrice: "AUD $79",
    yearlyPrice: "AUD $790",
    cadenceLabel: "team subscription",
    summary:
      "For teams that need a shared YardBrief workspace today and room for future cloud collaboration.",
    ctaLabel: "Upgrade to Team",
    features: [
      "Team workspace",
      "Multiple users",
      "Shared projects",
      "Team report templates",
      "Business branding",
      "Higher AI usage limit",
      "Future cloud sync",
    ],
  },
];

export const settingsPanels: SettingsPanel[] = [
  {
    title: "Studio profile",
    description: "The basics that will eventually shape outbound reports and future templates.",
    items: [
      { label: "Studio name", value: "YardBrief Demo Studio" },
      { label: "Primary service area", value: "Sydney lower north shore" },
      { label: "Brand tone", value: "Warm, practical, client-friendly" },
    ],
  },
  {
    title: "Report defaults",
    description: "Starting preferences for how project insights are framed in the YardBrief flow.",
    items: [
      { label: "Default report type", value: "Concept brief" },
      { label: "Site-visit output", value: "Summary with constraints and opportunities" },
      { label: "Cost guidance", value: "Always include staged budget bands" },
    ],
  },
  {
    title: "Notifications",
    description: "Mock preferences for reminders and report handoff points.",
    items: [
      { label: "Upcoming site visits", value: "24 hours before" },
      { label: "Draft report reminders", value: "Two working days before due date" },
      { label: "Client review follow-up", value: "Three days after report send" },
    ],
  },
];

export const newProjectSections: FormSection[] = [
  {
    title: "Client and property",
    description: "Capture the basics so the brief starts with the right context.",
    fields: [
      {
        label: "Project name",
        placeholder: "Rose Bay entry refresh",
        helper: "Use a clear internal label for the job.",
      },
      {
        label: "Client name",
        placeholder: "Jordan Lee",
        helper: "Who signs off on the brief and report?",
      },
      {
        label: "Location",
        placeholder: "Rose Bay, NSW",
        helper: "Suburb is enough for the starter workflow.",
      },
    ],
  },
  {
    title: "Scope and goals",
    description: "Shape the brief around the parts of the site that matter first.",
    fields: [
      {
        label: "Brief type",
        placeholder: "Select a brief type",
        helper: "This will later steer templates and report sections.",
        type: "select",
        options: ["Concept brief", "Planting report", "Presentation report", "Site summary"],
      },
      {
        label: "Top goals",
        placeholder: "Improve street appeal, simplify maintenance, add privacy...",
        helper: "Separate priorities with commas or short phrases.",
        type: "textarea",
      },
      {
        label: "Budget range",
        placeholder: "$20k - $35k",
        helper: "Rough bands are enough at this stage.",
      },
    ],
  },
  {
    title: "Delivery rhythm",
    description: "Lock the milestones that keep the brief moving.",
    fields: [
      {
        label: "Site visit date",
        placeholder: "Tuesday, 12 May",
        helper: "Useful for reminders and report pacing later.",
      },
      {
        label: "Report due date",
        placeholder: "Friday, 22 May",
        helper: "Client-facing date for the first polished report.",
      },
      {
        label: "Deliverables",
        placeholder: "Concept narrative, constraints summary, staged cost guide",
        helper: "List the outputs you plan to send.",
        type: "textarea",
      },
    ],
  },
];

export const reportTypeOptions: ReportTypeOption[] = [
  {
    name: "Concept brief",
    summary: "Best for early-stage projects that need narrative direction and scope framing.",
    output: "Client-ready summary with priorities, risks, and next steps.",
  },
  {
    name: "Site summary",
    summary: "Use right after a site visit to consolidate field notes and constraints.",
    output: "Internal or client-facing capture of what was observed on site.",
  },
  {
    name: "Planting report",
    summary: "Focused on bed-by-bed recommendations, care notes, and material logic.",
    output: "A clear report that supports implementation and maintenance.",
  },
];

export const reportBlueprint = [
  "Context and site snapshot",
  "Goals and client priorities",
  "Constraints and opportunities",
  "Design direction",
  "Recommendations and next steps",
];

export function getProjects() {
  return mockProjects;
}

export function getProject(id: string) {
  return mockProjects.find((project) => project.id === id);
}

export function getReport(projectId: string, reportId: string): Report | undefined {
  return getProject(projectId)?.reports.find((report) => report.id === reportId);
}

export function getDashboardStats(): DashboardStat[] {
  const readyReports = mockProjects.flatMap((project) => project.reports).filter((report) => report.status !== "Drafting");

  return [
    {
      label: "Active briefs",
      value: String(mockProjects.length),
      detail: "YardBrief projects currently in the mocked pipeline.",
    },
    {
      label: "Ready reports",
      value: String(readyReports.length),
      detail: "Reports at ready-to-send or shared stage.",
    },
    {
      label: "Upcoming visits",
      value: "2",
      detail: "Site walks booked for the next seven days.",
    },
    {
      label: "Future products",
      value: "3",
      detail: "SpaceBrief products already mapped for later rollout.",
    },
  ];
}

export function getRecentReports() {
  return mockProjects
    .flatMap((project) =>
      project.reports.map((report) => ({
        projectId: project.id,
        projectName: project.name,
        report,
      })),
    )
    .slice(0, 4);
}
