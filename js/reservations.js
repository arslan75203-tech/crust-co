/**
 * Crust & Co - Backend-Compatible Table Reservation Service Layer
 * Follows Specifications for Paid Table Reservations.
 * Ready for future PHP/MySQL + Restaurant POS integration.
 * Storage key: crust_co_reservations, crust_co_tables, crust_co_booking_config
 */

const RESERVATIONS_STORAGE_KEY = 'crust_co_reservations';
const TABLES_STORAGE_KEY = 'crust_co_tables';
const CONFIG_STORAGE_KEY = 'crust_co_booking_config';
const AUDIT_STORAGE_KEY = 'crust_co_booking_audit';

/**
 * Default Business & Pricing Configuration
 * Authoritative system defaults - fully configurable by Control Panel.
 */
export const DEFAULT_BOOKING_CONFIG = {
  // Opening hours per day (Asia/Karachi timezone)
  restaurantHours: {
    timezone: 'Asia/Karachi',
    monday: { open: '12:00', close: '01:00', closed: false },
    tuesday: { open: '12:00', close: '01:00', closed: false },
    wednesday: { open: '12:00', close: '01:00', closed: false },
    thursday: { open: '12:00', close: '01:00', closed: false },
    friday: { open: '14:00', close: '02:00', closed: false },
    saturday: { open: '12:00', close: '02:00', closed: false },
    sunday: { open: '12:00', close: '02:00', closed: false },
  },

  // Booking settings
  bookingSettings: {
    minimumAdvanceMinutes: 0,
    maximumAdvanceDays: 30,
    advanceCutoffMinutes: 60, // Cutoff before close
  },

  // Pricing configuration: PKR 50 per 30 minutes per table
  bookingPricing: {
    billingUnitMinutes: 30,
    ratePerTable: 50,
    currency: 'PKR',
  },

  // Mobile payment gateway instructions
  paymentSettings: {
    jazzcash: {
      enabled: true,
      accountTitle: 'Crust & Co Artisanal Kitchen',
      accountNumber: '0300-1234567',
      instructions: 'Send exact advance payment via JazzCash App or *786# and save the transaction screenshot.',
    },
    easypaisa: {
      enabled: true,
      accountTitle: 'Crust & Co Artisanal Kitchen',
      accountNumber: '0300-7654321',
      instructions: 'Transfer exact advance payment via EasyPaisa App or *786# and save the transaction screenshot.',
    },
  },
};

/**
 * Standard Restaurant Floor Layout
 * Operational statuses: available, reserved, occupied, cleaning, blocked
 */
export const SECTIONS = [
  { id: 'FAMILY', name: 'Family Hall', description: 'Cozy and quiet family seating with partitioned tables and baby high-chairs.' },
  { id: 'OPEN', name: 'Open Dining', description: 'Vibrant open-air dining with natural breeze and prompt table-side service.' },
];

/**
 * Standard Restaurant Floor Layout - 100% 4-Seater Tables
 * Only two authoritative sections: Family Hall & Open Dining
 * Operational statuses: available, reserved, occupied (physically seated), cleaning, blocked
 */
export const DEFAULT_TABLES = [
  // Family Hall (All 4-seaters)
  { id: 'T-F01', name: 'Table F-01 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'available', active: true },
  { id: 'T-F02', name: 'Table F-02 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'available', active: true },
  { id: 'T-F03', name: 'Table F-03 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'occupied', active: true }, // Physically seated walk-in diners
  { id: 'T-F04', name: 'Table F-04 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'available', active: true },
  { id: 'T-F05', name: 'Table F-05 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'available', active: true },
  { id: 'T-F06', name: 'Table F-06 (Family)', capacity: 4, sectionId: 'FAMILY', sectionName: 'Family Hall', status: 'available', active: true },

  // Open Dining (All 4-seaters)
  { id: 'T-O01', name: 'Table O-01 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'available', active: true },
  { id: 'T-O02', name: 'Table O-02 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'available', active: true },
  { id: 'T-O03', name: 'Table O-03 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'available', active: true },
  { id: 'T-O04', name: 'Table O-04 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'available', active: true },
  { id: 'T-O05', name: 'Table O-05 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'available', active: true },
  { id: 'T-O06', name: 'Table O-06 (Open)', capacity: 4, sectionId: 'OPEN', sectionName: 'Open Dining', status: 'cleaning', active: true }, // Cleaning in progress
];

/**
 * Initialize Default Local Data & Auto-Migrate schema
 */
function initDefaultData() {
  if (!localStorage.getItem(CONFIG_STORAGE_KEY)) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKING_CONFIG));
  }

  // Automatic Migration: Ensure only 4-seater tables in Family and Open sections exist
  const storedTables = localStorage.getItem(TABLES_STORAGE_KEY);
  if (!storedTables) {
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
  } else {
    try {
      const parsed = JSON.parse(storedTables);
      const isOutdated = !Array.isArray(parsed) || parsed.some(
        (t) => t.capacity !== 4 || (t.sectionId !== 'FAMILY' && t.sectionId !== 'OPEN')
      );
      if (isOutdated) {
        localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
      }
    } catch (e) {
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
    }
  }

  const storedReservations = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
  let shouldSeedReservations = !storedReservations;
  if (storedReservations) {
    try {
      const parsed = JSON.parse(storedReservations);
      if (Array.isArray(parsed) && parsed.some((r) => r.reservation?.sectionId === 'MAIN' || r.reservation?.sectionId === 'OUTDOOR')) {
        shouldSeedReservations = true;
      }
    } catch (e) {
      shouldSeedReservations = true;
    }
  }

  if (shouldSeedReservations) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const demoReservations = [
      {
        id: 'BK-10245',
        externalId: 'WEB-BK-10245',
        userId: 'user-001',
        customer: {
          name: 'Hamza Farooq',
          phone: '03001234567',
          email: 'hamza@crustco.pk',
        },
        reservation: {
          date: tomorrowStr,
          startTime: '19:00',
          endTime: '21:00',
          durationMinutes: 120,
          guests: 5,
          sectionId: 'FAMILY',
          tableIds: ['T-F01', 'T-F02'],
          assignedTableNames: ['Table F-01 (4 seats)', 'Table F-02 (4 seats)'],
          combinedCapacity: 8,
        },
        pricing: {
          billingUnitMinutes: 30,
          ratePerTablePerUnit: 50,
          tableCount: 2,
          billingUnits: 4,
          reservationCharge: 400,
          advanceRequired: 400,
          currency: 'PKR',
        },
        payment: {
          method: 'jazzcash',
          transactionId: 'JC-9874561230',
          customerName: 'Hamza Farooq',
          customerPhone: '03001234567',
          requiredAmount: 400,
          receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=800&auto=format&fit=crop&q=80',
          status: 'pending_verification',
          submittedAt: new Date().toISOString(),
        },
        status: 'pending',
        specialOccasion: 'Family Birthday Dinner',
        specialRequests: 'Please arrange high chairs for children if available.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'BK-10240',
        externalId: 'WEB-BK-10240',
        userId: 'user-001',
        customer: {
          name: 'Hamza Farooq',
          phone: '03001234567',
          email: 'hamza@crustco.pk',
        },
        reservation: {
          date: yesterdayStr,
          startTime: '20:00',
          endTime: '21:30',
          durationMinutes: 90,
          guests: 3,
          sectionId: 'OPEN',
          tableIds: ['T-O01'],
          assignedTableNames: ['Table O-01 (4 seats)'],
          combinedCapacity: 4,
        },
        pricing: {
          billingUnitMinutes: 30,
          ratePerTablePerUnit: 50,
          tableCount: 1,
          billingUnits: 3,
          reservationCharge: 150,
          advanceRequired: 150,
          currency: 'PKR',
        },
        payment: {
          method: 'easypaisa',
          transactionId: 'EP-4412098711',
          customerName: 'Hamza Farooq',
          customerPhone: '03001234567',
          requiredAmount: 150,
          receiptImage: 'https://images.unsplash.com/photo-1554415707-9e49017aed81?w=800&auto=format&fit=crop&q=80',
          status: 'verified',
          submittedAt: yesterday.toISOString(),
          verifiedAt: yesterday.toISOString(),
        },
        status: 'completed',
        specialOccasion: '',
        specialRequests: '',
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      },
    ];

    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(demoReservations));
  }
}

initDefaultData();

/* -------------------------------------------------------------------------- */
/*                       CONFIGURATION & DATA ACCESSORS                       */
/* -------------------------------------------------------------------------- */

export function getBookingConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? { ...DEFAULT_BOOKING_CONFIG, ...JSON.parse(raw) } : DEFAULT_BOOKING_CONFIG;
  } catch (e) {
    return DEFAULT_BOOKING_CONFIG;
  }
}

export function updateBookingConfig(newConfig) {
  const current = getBookingConfig();
  const merged = { ...current, ...newConfig };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
  logAudit('SYSTEM', 'CONFIG_UPDATED', 'CONFIG', 'Pricing or business hours modified');
  window.dispatchEvent(new CustomEvent('crust:booking-config-updated', { detail: { config: merged } }));
  return merged;
}

export function getTables() {
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TABLES;
  } catch (e) {
    return DEFAULT_TABLES;
  }
}

export function updateTableStatus(tableId, newStatus) {
  const tables = getTables();
  const idx = tables.findIndex((t) => t.id === tableId);
  if (idx > -1) {
    const oldStatus = tables[idx].status;
    tables[idx].status = newStatus;
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
    logAudit('STAFF', 'TABLE_STATUS_CHANGED', tableId, `Status changed from ${oldStatus} to ${newStatus}`);
    window.dispatchEvent(new CustomEvent('crust:tables-updated', { detail: { tables } }));
  }
}

export function getAllReservations() {
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getReservationById(id) {
  const all = getAllReservations();
  return all.find((r) => r.id === id || r.externalId === id) || null;
}

export function getUserReservations(userId) {
  const all = getAllReservations();
  if (!userId) {
    return all.filter((r) => r.userId === 'guest');
  }
  return all.filter((r) => r.userId === userId);
}

/* -------------------------------------------------------------------------- */
/*                        CALCULATION ENGINE (CORE)                           */
/* -------------------------------------------------------------------------- */

/**
 * Calculates end time based on start time and duration minutes
 * Format: HH:MM 24-hour
 */
export function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return '';
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + Number(durationMinutes);
  
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Calculates number of billing units (e.g. 30-min increments)
 */
export function calculateBillingUnits(durationMinutes, billingUnitMinutes = 30) {
  return Math.max(1, Math.ceil(Number(durationMinutes) / Number(billingUnitMinutes)));
}

/**
 * Calculates reservation price
 * Price = Number of Tables × Number of 30-Min Billing Units × Rate Per Table
 * e.g. 1 table for 30m = 1 × 1 × 50 = PKR 50
 *      2 tables for 30m = 2 × 1 × 50 = PKR 100
 *      2 tables for 60m = 2 × 2 × 50 = PKR 200
 */
export function calculateReservationPrice(tableCount, durationMinutes, pricingConfig = null) {
  const config = pricingConfig || getBookingConfig().bookingPricing;
  const unitMinutes = config.billingUnitMinutes || 30;
  const rate = config.ratePerTable || 50;
  const units = calculateBillingUnits(durationMinutes, unitMinutes);
  const count = Math.max(1, Number(tableCount) || 1);
  const total = count * units * rate;
  const per30mTotal = count * rate;

  return {
    billingUnitMinutes: unitMinutes,
    ratePerTablePerUnit: rate,
    tableCount: count,
    billingUnits: units,
    per30mTotal: per30mTotal,
    formula: `${count} Table${count > 1 ? 's' : ''} × ${units} Unit${units > 1 ? 's' : ''} (${units * unitMinutes}m) × PKR ${rate}`,
    per30mSummary: `PKR ${per30mTotal} / 30m (${count} Table${count > 1 ? 's' : ''} × PKR ${rate})`,
    reservationCharge: total,
    advanceRequired: total,
    currency: config.currency || 'PKR',
  };
}

/* -------------------------------------------------------------------------- */
/*                   BUSINESS HOURS & OPENING TIME VALIDATION                 */
/* -------------------------------------------------------------------------- */

/**
 * Get weekday name from date string YYYY-MM-DD
 */
export function getWeekdayName(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Checks if the restaurant is currently open right now
 */
export function isRestaurantOpenNow() {
  const config = getBookingConfig();
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[now.getDay()];
  const hours = config.restaurantHours[dayName];

  if (!hours || hours.closed) return { open: false, opensAt: 'Closed today' };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hours.open.split(':').map(Number);
  let [closeH, closeM] = hours.close.split(':').map(Number);
  if (closeH < openH) closeH += 24; // crosses midnight

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { open: true, opensAt: hours.open, closesAt: hours.close };
  }

  return {
    open: false,
    opensAt: formatTime12h(hours.open),
    closesAt: formatTime12h(hours.close),
  };
}

/**
 * Validates requested date, start time, and end time against restaurant hours.
 * Rejects if reservation would extend beyond closing time.
 */
export function validateRestaurantHours(dateStr, startTime, endTime, hoursConfig = null) {
  const config = hoursConfig || getBookingConfig().restaurantHours;
  const dayName = getWeekdayName(dateStr);
  const dayHours = config[dayName];

  if (!dayHours || dayHours.closed) {
    return {
      valid: false,
      message: `Table reservations are closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}s.`,
    };
  }

  const [openH, openM] = dayHours.open.split(':').map(Number);
  let [closeH, closeM] = dayHours.close.split(':').map(Number);
  if (closeH < openH) closeH += 24;

  const [startH, startM] = startTime.split(':').map(Number);
  let [endH, endM] = endTime.split(':').map(Number);
  if (endH < startH) endH += 24;

  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  if (startMins < openMins) {
    return {
      valid: false,
      message: `The restaurant opens at ${formatTime12h(dayHours.open)}. Please select a start time after opening.`,
    };
  }

  if (endMins > closeMins) {
    return {
      valid: false,
      message: `This reservation would extend beyond restaurant closing time (${formatTime12h(dayHours.close)}). Please select an earlier time or shorter duration.`,
    };
  }

  // Same day cutoff check: if booking for today and current time is before restaurant opening
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr === todayStr) {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    if (currentMins < openMins && startMins <= currentMins) {
      return {
        valid: false,
        message: `Table reservations for today are currently closed. Reservations open at ${formatTime12h(dayHours.open)}.`,
      };
    }
  }

  return { valid: true };
}

/* -------------------------------------------------------------------------- */
/*               TABLE AVAILABILITY & COMBINATION ALGORITHM                   */
/* -------------------------------------------------------------------------- */

/**
 * Check if two time intervals overlap on the same date
 * Overlap condition: existingStart < requestedEnd && existingEnd > requestedStart
 */
export function isTimeOverlapping(start1, end1, start2, end2) {
  const [s1H, s1M] = start1.split(':').map(Number);
  let [e1H, e1M] = end1.split(':').map(Number);
  if (e1H < s1H) e1H += 24;

  const [s2H, s2M] = start2.split(':').map(Number);
  let [e2H, e2M] = end2.split(':').map(Number);
  if (e2H < s2H) e2H += 24;

  const m1Start = s1H * 60 + s1M;
  const m1End = e1H * 60 + e1M;
  const m2Start = s2H * 60 + s2M;
  const m2End = e2H * 60 + e2M;

  return m1Start < m2End && m1End > m2Start;
}

/**
 * Detailed Database Availability Query Engine
 * Detects:
 * 1. Physical live floor occupancy (customers physically seated right now)
 * 2. Database reservations overlapping with requested time slot
 * 3. Cleaning / Turnaround status
 * 4. Maintenance / Blocked status
 */
export function queryTableAvailabilityDatabase({ dateStr, startTime, endTime, sectionId = 'ALL' }) {
  const allTables = getTables();
  const allReservations = getAllReservations();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = dateStr === todayStr;

  // Active reservations on this date (not cancelled or rejected)
  const activeReservations = allReservations.filter((r) => {
    return (
      r.reservation.date === dateStr &&
      r.status !== 'cancelled' &&
      r.status !== 'no_show' &&
      r.payment.status !== 'rejected' &&
      isTimeOverlapping(r.reservation.startTime, r.reservation.endTime, startTime, endTime)
    );
  });

  // Map reserved table IDs to booking detail
  const reservedMap = new Map();
  activeReservations.forEach((r) => {
    (r.reservation.tableIds || []).forEach((tid) => {
      reservedMap.set(tid, {
        bookingId: r.id,
        customerName: r.customer?.name || 'Customer',
        timeWindow: `${formatTime12h(r.reservation.startTime)} – ${formatTime12h(r.reservation.endTime)}`,
      });
    });
  });

  const tableReports = allTables
    .filter((table) => {
      if (!table.active) return false;
      if (sectionId && sectionId !== 'ALL' && table.sectionId !== sectionId) return false;
      return true;
    })
    .map((table) => {
      let isAvailable = true;
      let reason = 'available';
      let reasonLabel = 'Available for Booking (4 Seats)';
      let conflictInfo = null;

      if (table.status === 'blocked') {
        isAvailable = false;
        reason = 'blocked';
        reasonLabel = 'Under Maintenance / Blocked';
      } else if (table.status === 'cleaning' && isToday) {
        isAvailable = false;
        reason = 'cleaning';
        reasonLabel = 'Sanitization & Cleaning in Progress';
      } else if (table.status === 'occupied' && isToday) {
        // Real-time: Customer physically seated at the table right now
        isAvailable = false;
        reason = 'occupied_physical';
        reasonLabel = 'Diners Physically Seated (Walk-in)';
      } else if (reservedMap.has(table.id)) {
        // Advance reservation from database
        isAvailable = false;
        reason = 'reserved_advance';
        conflictInfo = reservedMap.get(table.id);
        reasonLabel = `Reserved in Database: #${conflictInfo.bookingId} (${conflictInfo.timeWindow})`;
      }

      return {
        table,
        isAvailable,
        reason,
        reasonLabel,
        conflictInfo,
      };
    });

  const availableTables = tableReports.filter((r) => r.isAvailable).map((r) => r.table);

  return {
    queriedSlot: { date: dateStr, startTime, endTime, sectionId },
    totalTables: tableReports.length,
    availableTables,
    availableCount: availableTables.length,
    unavailableCount: tableReports.length - availableTables.length,
    tableReports,
  };
}

/**
 * Returns all tables that are free of reservations during requested slot
 * and have active operational status (not occupied/cleaning/blocked)
 */
export function getAvailableTablesForSlot(dateStr, startTime, endTime, sectionId = 'ALL') {
  return queryTableAvailabilityDatabase({ dateStr, startTime, endTime, sectionId }).availableTables;
}

/**
 * Table Assignment Algorithm - Tailored for 100% 4-Seater Tables
 * 1 table = 4 seats, 2 tables = 8 seats, 3 tables = 12 seats, 4 tables = 16 seats
 */
export function findAvailableTableCombinations(guests, dateStr, startTime, endTime, sectionId = 'ALL', requestedTableCount = 0) {
  const numGuests = Number(guests);
  const preferredTables = Number(requestedTableCount) || 0;
  const dbResult = queryTableAvailabilityDatabase({ dateStr, startTime, endTime, sectionId });
  const availableTables = dbResult.availableTables;

  const minTablesNeeded = Math.ceil(numGuests / 4);

  if (availableTables.length < minTablesNeeded && preferredTables <= 0) {
    return {
      success: false,
      message: `Database detected only ${availableTables.length} table(s) available in this section at ${formatTime12h(startTime)}. A party of ${numGuests} guests requires at least ${minTablesNeeded} tables (4 seats each). Please choose another time slot or select "All Sections".`,
      arrangements: [],
      dbResult,
    };
  }

  if (availableTables.length === 0) {
    return {
      success: false,
      message: 'No tables are available for this time slot. Diners are physically seated or tables are reserved in the database.',
      arrangements: [],
      dbResult,
    };
  }

  const validArrangements = [];

  // Check 1: 1 Table (4 seats)
  if (numGuests <= 4 || preferredTables === 1) {
    availableTables.forEach((t) => {
      validArrangements.push({
        tables: [t],
        tableIds: [t.id],
        tableNames: [`${t.name} (4 seats)`],
        combinedCapacity: 4,
        unusedCapacity: 4 - numGuests,
        tableCount: 1,
        isSingleTable: true,
        description: `${t.name} in ${t.sectionName} (4 seats)`,
      });
    });
  }

  // Check 2: 2 Tables (8 seats)
  if ((numGuests <= 8 && numGuests > 4) || preferredTables === 2 || (numGuests <= 4 && preferredTables === 2)) {
    for (let i = 0; i < availableTables.length; i++) {
      for (let j = i + 1; j < availableTables.length; j++) {
        const t1 = availableTables[i];
        const t2 = availableTables[j];
        validArrangements.push({
          tables: [t1, t2],
          tableIds: [t1.id, t2.id],
          tableNames: [`${t1.name} (4 seats)`, `${t2.name} (4 seats)`],
          combinedCapacity: 8,
          unusedCapacity: 8 - numGuests,
          tableCount: 2,
          isSingleTable: false,
          description: `${t1.name} + ${t2.name} (8 seats total)`,
        });
      }
    }
  }

  // Check 3: 3 Tables (12 seats)
  if ((numGuests <= 12 && numGuests > 8) || preferredTables === 3) {
    for (let i = 0; i < availableTables.length; i++) {
      for (let j = i + 1; j < availableTables.length; j++) {
        for (let k = j + 1; k < availableTables.length; k++) {
          const t1 = availableTables[i];
          const t2 = availableTables[j];
          const t3 = availableTables[k];
          validArrangements.push({
            tables: [t1, t2, t3],
            tableIds: [t1.id, t2.id, t3.id],
            tableNames: [`${t1.name} (4)`, `${t2.name} (4)`, `${t3.name} (4)`],
            combinedCapacity: 12,
            unusedCapacity: 12 - numGuests,
            tableCount: 3,
            isSingleTable: false,
            description: `${t1.name} + ${t2.name} + ${t3.name} (12 seats total)`,
          });
        }
      }
    }
  }

  // Check 4: 4 Tables (16 seats)
  if (numGuests > 12 || preferredTables >= 4) {
    for (let i = 0; i < availableTables.length; i++) {
      for (let j = i + 1; j < availableTables.length; j++) {
        for (let k = j + 1; k < availableTables.length; k++) {
          for (let l = k + 1; l < availableTables.length; l++) {
            const t1 = availableTables[i];
            const t2 = availableTables[j];
            const t3 = availableTables[k];
            const t4 = availableTables[l];
            validArrangements.push({
              tables: [t1, t2, t3, t4],
              tableIds: [t1.id, t2.id, t3.id, t4.id],
              tableNames: [`${t1.name} (4)`, `${t2.name} (4)`, `${t3.name} (4)`, `${t4.name} (4)`],
              combinedCapacity: 16,
              unusedCapacity: 16 - numGuests,
              tableCount: 4,
              isSingleTable: false,
              description: `${t1.name} + ${t2.name} + ${t3.name} + ${t4.name} (16 seats total)`,
            });
          }
        }
      }
    }
  }

  if (validArrangements.length === 0) {
    return {
      success: false,
      message: `We couldn't arrange enough tables for your requested party size. Try selecting "All Sections" or a different time slot.`,
      arrangements: [],
      dbResult,
    };
  }

  // Sort arrangements:
  // 1. If user requested specific table count, match exact table count
  // 2. Minimum tables required for party size
  // 3. Minimum unused seats
  validArrangements.sort((a, b) => {
    if (preferredTables > 0) {
      const aMatches = a.tableCount === preferredTables ? 1 : 0;
      const bMatches = b.tableCount === preferredTables ? 1 : 0;
      if (aMatches !== bMatches) return bMatches - aMatches;
    }
    if (a.tableCount !== b.tableCount) return a.tableCount - b.tableCount;
    return a.unusedCapacity - b.unusedCapacity;
  });

  return {
    success: true,
    arrangements: validArrangements,
    recommended: validArrangements[0],
    dbResult,
  };
}

/* -------------------------------------------------------------------------- */
/*                         RESERVATION MANAGEMENT (CRUD)                      */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new reservation record in localStorage
 * Backend-ready schema following Section 38.
 */
export function createReservation({
  userId = 'guest',
  customer,
  reservation,
  payment,
  specialOccasion = '',
  specialRequests = '',
}) {
  const all = getAllReservations();
  const nextNum = 10246 + all.length;
  const bookingId = `BK-${nextNum}`;
  const externalId = `WEB-BK-${nextNum}`;

  // Server-authoritative calculation: enforce accurate pricing from config
  const pricing = calculateReservationPrice(
    reservation.tableIds.length,
    reservation.durationMinutes
  );

  const newReservation = {
    id: bookingId,
    externalId: externalId,
    userId: userId || 'guest',
    customer: {
      name: (customer.name || '').trim(),
      phone: (customer.phone || '').trim(),
      email: (customer.email || '').trim(),
    },
    reservation: {
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      durationMinutes: Number(reservation.durationMinutes),
      guests: Number(reservation.guests),
      sectionId: reservation.sectionId || 'MAIN',
      tableIds: [...reservation.tableIds],
      assignedTableNames: reservation.assignedTableNames || [],
      combinedCapacity: Number(reservation.combinedCapacity),
    },
    pricing: pricing,
    payment: {
      method: payment.method, // 'jazzcash' | 'easypaisa'
      transactionId: (payment.transactionId || '').trim(),
      customerName: (payment.customerName || customer.name || '').trim(),
      customerPhone: (payment.customerPhone || customer.phone || '').trim(),
      requiredAmount: pricing.advanceRequired,
      receiptImage: payment.receiptImage || '',
      status: 'pending_verification',
      submittedAt: new Date().toISOString(),
    },
    status: 'pending', // 'pending' until verified
    specialOccasion: (specialOccasion || '').trim(),
    specialRequests: (specialRequests || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(newReservation);
  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));

  logAudit(customer.name || 'GUEST', 'RESERVATION_CREATED', bookingId, `Created for ${reservation.guests} guests on ${reservation.date}`);
  window.dispatchEvent(new CustomEvent('crust:reservation-created', { detail: { reservation: newReservation } }));

  return newReservation;
}

/**
 * Verify payment in Control Panel
 * Updates payment: 'verified', reservation: 'confirmed'
 */
export function verifyPayment(bookingId, adminNote = '') {
  const all = getAllReservations();
  const idx = all.findIndex((r) => r.id === bookingId);
  if (idx === -1) throw new Error('Reservation not found');

  all[idx].payment.status = 'verified';
  all[idx].payment.verifiedAt = new Date().toISOString();
  all[idx].payment.adminNote = adminNote;
  all[idx].status = 'confirmed';
  all[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));
  logAudit('ADMIN', 'PAYMENT_VERIFIED', bookingId, `Advance verified. Status set to Confirmed. ${adminNote}`);
  window.dispatchEvent(new CustomEvent('crust:reservation-updated', { detail: { reservation: all[idx] } }));

  return all[idx];
}

/**
 * Reject payment in Control Panel
 * Updates payment: 'rejected', reservation: 'pending' with reason
 */
export function rejectPayment(bookingId, reason = 'Payment could not be verified') {
  const all = getAllReservations();
  const idx = all.findIndex((r) => r.id === bookingId);
  if (idx === -1) throw new Error('Reservation not found');

  all[idx].payment.status = 'rejected';
  all[idx].payment.rejectionReason = reason;
  all[idx].payment.rejectedAt = new Date().toISOString();
  all[idx].status = 'pending';
  all[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));
  logAudit('ADMIN', 'PAYMENT_REJECTED', bookingId, `Payment rejected: ${reason}`);
  window.dispatchEvent(new CustomEvent('crust:reservation-updated', { detail: { reservation: all[idx] } }));

  return all[idx];
}

/**
 * Re-submit payment after rejection
 */
export function resubmitPayment(bookingId, paymentData) {
  const all = getAllReservations();
  const idx = all.findIndex((r) => r.id === bookingId);
  if (idx === -1) throw new Error('Reservation not found');

  all[idx].payment = {
    ...all[idx].payment,
    method: paymentData.method,
    transactionId: paymentData.transactionId,
    customerName: paymentData.customerName,
    customerPhone: paymentData.customerPhone,
    receiptImage: paymentData.receiptImage,
    status: 'pending_verification',
    submittedAt: new Date().toISOString(),
    rejectionReason: '',
  };
  all[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));
  logAudit(paymentData.customerName || 'CUSTOMER', 'PAYMENT_RESUBMITTED', bookingId, `Resubmitted TXN ${paymentData.transactionId}`);
  window.dispatchEvent(new CustomEvent('crust:reservation-updated', { detail: { reservation: all[idx] } }));

  return all[idx];
}

/**
 * Cancel Reservation (Preserves record in history)
 */
export function cancelReservation(bookingId, reason = 'Cancelled by customer') {
  const all = getAllReservations();
  const idx = all.findIndex((r) => r.id === bookingId);
  if (idx === -1) throw new Error('Reservation not found');

  all[idx].status = 'cancelled';
  all[idx].cancellationReason = reason;
  all[idx].cancelledAt = new Date().toISOString();
  all[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));
  logAudit('USER', 'RESERVATION_CANCELLED', bookingId, reason);
  window.dispatchEvent(new CustomEvent('crust:reservation-updated', { detail: { reservation: all[idx] } }));

  return all[idx];
}

/**
 * Update reservation operational status (seated, completed, no_show)
 */
export function updateReservationOperationalStatus(bookingId, newStatus) {
  const all = getAllReservations();
  const idx = all.findIndex((r) => r.id === bookingId);
  if (idx === -1) throw new Error('Reservation not found');

  all[idx].status = newStatus;
  all[idx].updatedAt = new Date().toISOString();

  localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(all));
  logAudit('STAFF', 'STATUS_CHANGE', bookingId, `Operational status changed to ${newStatus}`);
  window.dispatchEvent(new CustomEvent('crust:reservation-updated', { detail: { reservation: all[idx] } }));

  return all[idx];
}

/* -------------------------------------------------------------------------- */
/*                                AUDIT TRAIL                                 */
/* -------------------------------------------------------------------------- */

export function logAudit(user, action, recordId, description) {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      action,
      recordId,
      description,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100 logs
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Audit log failure', e);
  }
}

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                               FORMAT HELPERS                               */
/* -------------------------------------------------------------------------- */

export function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDurationLabel(minutes) {
  const m = Number(minutes);
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} mins`;
  if (hours > 0) return `${hours} Hour${hours > 1 ? 's' : ''}`;
  return `${mins} Minutes`;
}
