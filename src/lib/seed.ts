// Mock seed data — 6 demo WOs covering every state the technician UI must render.
import type { WorkOrder, TechUser, SLASnapshot, LineItem } from "./types";

const TECH_ID = "tech-001";
const TECH_NAME = "Mike Reynolds";

export const SEED_USER: TechUser = {
  id: TECH_ID,
  fullName: "Mike Reynolds",
  username: "mreynolds",
  email: "mike.reynolds@mccarthytire.com",
  phone: "(570) 555-0142",
  role: "Technician",
  memberSince: "2024-08-12",
};

const bridgestoneSLA: SLASnapshot = {
  poRequired: true,
  poObtainMethod: "Email",
  poContact: "dispatch@bridgestone-na.com",
  preServicePhotoSlots: [
    {
      label: "Vehicle at Location",
      description: "Overall vehicle condition on arrival",
      required: true,
    },
    {
      label: "Damaged Tire — Position",
      description: "Tire to be replaced, wheel position visible",
      required: true,
    },
    {
      label: "Damaged Tire — Sidewall",
      description: "DOT and sidewall markings",
      required: true,
    },
    {
      label: "Odometer Reading",
      description: "Dashboard odometer photo",
      required: false,
    },
  ],
  postServicePhotoSlots: [
    {
      label: "New Tire Installed — On Tire",
      description: "Mounted tire, brand and position visible",
      required: true,
    },
    {
      label: "Off Tire — Sidewall Markings",
      description: "Removed tire DOT and damage",
      required: true,
    },
    {
      label: "Completed Wheel Position",
      description: "Final installed state, wheel and lug nuts",
      required: true,
    },
    {
      label: "Torque Verification",
      description: "Torque wrench reading on lug nut",
      required: false,
    },
  ],
  responseTimeSlaMinutes: 60,
  completionTimeSlaMinutes: 240,
  specialHandlingMessages: [
    "Bridgestone fleet contract: Drive Tire DOT verification required on every WO.",
    "Photograph off-tire DOT before removal.",
    "Record on-tire DOT before mounting.",
    "Tread depth measurement recommended for compliance audit (optional).",
    "Flag any tire below 4/32nds DOT minimum in service notes.",
    "Below-minimum tires queued for fleet replacement planning.",
  ],
  otherFields: [
    { label: "Account Manager", value: "Sangita Patra (ext. 247)" },
  ],
};

const swiftSLA: SLASnapshot = {
  poRequired: true,
  poObtainMethod: "Fax",
  poContact: "(602) 555-0199",
  preServicePhotoSlots: [
    {
      label: "Vehicle at Location",
      description: "Overall vehicle condition on arrival",
      required: true,
    },
    {
      label: "Tire — Pre-Service",
      description: "Tire to be serviced",
      required: true,
    },
  ],
  postServicePhotoSlots: [
    {
      label: "Tire — Post-Service",
      description: "Repaired or replaced tire",
      required: true,
    },
    {
      label: "Completed Wheel",
      description: "Final state",
      required: true,
    },
  ],
  responseTimeSlaMinutes: 90,
  completionTimeSlaMinutes: 180,
  specialHandlingMessages: [
    "USE BRIDGESTONE OR EQUIVALENT ONLY",
    "PHOTO OF TORQUE WRENCH REQUIRED",
  ],
};

const walkInSLA: SLASnapshot = {
  poRequired: false,
  preServicePhotoSlots: [
    {
      label: "Vehicle at Location",
      description: "Vehicle condition on arrival",
      required: false,
    },
  ],
  postServicePhotoSlots: [
    {
      label: "Completed Work",
      description: "Final state",
      required: false,
    },
  ],
  responseTimeSlaMinutes: 60,
  completionTimeSlaMinutes: 180,
  specialHandlingMessages: [
    "DOT-compliant tire installation per FMCSA §393.75 required.",
    "Document tire sidewall markings on every replacement.",
    "Document DOT number on every replacement.",
    "Inspect torque values at 50-mile intervals for first 200 miles.",
    "Submit sidewall-angle photos of all installed tires within 24 hours.",
    "Photo documentation failure results in WO rejection by Billing Agent.",
  ],
};

const jbHuntSLA: SLASnapshot = {
  poRequired: true,
  poObtainMethod: "Email",
  poContact: "(479) 820-0000",
  preServicePhotoSlots: [
    {
      label: "Vehicle at Location",
      description: "Overall vehicle on arrival",
      required: true,
    },
    {
      label: "Trailer ID Plate",
      description: "JB Hunt asset tracking plate, legible",
      required: true,
    },
    {
      label: "Tire — Pre-Service",
      description: "Tire to be serviced",
      required: true,
    },
  ],
  postServicePhotoSlots: [
    {
      label: "Tire — Post-Service",
      description: "Repaired or replaced tire",
      required: true,
    },
    {
      label: "Completed Wheel",
      description: "Final state",
      required: true,
    },
    {
      label: "Brake Adjustment Verification",
      description: "Brake stroke measurement",
      required: false,
    },
  ],
  responseTimeSlaMinutes: 90,
  completionTimeSlaMinutes: 240,
  specialHandlingMessages: [
    "Confirm trailer brake adjustment at each service touch per 49 CFR §393.47.",
    "Verify brake stroke length and document on the WO.",
    "Note trailer reflective tape condition; degradation requires labor code TR-LBL-12.",
    "Photo of trailer ID plate required for asset tracking.",
    "DOT-on photos required for ALL drive tires — no exceptions for rotations.",
    "DOT-off photos required for ALL drive tires — no exceptions for rotations.",
  ],
};

function tireLine(
  id: string,
  position: LineItem["axlePosition"],
  desc: string,
  dispatcherNotes?: string,
): LineItem {
  return {
    id,
    serviceCode: "T-REPL",
    description: desc,
    quantity: 1,
    isTire: true,
    axlePosition: position,
    dispatcherNotes,
  };
}

function laborLine(
  id: string,
  desc: string,
  hours: number,
  dispatcherNotes?: string,
): LineItem {
  return {
    id,
    serviceCode: "LBR-RS",
    description: desc,
    quantity: hours,
    isTire: false,
    dispatcherNotes,
  };
}

const isoOffset = (mins: number): string =>
  new Date(Date.now() + mins * 60_000).toISOString();

export function seedWorkOrders(): WorkOrder[] {
  return [
    // 1. UPCOMING — Emergency Bridgestone event, fresh assignment
    {
      id: "wo-1",
      number: "WO-50124",
      customerName: "Bridgestone Trucking (Reach event)",
      customerAccountNumber: "BRI-4471",
      customerContact: "Reach Dispatch (888) 555-7321",
      serviceLocation: "I-81 N Mile Marker 192, Hazleton PA",
      driverName: "Carlos Mendez",
      driverPhone: "(570) 555-3308",
      tractorNumber: "T-44192",
      trailerNumber: "TR-7821",
      problemType: "Roadside — Blown drive tire",
      unitNumber: "DRV-RT-OUTER",
      isEmergency: true,
      scheduledTime: isoOffset(15),
      serviceTarget: "tractor",
      breakdownLocationNotes:
        "Truck stopped on I-81 northbound shoulder, mile marker 192. Hazards on. Driver waiting in cab.",
      dispatcherServiceNotes:
        "Customer reports outside drive tire blew out approx 30 min ago. No injuries. Driver pulled to shoulder safely. Approach with hazards on.",
      tirePreferences: [
        { axle: "Drive", preferredSpec: "Bridgestone R268 — MEGA TREK" },
        { axle: "Steer", preferredSpec: "Bridgestone R268" },
      ],
      specialHandlingInstructions:
        "Driver on shoulder, flashers on. Use truck lights — site has no shoulder lighting.",
      lineItems: [
        tireLine(
          "li-1a",
          "Drive Right Outer",
          "Drive tire — replacement",
          "Customer reports this tire blew on highway at speed — inspect rim and wheel hub for heat damage before mounting the new tire.",
        ),
        laborLine("li-1b", "Roadside labor", 1),
      ],
      sla: bridgestoneSLA,
      woStatus: "Assigned",
      billingStatus: null,
      assignedAt: isoOffset(-5),
      etaLocked: false,
      vehicle: {},
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
    // 2. UPCOMING — standard Swift, scheduled
    {
      id: "wo-2",
      number: "WO-50125",
      customerName: "Swift Transportation",
      customerAccountNumber: "SWI-1183",
      serviceLocation: "Swift Terminal, 401 Industrial Park Rd, Pittston PA",
      driverName: "Tina Vasquez",
      driverPhone: "(570) 555-4419",
      tractorNumber: "SW-2210",
      problemType: "Shop appointment — Steer rotation",
      isEmergency: false,
      scheduledTime: isoOffset(90),
      serviceTarget: "tractor",
      tirePreferences: [{ axle: "Steer", preferredSpec: "Firestone FS561" }],
      specialHandlingInstructions:
        "Check in with security at gate house — name MRR-Mike.",
      lineItems: [
        tireLine(
          "li-2a",
          "Steer Left",
          "Steer rotation",
          "Tina prefers same-spec replacement only. Confirm FS561 before mounting; do not substitute without calling dispatch.",
        ),
        tireLine(
          "li-2b",
          "Steer Right",
          "Steer rotation",
          "Driver mentioned slight pull to the right last week — note any uneven wear when rotating.",
        ),
      ],
      sla: swiftSLA,
      woStatus: "Assigned",
      billingStatus: null,
      assignedAt: isoOffset(-30),
      etaLocked: false,
      vehicle: {},
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
    // 3. COMPLETED (billing_status = Approved — fully locked per Gap A)
    {
      id: "wo-3",
      number: "WO-50108",
      customerName: "Bridgestone Trucking (Reach event)",
      customerAccountNumber: "BRI-4471",
      serviceLocation: "I-80 W Mile Marker 251, Bloomsburg PA",
      driverName: "Drew Patel",
      driverPhone: "(570) 555-1166",
      tractorNumber: "T-22871",
      trailerNumber: "TR-3309",
      problemType: "Roadside — Trailer tire",
      isEmergency: true,
      serviceTarget: "trailer",
      breakdownLocationNotes:
        "Inside Bloomsburg truck stop lot. Park near fuel island bay 3.",
      tirePreferences: [
        { axle: "Trailer", preferredSpec: "Bridgestone BTL-SA/ECL SST" },
      ],
      lineItems: [
        tireLine(
          "li-3a",
          "Trailer Axle 2 Outer",
          "Trailer tire replacement",
          "Trailer hub was leaking grease per driver — customer wants seal check while you're there.",
        ),
      ],
      sla: bridgestoneSLA,
      woStatus: "Completed",
      billingStatus: "Approved",
      assignedAt: isoOffset(-60 * 30),
      acceptedAt: isoOffset(-60 * 28),
      enRouteAt: isoOffset(-60 * 27),
      serviceStartedAt: isoOffset(-60 * 26),
      serviceCompletedAt: isoOffset(-60 * 25),
      leftSiteAt: isoOffset(-60 * 24),
      completedAt: isoOffset(-60 * 23),
      etaMinutes: 60,
      etaCommittedAt: isoOffset(-60 * 28),
      expectedArrivalAt: isoOffset(-60 * 27),
      etaLocked: true,
      slaAcknowledgedAt: isoOffset(-60 * 28),
      slaAcknowledgedByUserId: TECH_ID,
      vehicle: {
        driverName: "Mike Reynolds",
        vehicleNumber: "MTS-117",
        odometerDeparture: 84221,
        odometerArrival: 84298,
        travelDistance: 77,
      },
      preServiceNotes: "Trailer tire blown, debris in tire from road hazard.",
      serviceNotes: "Replaced with Bridgestone BTL-SA SST. Torque verified at 450 ft-lbs.",
      postServiceNotes: "Customer driver inspected and accepted.",
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      signature: {
        imageDataUrl: "",
        signerName: "Drew Patel",
        capturedAt: isoOffset(-60 * 25),
      },
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [
        {
          id: "c-3-1",
          authorUserId: TECH_ID,
          authorName: TECH_NAME,
          text: "Customer was professional, easy stop. Tire #4 inner showing wear, FYI for next service.",
          createdAt: isoOffset(-60 * 24),
          statusAtCreation: "Service_Completed",
          visibility: "internal",
        },
      ],
    },
    // 4. REJECTED — billing agent kicked back missing post-service photo
    {
      id: "wo-4",
      number: "WO-50116",
      customerName: "Swift Transportation",
      customerAccountNumber: "SWI-1183",
      serviceLocation: "Swift Terminal, Pittston PA",
      driverName: "Andre Williams",
      driverPhone: "(570) 555-7711",
      tractorNumber: "SW-1099",
      problemType: "Steer replacement",
      isEmergency: false,
      serviceTarget: "tractor",
      lineItems: [
        tireLine(
          "li-4a",
          "Steer Left",
          "Steer tire replacement",
          "Swift SLA requires torque-wrench photo (not torque-bar). BA already rejected once for this — do not skip the close-up.",
        ),
      ],
      sla: swiftSLA,
      woStatus: "Rejected",
      billingStatus: "Rejected",
      assignedAt: isoOffset(-60 * 50),
      acceptedAt: isoOffset(-60 * 48),
      enRouteAt: isoOffset(-60 * 47),
      serviceStartedAt: isoOffset(-60 * 46),
      serviceCompletedAt: isoOffset(-60 * 45),
      leftSiteAt: isoOffset(-60 * 44),
      completedAt: isoOffset(-60 * 43),
      etaMinutes: 90,
      etaCommittedAt: isoOffset(-60 * 48),
      expectedArrivalAt: isoOffset(-60 * 46.5),
      etaLocked: true,
      slaAcknowledgedAt: isoOffset(-60 * 48),
      slaAcknowledgedByUserId: TECH_ID,
      vehicle: {
        driverName: "Mike Reynolds",
        vehicleNumber: "MTS-117",
        odometerDeparture: 83980,
        odometerArrival: 84012,
        travelDistance: 32,
      },
      serviceNotes: "Replaced steer tire — Firestone FS561.",
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      currentRejection: {
        id: "rej-4-1",
        rejectedByUserId: "ba-001",
        rejectedByName: "Linda Foster",
        rejectedByRole: "Billing Agent",
        rejectedAt: isoOffset(-60 * 4),
        reason: "Missing Required Photo",
        description:
          "Post-service torque wrench photo is missing — Swift SLA requires this for steer replacements. Please add and resubmit.",
      },
      rejectionHistory: [
        {
          id: "rej-4-1",
          rejectedByUserId: "ba-001",
          rejectedByName: "Linda Foster",
          rejectedByRole: "Billing Agent",
          rejectedAt: isoOffset(-60 * 4),
          reason: "Missing Required Photo",
          description:
            "Post-service torque wrench photo is missing — Swift SLA requires this for steer replacements. Please add and resubmit.",
        },
      ],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
    // 5. LIVE JOB — currently at Accepted, ETA already locked, ready to leave
    {
      id: "wo-5",
      number: "WO-50130",
      customerName: "McCarthy Walk-In — Marvin's Auto",
      customerAccountNumber: "WALK-9988",
      customerContact: "Marvin Cole (570) 555-2002",
      serviceLocation: "Marvin's Auto, 1820 N Main St, Wilkes-Barre PA",
      driverName: "Marvin Cole",
      driverPhone: "(570) 555-2002",
      tractorNumber: "—",
      problemType: "Box truck — Steer flat",
      isEmergency: false,
      serviceTarget: "tractor",
      breakdownLocationNotes:
        "Marvin's Auto repair bay 1. Park in lot, walk in through customer entrance. Marvin will meet you.",
      dispatcherServiceNotes:
        "Box truck — front steer is flat. Customer walked in this morning; not a roadside. Cash or check PO at site (walk-in account).",
      tirePreferences: [{ axle: "Steer", preferredSpec: "Customer choice" }],
      specialHandlingInstructions:
        "Walk-in account — collect PO at site (cash or check).",
      lineItems: [
        tireLine(
          "li-5a",
          "Steer Right",
          "Steer tire — flat repair",
          "Walk-in customer — confirm payment method (cash or check) BEFORE mounting tire. PO at site only.",
        ),
      ],
      sla: walkInSLA,
      woStatus: "En_Route",
      billingStatus: null,
      assignedAt: isoOffset(-90),
      acceptedAt: isoOffset(-35),
      enRouteAt: isoOffset(-30),
      etaMinutes: 60,
      etaCommittedAt: isoOffset(-35),
      expectedArrivalAt: isoOffset(25),
      etaLocked: true,
      slaAcknowledgedAt: isoOffset(-32),
      slaAcknowledgedByUserId: TECH_ID,
      vehicle: {
        driverName: "Mike Reynolds",
        vehicleNumber: "MTS-117",
        odometerDeparture: 84221,
      },
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
    // 6. WITHDRAWN — cancelled by dispatcher before tech could arrive
    {
      id: "wo-6",
      number: "WO-50111",
      customerName: "Swift Transportation",
      customerAccountNumber: "SWI-1183",
      serviceLocation: "Swift Terminal, Pittston PA",
      problemType: "Steer rotation",
      isEmergency: false,
      serviceTarget: "tractor",
      lineItems: [tireLine("li-6a", "Steer Left", "Steer rotation")],
      sla: swiftSLA,
      woStatus: "Cancelled",
      billingStatus: null,
      assignedAt: isoOffset(-60 * 72),
      withdrawnAt: isoOffset(-60 * 71),
      withdrawnReason: "Cancelled",
      etaLocked: false,
      vehicle: {},
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
    // 7. UPCOMING — Reassigned to this tech from another tech (out sick)
    {
      id: "wo-7",
      number: "WO-50128",
      customerName: "JB Hunt Transport Services",
      customerAccountNumber: "JBH-2204",
      customerContact: "Dispatch (479) 820-0000",
      serviceLocation: "JB Hunt Terminal, 580 Cliff Rd, Pittston PA",
      driverName: "Alondra Fernández",
      driverPhone: "(479) 555-8842",
      tractorNumber: "JBH-1184",
      trailerNumber: "JBH-TR-3315",
      problemType: "Shop appointment — Drive tire rotation + alignment check",
      unitNumber: "DRV-AXLE-2",
      isEmergency: false,
      scheduledTime: isoOffset(150),
      serviceTarget: "tractor",
      breakdownLocationNotes:
        "JB Hunt terminal — check in at gate house first, then proceed to shop bay 4.",
      dispatcherServiceNotes:
        "Routine drive tire rotation + alignment check. Tech B (out sick) was originally assigned. Confirm appt slot at gate before approaching shop.",
      tirePreferences: [{ axle: "Drive", preferredSpec: "Firestone FS561" }],
      specialHandlingInstructions:
        "Reassigned from Tech B (out sick) — confirm appointment slot at gate before approaching shop.",
      lineItems: [
        tireLine(
          "li-7a",
          "Drive Left Outer",
          "Drive tire — rotate",
          "JB Hunt requires DOT-on/DOT-off photos for ALL drive tires — even rotations. Tape measure visible in shot.",
        ),
        tireLine(
          "li-7b",
          "Drive Right Outer",
          "Drive tire — rotate",
          "Same photo requirement as the left side — DOT both sides.",
        ),
        laborLine("li-7c", "Alignment check", 0.5),
      ],
      sla: jbHuntSLA,
      woStatus: "Reassigned",
      billingStatus: null,
      assignedAt: isoOffset(-15),
      etaLocked: false,
      vehicle: {},
      preServicePhotos: [],
      postServicePhotos: [],
      preServiceDocuments: [],
      postServiceDocuments: [],
      rejectionHistory: [],
      resubmissionCount: 0,
      resubmitted: false,
      comments: [],
    },
  ];
}
