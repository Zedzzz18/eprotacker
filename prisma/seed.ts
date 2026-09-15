import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_PASSWORD = "e-PRO2026";

async function main() {
  console.log("Seeding e-PRO Control Tower demo data...");

  // ---------- Countries ----------
  const belgium = await db.country.upsert({
    where: { code: "BE" },
    update: {},
    create: {
      name: "Belgium",
      code: "BE",
      region: "Belux",
      countryOwner: "Sophie Lemaire",
      launchDate: new Date("2026-11-30"),
      legalStatus: "In Progress",
      offerStatus: "Ready",
      crmStatus: "In Progress",
      webStatus: "Not Started",
      communicationStatus: "Ready",
      documentationStatus: "In Progress",
      trainingStatus: "Not Started",
      partnerStatus: "Ready",
      projectStatus: "In Progress",
    },
  });

  const luxembourg = await db.country.upsert({
    where: { code: "LU" },
    update: {},
    create: {
      name: "Luxembourg",
      code: "LU",
      region: "Belux",
      countryOwner: "Marc Weber",
      launchDate: new Date("2026-12-15"),
      legalStatus: "In Progress",
      offerStatus: "In Progress",
      crmStatus: "Not Started",
      webStatus: "Not Started",
      communicationStatus: "In Progress",
      documentationStatus: "Not Started",
      trainingStatus: "Not Started",
      partnerStatus: "Ready",
      projectStatus: "In Progress",
    },
  });

  // ---------- Brands ----------
  const brandNames = [
    "Abarth",
    "Alfa Romeo",
    "Citroën",
    "DS Automobiles",
    "Fiat",
    "Jeep",
    "Lancia",
    "Opel",
    "Peugeot",
  ];
  const brands: Record<string, Awaited<ReturnType<typeof db.brand.upsert>>> = {};
  for (const name of brandNames) {
    brands[name] = await db.brand.upsert({
      where: { name },
      update: {},
      create: {
        name,
        active: true,
        brandOwner: `${name} Brand Team`,
        communicationStrategy:
          name === "Opel" || name === "Peugeot"
            ? "Wallbox included with vehicle purchase during launch period"
            : "Standard charging offer communication",
      },
    });
  }

  // ---------- Partners ----------
  const luminusBe = await db.partner.create({
    data: {
      name: "LUMINUS",
      countryId: belgium.id,
      contact: "partnerships@luminus.be",
      contractStatus: "Signed",
      startDate: new Date("2026-06-01"),
      technology: "e-PRO",
      offer: "Wallbox + charging card + charging subscription",
      technicalIntegration: "Ready",
      commercialOffer: "Ready",
      customerSupport: "Ready",
      sla: "99.5% uptime, 24h support response",
      notes: "Primary Belux charging partner replacing legacy provider.",
    },
  });

  const luminusLu = await db.partner.create({
    data: {
      name: "LUMINUS",
      countryId: luxembourg.id,
      contact: "partnerships@luminus.lu",
      contractStatus: "Signed",
      startDate: new Date("2026-06-01"),
      technology: "e-PRO",
      offer: "Wallbox + charging subscription (no charging card)",
      technicalIntegration: "In Progress",
      commercialOffer: "In Progress",
      customerSupport: "Ready",
      sla: "99.5% uptime, 24h support response",
      notes: "Charging card cannot be offered in Luxembourg due to local regulation.",
    },
  });

  // ---------- Project ----------
  const project = await db.project.create({
    data: {
      name: "e-PRO Charging Partner Transition — Belux",
      description:
        "Migration from the legacy charging partner to LUMINUS / e-PRO technology across Belgium and Luxembourg.",
      status: "In Progress",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-01-31"),
      countries: { create: [{ countryId: belgium.id }, { countryId: luxembourg.id }] },
      brands: { create: brandNames.map((n) => ({ brandId: brands[n].id })) },
    },
  });

  // ---------- Channels ----------
  const channelDefs: { name: string; type: "ONLINE" | "OFFLINE" }[] = [
    { name: "Website", type: "ONLINE" },
    { name: "CRM", type: "ONLINE" },
    { name: "Email", type: "ONLINE" },
    { name: "Social Media", type: "ONLINE" },
    { name: "Mobile App", type: "ONLINE" },
    { name: "Dealer", type: "OFFLINE" },
    { name: "Showroom", type: "OFFLINE" },
    { name: "Salesperson", type: "OFFLINE" },
    { name: "Event", type: "OFFLINE" },
    { name: "Print", type: "OFFLINE" },
    { name: "Training", type: "OFFLINE" },
    { name: "Call Center", type: "OFFLINE" },
  ];
  const channels: Record<string, Awaited<ReturnType<typeof db.channel.upsert>>> = {};
  for (const c of channelDefs) {
    channels[c.name] = await db.channel.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, channelType: c.type, active: true },
    });
  }

  // ---------- Epics & Sub-Epics ----------
  const epicDefs = [
    { name: "Partner", subs: ["Onboarding", "Contract", "Technical Setup", "Commercial Setup", "Customer Support"] },
    { name: "Offer", subs: ["Wallbox", "Charging Card", "Charging Cable", "Voucher", "Local Adaptation"] },
    { name: "Brand Communication", subs: ["Peugeot", "Opel", "DS", "Jeep", "Citroën"] },
    { name: "CRM", subs: ["Customer Journey", "Contact Plan", "Email", "Trigger"] },
    { name: "Web", subs: ["Charging Pages", "Wallbox Pages", "FAQ", "URLs"] },
    { name: "Communication", subs: ["HQ Communication", "Local Communication", "Dealer Communication"] },
    { name: "Legal", subs: ["Legal Review", "Terms & Conditions", "Privacy", "Approval"] },
    { name: "Documentation", subs: ["Product Documentation", "Partner Documentation", "Brand Guideline"] },
    { name: "FAQ", subs: ["Customer FAQ", "Dealer FAQ"] },
    { name: "Launch Readiness", subs: ["Partner Readiness", "Offer Readiness", "CRM Readiness", "Web Readiness"] },
  ];
  const epics: Record<string, Awaited<ReturnType<typeof db.epic.create>>> = {};
  const subEpics: Record<string, Awaited<ReturnType<typeof db.subEpic.create>>> = {};
  for (const e of epicDefs) {
    const epic = await db.epic.create({ data: { name: e.name, projectId: project.id } });
    epics[e.name] = epic;
    for (const s of e.subs) {
      subEpics[`${e.name}/${s}`] = await db.subEpic.create({ data: { name: s, epicId: epic.id } });
    }
  }

  // ---------- Users ----------
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const userDefs = [
    { username: "admin", fullName: "Admin User", scopes: [{ role: "ADMIN" as const }] },
    { username: "hq.belux", fullName: "Isabelle Fontaine (HQ)", scopes: [{ role: "HQ" as const }] },
    {
      username: "local.be",
      fullName: "Sophie Lemaire (Belgium)",
      scopes: [{ role: "LOCAL_COUNTRY" as const, countryId: belgium.id }],
    },
    {
      username: "local.lu",
      fullName: "Marc Weber (Luxembourg)",
      scopes: [{ role: "LOCAL_COUNTRY" as const, countryId: luxembourg.id }],
    },
    {
      username: "brand.ds",
      fullName: "Claire Dubois (DS Brand)",
      scopes: [{ role: "BRAND" as const, brandId: brands["DS Automobiles"].id }],
    },
    {
      username: "crm.be",
      fullName: "Julien Petit (CRM Belgium)",
      scopes: [{ role: "CRM" as const, countryId: belgium.id }],
    },
    {
      username: "legal",
      fullName: "Anne Vermeulen (Legal)",
      scopes: [{ role: "LEGAL" as const }],
    },
    { username: "viewer", fullName: "Guest Viewer", scopes: [{ role: "VIEWER" as const }] },
  ];
  const users: Record<string, Awaited<ReturnType<typeof db.user.create>>> = {};
  for (const u of userDefs) {
    users[u.username] = await db.user.create({
      data: {
        username: u.username,
        fullName: u.fullName,
        passwordHash,
        scopes: { create: u.scopes },
      },
    });
  }

  // ---------- Journeys ----------
  const dsJourney = await db.journey.create({
    data: {
      name: "New Vehicle Customer Journey",
      countryId: belgium.id,
      brandId: brands["DS Automobiles"].id,
      journeyType: "HYBRID",
      targetAudience: "New PHEV vehicle buyers",
      trigger: "Vehicle purchase",
      owner: "Claire Dubois",
      startDate: new Date("2026-09-01"),
      status: "In Progress",
      description: "End-to-end journey from dealer purchase through digital welcome and charging onboarding.",
      steps: {
        create: [
          { name: "Vehicle Purchase", order: 1, channelId: channels.Dealer.id, onlineOffline: "Offline", owner: "Dealer Network", status: "Completed" },
          { name: "Welcome Email", order: 2, channelId: channels.Email.id, onlineOffline: "Online", owner: "Julien Petit", status: "In Progress" },
          { name: "Charging Information", order: 3, channelId: channels.Website.id, onlineOffline: "Online", owner: "Web Team", status: "In Progress" },
          { name: "Wallbox Information", order: 4, channelId: channels.CRM.id, onlineOffline: "Online", owner: "Julien Petit", status: "Not Started" },
          { name: "Charging Card Information", order: 5, channelId: channels.Email.id, onlineOffline: "Online", owner: "Julien Petit", status: "Not Started" },
          { name: "Dealer Follow-up", order: 6, channelId: channels.Dealer.id, onlineOffline: "Offline", owner: "Dealer Network", status: "Not Started" },
        ],
      },
    },
    include: { steps: true },
  });

  const peugeotDealerJourney = await db.journey.create({
    data: {
      name: "Dealer Sales Journey",
      countryId: luxembourg.id,
      brandId: brands.Peugeot.id,
      journeyType: "OFFLINE",
      targetAudience: "In-showroom prospects",
      trigger: "Showroom visit",
      owner: "Marc Weber",
      status: "Not Started",
      description: "Fully offline dealer-led sales journey for Peugeot PHEV models in Luxembourg.",
      steps: {
        create: [
          { name: "Vehicle Presentation", order: 1, channelId: channels.Dealer.id, onlineOffline: "Offline", owner: "Dealer Network", status: "Not Started" },
          { name: "Sales Discussion", order: 2, channelId: channels.Salesperson.id, onlineOffline: "Offline", owner: "Sales Team", status: "Not Started" },
          { name: "Contract Signature", order: 3, channelId: channels.Dealer.id, onlineOffline: "Offline", owner: "Dealer Network", status: "Not Started" },
        ],
      },
    },
    include: { steps: true },
  });

  const opelCrmJourney = await db.journey.create({
    data: {
      name: "Customer Activation Journey",
      countryId: belgium.id,
      brandId: brands.Opel.id,
      journeyType: "ONLINE",
      targetAudience: "Existing PHEV owners",
      trigger: "CRM segment trigger",
      owner: "Julien Petit",
      status: "In Progress",
      description: "CRM-driven activation journey encouraging existing owners to switch to the LUMINUS wallbox offer.",
      steps: {
        create: [
          { name: "CRM Trigger", order: 1, channelId: channels.CRM.id, onlineOffline: "Online", owner: "Julien Petit", status: "In Progress" },
          { name: "Activation Email", order: 2, channelId: channels.Email.id, onlineOffline: "Online", owner: "Julien Petit", status: "Not Started" },
        ],
      },
    },
  });

  // ---------- Tasks ----------
  const taskDefs = [
    {
      title: "Confirm LUMINUS offer",
      description: "Finalise and sign off the commercial offer with LUMINUS for Belux.",
      countryId: belgium.id,
      epicId: epics.Partner.id,
      subEpicId: subEpics["Partner/Commercial Setup"].id,
      ownerId: users["hq.belux"].id,
      assigneeId: users["local.be"].id,
      priority: "CRITICAL" as const,
      status: "COMPLETED" as const,
      dueDate: new Date("2026-08-15"),
      brandIds: brandNames,
    },
    {
      title: "Define Belgium offer",
      description: "Define final wallbox + charging card + subscription offer for Belgium market.",
      countryId: belgium.id,
      epicId: epics.Offer.id,
      subEpicId: subEpics["Offer/Local Adaptation"].id,
      ownerId: users["local.be"].id,
      assigneeId: users["local.be"].id,
      priority: "HIGH" as const,
      status: "COMPLETED" as const,
      dueDate: new Date("2026-09-01"),
      brandIds: brandNames,
    },
    {
      title: "Define Luxembourg offer",
      description: "Define final offer for Luxembourg, accounting for charging card restriction.",
      countryId: luxembourg.id,
      epicId: epics.Offer.id,
      subEpicId: subEpics["Offer/Local Adaptation"].id,
      ownerId: users["local.lu"].id,
      assigneeId: users["local.lu"].id,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-01"),
      brandIds: brandNames,
    },
    {
      title: "Check charging card availability in Luxembourg",
      description: "Confirm with legal whether the charging card can legally be offered in Luxembourg.",
      countryId: luxembourg.id,
      epicId: epics.Legal.id,
      subEpicId: subEpics["Legal/Legal Review"].id,
      ownerId: users.legal.id,
      assigneeId: users.legal.id,
      priority: "HIGH" as const,
      status: "IN_REVIEW" as const,
      dueDate: new Date("2026-10-05"),
      brandIds: [],
    },
    {
      title: "Review wallbox offer",
      description: "Cross-brand review of the new wallbox generation offer.",
      countryId: belgium.id,
      epicId: epics.Offer.id,
      subEpicId: subEpics["Offer/Wallbox"].id,
      ownerId: users["hq.belux"].id,
      assigneeId: users["local.be"].id,
      priority: "MEDIUM" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-10"),
      brandIds: brandNames,
    },
    {
      title: "Review Peugeot communication",
      description: "Review Peugeot-specific wallbox communication assets for the Belux launch.",
      countryId: luxembourg.id,
      journeyId: peugeotDealerJourney.id,
      epicId: epics["Brand Communication"].id,
      subEpicId: subEpics["Brand Communication/Peugeot"].id,
      ownerId: users["local.lu"].id,
      assigneeId: users["local.lu"].id,
      priority: "MEDIUM" as const,
      status: "NOT_STARTED" as const,
      dueDate: new Date("2026-11-01"),
      channelIds: ["Dealer"],
      brandIds: ["Peugeot"],
    },
    {
      title: "Review Opel communication",
      description: "Review Opel wallbox-included campaign messaging.",
      countryId: belgium.id,
      journeyId: opelCrmJourney.id,
      epicId: epics["Brand Communication"].id,
      subEpicId: subEpics["Brand Communication/Opel"].id,
      ownerId: users["local.be"].id,
      assigneeId: users["crm.be"].id,
      priority: "MEDIUM" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-20"),
      channelIds: ["CRM", "Email"],
      brandIds: ["Opel"],
    },
    {
      title: "Review DS CRM Journey",
      description: "Review and validate the DS New Vehicle Customer Journey CRM triggers and content.",
      countryId: belgium.id,
      journeyId: dsJourney.id,
      journeyStepId: dsJourney.steps.find((s) => s.name === "Wallbox Information")?.id,
      epicId: epics.CRM.id,
      subEpicId: subEpics["CRM/Customer Journey"].id,
      ownerId: users["crm.be"].id,
      assigneeId: users["crm.be"].id,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-15"),
      channelIds: ["CRM", "Email"],
      brandIds: ["DS Automobiles"],
    },
    {
      title: "Review Jeep communication",
      description: "Review Jeep-specific charging communication assets.",
      countryId: belgium.id,
      epicId: epics["Brand Communication"].id,
      ownerId: users["local.be"].id,
      assigneeId: users["local.be"].id,
      priority: "LOW" as const,
      status: "NOT_STARTED" as const,
      dueDate: new Date("2026-11-10"),
      brandIds: ["Jeep"],
    },
    {
      title: "Update Wallbox Communication",
      description: "Update DS post-purchase welcome email with new wallbox generation content.",
      countryId: belgium.id,
      journeyId: dsJourney.id,
      journeyStepId: dsJourney.steps.find((s) => s.name === "Welcome Email")?.id,
      epicId: epics.CRM.id,
      subEpicId: subEpics["CRM/Email"].id,
      ownerId: users["crm.be"].id,
      assigneeId: users["crm.be"].id,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-30"),
      channelIds: ["Email"],
      brandIds: ["DS Automobiles"],
    },
    {
      title: "Update Dealer Wallbox Material",
      description: "Update Peugeot dealer POS material with updated wallbox visuals for Luxembourg.",
      countryId: luxembourg.id,
      journeyId: peugeotDealerJourney.id,
      journeyStepId: peugeotDealerJourney.steps.find((s) => s.name === "Vehicle Presentation")?.id,
      epicId: epics.Communication.id,
      subEpicId: subEpics["Communication/Dealer Communication"].id,
      ownerId: users["local.lu"].id,
      assigneeId: users["local.lu"].id,
      priority: "MEDIUM" as const,
      status: "NOT_STARTED" as const,
      dueDate: new Date("2026-11-15"),
      channelIds: ["Dealer", "Print"],
      brandIds: ["Peugeot"],
    },
    {
      title: "Update website",
      description: "Update charging & wallbox pages on the Belgium brand websites.",
      countryId: belgium.id,
      epicId: epics.Web.id,
      subEpicId: subEpics["Web/Charging Pages"].id,
      ownerId: users["local.be"].id,
      assigneeId: users["local.be"].id,
      priority: "HIGH" as const,
      status: "NOT_STARTED" as const,
      dueDate: new Date("2026-11-01"),
      channelIds: ["Website"],
      brandIds: brandNames,
    },
    {
      title: "Update CRM",
      description: "Update CRM contact plan with new wallbox generation triggers.",
      countryId: belgium.id,
      epicId: epics.CRM.id,
      subEpicId: subEpics["CRM/Contact Plan"].id,
      ownerId: users["crm.be"].id,
      assigneeId: users["crm.be"].id,
      priority: "HIGH" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-25"),
      channelIds: ["CRM"],
      brandIds: brandNames,
    },
    {
      title: "Upload legal documentation",
      description: "Upload signed LUMINUS contract and T&Cs to the documentation library.",
      countryId: belgium.id,
      epicId: epics.Documentation.id,
      subEpicId: subEpics["Documentation/Partner Documentation"].id,
      ownerId: users.legal.id,
      assigneeId: users.legal.id,
      priority: "MEDIUM" as const,
      status: "COMPLETED" as const,
      dueDate: new Date("2026-08-20"),
      brandIds: [],
    },
    {
      title: "Create FAQ",
      description: "Draft customer FAQ covering charging card, wallbox, and subscription questions.",
      countryId: belgium.id,
      epicId: epics.FAQ.id,
      subEpicId: subEpics["FAQ/Customer FAQ"].id,
      ownerId: users["local.be"].id,
      assigneeId: users["local.be"].id,
      priority: "MEDIUM" as const,
      status: "IN_PROGRESS" as const,
      dueDate: new Date("2026-10-20"),
      brandIds: [],
    },
    {
      title: "Third-party review",
      description: "Optional external legal review of the LUMINUS partner contract.",
      countryId: belgium.id,
      epicId: epics.Legal.id,
      subEpicId: subEpics["Legal/Legal Review"].id,
      ownerId: users.legal.id,
      assigneeId: users.legal.id,
      priority: "LOW" as const,
      status: "COMPLETED" as const,
      dueDate: new Date("2026-08-10"),
      brandIds: [],
    },
    {
      title: "Legal approval",
      description: "Final legal approval of the Belgium local offer adaptation.",
      countryId: belgium.id,
      epicId: epics.Legal.id,
      subEpicId: subEpics["Legal/Approval"].id,
      ownerId: users.legal.id,
      assigneeId: users.legal.id,
      priority: "CRITICAL" as const,
      status: "IN_REVIEW" as const,
      dueDate: new Date("2026-10-31"),
      brandIds: [],
    },
    {
      title: "Final launch approval",
      description: "HQ sign-off for the Belux go-live readiness.",
      countryId: belgium.id,
      epicId: epics["Launch Readiness"].id,
      ownerId: users["hq.belux"].id,
      assigneeId: users["hq.belux"].id,
      priority: "CRITICAL" as const,
      status: "NOT_STARTED" as const,
      dueDate: new Date("2026-11-25"),
      brandIds: [],
    },
  ];

  const createdTasks: Record<string, Awaited<ReturnType<typeof db.task.create>>> = {};
  for (const t of taskDefs) {
    const brandIds = (t.brandIds ?? []).map((n) => brands[n].id);
    const channelIds = ((t as { channelIds?: string[] }).channelIds ?? []).map((n) => channels[n].id);
    createdTasks[t.title] = await db.task.create({
      data: {
        title: t.title,
        description: t.description,
        projectId: project.id,
        countryId: t.countryId,
        journeyId: (t as { journeyId?: string }).journeyId,
        journeyStepId: (t as { journeyStepId?: string }).journeyStepId,
        epicId: t.epicId,
        subEpicId: t.subEpicId,
        ownerId: t.ownerId,
        assigneeId: t.assigneeId,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        brands: { create: brandIds.map((brandId) => ({ brandId })) },
        channels: { create: channelIds.map((channelId) => ({ channelId })) },
      },
    });
  }

  // A couple of dependencies to demonstrate blocking
  await db.taskDependency.create({
    data: {
      blockerTaskId: createdTasks["Legal approval"].id,
      dependentTaskId: createdTasks["Update website"].id,
    },
  });
  await db.taskDependency.create({
    data: {
      blockerTaskId: createdTasks["Update website"].id,
      dependentTaskId: createdTasks["Update CRM"].id,
    },
  });
  await db.taskDependency.create({
    data: {
      blockerTaskId: createdTasks["Legal approval"].id,
      dependentTaskId: createdTasks["Final launch approval"].id,
    },
  });

  // ---------- Offers: Global vs Local ----------
  const wallboxOffer = await db.offer.create({
    data: {
      name: "New Wallbox Generation",
      scope: "GLOBAL",
      hqOwner: "HQ Charging Team",
      description: "New generation e-PRO compatible wallbox, offered as standard with PHEV purchase.",
      eligibility: "All PHEV / hybrid buyers",
      status: "Active",
      legalStatus: "Approved",
    },
  });
  const chargingCardOffer = await db.offer.create({
    data: {
      name: "Charging Card Included with Wallbox",
      scope: "GLOBAL",
      hqOwner: "HQ Charging Team",
      description: "Charging card bundled at no extra cost with every wallbox purchase.",
      eligibility: "All markets",
      status: "Active",
      legalStatus: "Approved",
    },
  });
  const voucherOffer = await db.offer.create({
    data: {
      name: "Charging Subscription Voucher",
      scope: "GLOBAL",
      hqOwner: "HQ Marketing",
      description: "Discount voucher for the first year of the charging subscription.",
      eligibility: "New vehicle buyers, first 6 months",
      status: "Proposed",
      legalStatus: "In Progress",
    },
  });

  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: wallboxOffer.id,
      countryId: belgium.id,
      localBenefit: "Included",
      decision: "YES",
      decisionOwner: "Sophie Lemaire",
    },
  });
  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: wallboxOffer.id,
      countryId: luxembourg.id,
      localBenefit: "Included",
      decision: "YES",
      decisionOwner: "Marc Weber",
    },
  });
  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: chargingCardOffer.id,
      countryId: belgium.id,
      decision: "YES",
      decisionOwner: "Sophie Lemaire",
    },
  });
  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: chargingCardOffer.id,
      countryId: luxembourg.id,
      localRestriction: "Charging card cannot be offered under Luxembourg consumer regulation.",
      decision: "NO",
      decisionOwner: "Marc Weber",
      localLegalRequirement: "Confirmed with local legal counsel — see Legal epic.",
    },
  });
  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: voucherOffer.id,
      countryId: belgium.id,
      decision: "TBD",
      decisionOwner: "Sophie Lemaire",
    },
  });
  await db.localOfferAdaptation.create({
    data: {
      globalOfferId: voucherOffer.id,
      countryId: luxembourg.id,
      decision: "Pending",
      decisionOwner: "Marc Weber",
    },
  });

  // ---------- FAQ ----------
  await db.faq.create({
    data: {
      question: "Is the charging card included with the wallbox?",
      globalAnswer: "Yes, the charging card is included with every wallbox purchase.",
      localAnswer: "No — the charging card cannot be offered in Luxembourg due to local regulation.",
      countryId: luxembourg.id,
      category: "Offer",
      owner: "Marc Weber",
      status: "Published",
      legalApproval: "Approved",
    },
  });
  await db.faq.create({
    data: {
      question: "Is the charging card included with the wallbox?",
      globalAnswer: "Yes, the charging card is included with every wallbox purchase.",
      localAnswer: "Yes.",
      countryId: belgium.id,
      category: "Offer",
      owner: "Sophie Lemaire",
      status: "Published",
      legalApproval: "Approved",
    },
  });
  await db.faq.create({
    data: {
      question: "How long does wallbox installation take?",
      globalAnswer: "Installation typically takes 2-4 hours by a certified LUMINUS technician.",
      countryId: belgium.id,
      category: "Installation",
      owner: "Sophie Lemaire",
      status: "Draft",
      legalApproval: "Pending",
    },
  });

  // ---------- Risks ----------
  await db.risk.create({
    data: {
      title: "Charging card legal restriction in Luxembourg",
      description: "Local regulation prevents bundling the charging card with the wallbox in Luxembourg, requiring a distinct customer communication.",
      countryId: luxembourg.id,
      owner: "Marc Weber",
      impact: "High",
      probability: "High",
      severity: "High",
      mitigation: "Country-specific FAQ and CRM messaging already documented; legal sign-off in progress.",
      deadline: new Date("2026-10-31"),
      status: "Open",
    },
  });
  await db.risk.create({
    data: {
      title: "Website content delay for Belgium",
      description: "Charging and wallbox page updates have not started and are on the critical path to CRM go-live.",
      countryId: belgium.id,
      owner: "Sophie Lemaire",
      impact: "Medium",
      probability: "Medium",
      severity: "Medium",
      mitigation: "Escalated to Web team; legal approval prioritised to unblock content.",
      deadline: new Date("2026-11-01"),
      status: "Open",
    },
  });

  // ---------- Documents ----------
  await db.document.create({
    data: {
      name: "LUMINUS Partner Contract (signed)",
      category: "Partner",
      countryId: belgium.id,
      partnerId: luminusBe.id,
      status: "Approved",
      ownerId: users.legal.id,
    },
  });
  await db.document.create({
    data: {
      name: "Belux Brand Communication Guidelines",
      category: "Brand Guideline",
      countryId: belgium.id,
      status: "In Review",
      ownerId: users["local.be"].id,
    },
  });

  // ---------- RACI ----------
  const raciDefs = [
    { action: "Global offer", role: "HQ", raciType: "A/R" },
    { action: "Global offer", role: "Local", raciType: "C" },
    { action: "Global offer", role: "Brand", raciType: "C" },
    { action: "Global offer", role: "Legal", raciType: "C" },
    { action: "Global offer", role: "Partner", raciType: "I" },
    { action: "Local adaptation", role: "HQ", raciType: "C" },
    { action: "Local adaptation", role: "Local", raciType: "A/R" },
    { action: "Local adaptation", role: "Brand", raciType: "R" },
    { action: "Local adaptation", role: "Legal", raciType: "C" },
    { action: "Local adaptation", role: "Partner", raciType: "C" },
    { action: "Legal validation", role: "HQ", raciType: "I" },
    { action: "Legal validation", role: "Local", raciType: "R" },
    { action: "Legal validation", role: "Brand", raciType: "C" },
    { action: "Legal validation", role: "Legal", raciType: "A" },
    { action: "Legal validation", role: "Partner", raciType: "I" },
    { action: "Web page", role: "HQ", raciType: "C" },
    { action: "Web page", role: "Local", raciType: "R" },
    { action: "Web page", role: "Brand", raciType: "A" },
    { action: "Web page", role: "Legal", raciType: "C" },
    { action: "Web page", role: "Partner", raciType: "I" },
    { action: "CRM", role: "HQ", raciType: "C" },
    { action: "CRM", role: "Local", raciType: "R" },
    { action: "CRM", role: "Brand", raciType: "A" },
    { action: "CRM", role: "Legal", raciType: "C" },
    { action: "CRM", role: "Partner", raciType: "I" },
    { action: "Partner setup", role: "HQ", raciType: "C" },
    { action: "Partner setup", role: "Local", raciType: "A/R" },
    { action: "Partner setup", role: "Brand", raciType: "I" },
    { action: "Partner setup", role: "Legal", raciType: "C" },
    { action: "Partner setup", role: "Partner", raciType: "R" },
  ];
  await db.raciAssignment.createMany({ data: raciDefs });

  // ---------- Milestones ----------
  await db.milestone.createMany({
    data: [
      { name: "Partner confirmed", projectId: project.id, dueDate: new Date("2026-08-15"), status: "Completed" },
      { name: "Offer confirmed", projectId: project.id, dueDate: new Date("2026-09-15"), status: "Completed" },
      { name: "Legal approved", projectId: project.id, dueDate: new Date("2026-10-31"), status: "In Progress" },
      { name: "Web ready", projectId: project.id, dueDate: new Date("2026-11-05"), status: "Not Started" },
      { name: "CRM ready", projectId: project.id, dueDate: new Date("2026-11-10"), status: "Not Started" },
      { name: "Communication ready", projectId: project.id, dueDate: new Date("2026-11-15"), status: "Not Started" },
      { name: "Launch", projectId: project.id, dueDate: new Date("2026-11-30"), status: "Not Started" },
      { name: "Post-launch review", projectId: project.id, dueDate: new Date("2026-12-31"), status: "Not Started" },
    ],
  });

  console.log("Seed complete.");
  console.log(`Demo accounts (password: ${DEMO_PASSWORD}): ${userDefs.map((u) => u.username).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
