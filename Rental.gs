/**
 * Rental Module
 * Rental and Airbnb property management
 * COMPLETELY SEPARATE from household finance
 */

/**
 * Get rental state
 * @returns {Object} Rental state
 */
function getRentalState_() {
  const snapshot = loadRentalSnapshot_();
  
  const propertiesActive = snapshot.properties.filter(p => !p.archived);
  const roomsActive = snapshot.rooms.filter(r => !r.archived);
  const bookingsAll = snapshot.bookings || [];
  
  return {
    properties: propertiesActive,
    rooms: roomsActive,
    bookings: bookingsAll
  };
}

/**
 * Calculate rental summary metrics
 * DO NOT include any financial data
 * DO NOT affect household accounts
 * @param {Array} bookings - Array of bookings
 * @param {Array} rooms - Array of rooms
 * @returns {Object} Rental summary metrics
 */
function calculateRentalSummary_(bookings, rooms) {
  if (!bookings) bookings = [];
  if (!rooms) rooms = [];
  
  const totalBookings = bookings.length;
  
  // Group by currency - DO NOT combine currencies
  const byRoomCurrency = {};
  bookings.forEach(b => {
    const key = b.room_id + '_' + b.currency;
    if (!byRoomCurrency[key]) {
      byRoomCurrency[key] = {
        roomId: b.room_id,
        currency: b.currency,
        amount: 0,
        count: 0,
        nights: 0
      };
    }
    
    const amount = parseFloat(b.amount_received) || 0;
    byRoomCurrency[key].amount += amount;
    byRoomCurrency[key].count += 1;
    
    // Calculate nights
    if (b.check_in && b.check_out) {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      byRoomCurrency[key].nights += nights;
    }
  });
  
  // Group by status
  const byStatus = groupBy_(bookings, 'status');
  const statusCounts = {};
  Object.keys(byStatus).forEach(status => {
    statusCounts[status] = byStatus[status].length;
  });
  
  return {
    totalBookings: totalBookings,
    totalNights: bookings.reduce((sum, b) => {
      if (b.check_in && b.check_out) {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }
      return sum;
    }, 0),
    byRoomCurrency: Object.values(byRoomCurrency),
    byStatus: statusCounts,
    totalRooms: rooms.length
  };
}

/**
 * Create a property
 * @param {Object} property - Property data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createProperty_(property) {
  const validation = validateProperty_(property);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('property_write', 5000);
  try {
    const newProperty = addRecord_(CONFIG.SHEETS.PROPERTIES, property, CONFIG.HEADERS.PROPERTIES);
    
    logAudit_('CREATE', 'Property', newProperty.id, { name: newProperty.name });
    invalidateRentalCache_();
    
    return { success: true, data: newProperty };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a property
 * @param {string} propertyId - Property ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateProperty_(propertyId, updates) {
  const validation = validateProperty_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('property_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.PROPERTIES, propertyId, updates, CONFIG.HEADERS.PROPERTIES);
    
    if (updated) {
      logAudit_('UPDATE', 'Property', propertyId, { changes: updates });
      invalidateRentalCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Property not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a property
 * @param {string} propertyId - Property ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveProperty_(propertyId) {
  const lock = acquireLock_('property_write', 5000);
  try {
    const snapshot = loadRentalSnapshot_();
    const roomRefs = getRoomsForProperty_(propertyId, snapshot.rooms);
    
    if (roomRefs.length > 0) {
      return {
        success: false,
        errors: ['Property has ' + roomRefs.length + ' room(s). Archive rooms first.']
      };
    }
    
    const archived = archiveRecord_(CONFIG.SHEETS.PROPERTIES, propertyId, CONFIG.HEADERS.PROPERTIES);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Property', propertyId, {});
      invalidateRentalCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Property not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a property permanently
 * @param {string} propertyId - Property ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteProperty_(propertyId) {
  const lock = acquireLock_('property_write', 5000);
  try {
    const snapshot = loadRentalSnapshot_();
    const roomRefs = getRoomsForProperty_(propertyId, snapshot.rooms);
    
    if (roomRefs.length > 0) {
      return {
        success: false,
        errors: ['Cannot delete property with ' + roomRefs.length + ' room(s).']
      };
    }
    
    if (deleteRecord_(CONFIG.SHEETS.PROPERTIES, propertyId)) {
      logAudit_('DELETE', 'Property', propertyId, {});
      invalidateRentalCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Property not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a room
 * @param {Object} room - Room data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createRoom_(room) {
  const validation = validateRoom_(room);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('room_write', 5000);
  try {
    const newRoom = addRecord_(CONFIG.SHEETS.ROOMS, room, CONFIG.HEADERS.ROOMS);
    
    logAudit_('CREATE', 'Room', newRoom.id, { 
      name: newRoom.name,
      property_id: newRoom.property_id 
    });
    invalidateRentalCache_();
    
    return { success: true, data: newRoom };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a room
 * @param {string} roomId - Room ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateRoom_(roomId, updates) {
  const validation = validateRoom_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('room_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.ROOMS, roomId, updates, CONFIG.HEADERS.ROOMS);
    
    if (updated) {
      logAudit_('UPDATE', 'Room', roomId, { changes: updates });
      invalidateRentalCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Room not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a room
 * @param {string} roomId - Room ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveRoom_(roomId) {
  const lock = acquireLock_('room_write', 5000);
  try {
    const snapshot = loadRentalSnapshot_();
    const bookingRefs = getBookingsForRoom_(roomId, snapshot.bookings);
    
    if (bookingRefs.length > 0) {
      return {
        success: false,
        errors: ['Room has ' + bookingRefs.length + ' booking(s). Archive bookings first.']
      };
    }
    
    const archived = archiveRecord_(CONFIG.SHEETS.ROOMS, roomId, CONFIG.HEADERS.ROOMS);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Room', roomId, {});
      invalidateRentalCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Room not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a room permanently
 * @param {string} roomId - Room ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteRoom_(roomId) {
  const lock = acquireLock_('room_write', 5000);
  try {
    const snapshot = loadRentalSnapshot_();
    const bookingRefs = getBookingsForRoom_(roomId, snapshot.bookings);
    
    if (bookingRefs.length > 0) {
      return {
        success: false,
        errors: ['Cannot delete room with ' + bookingRefs.length + ' booking(s).']
      };
    }
    
    if (deleteRecord_(CONFIG.SHEETS.ROOMS, roomId)) {
      logAudit_('DELETE', 'Room', roomId, {});
      invalidateRentalCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Room not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a booking
 * IMPORTANT: Creates NO household transactions
 * IMPORTANT: Does NOT affect household finances
 * @param {Object} booking - Booking data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createBooking_(booking) {
  const validation = validateBooking_(booking);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('booking_write', 5000);
  try {
    const newBooking = addRecord_(CONFIG.SHEETS.BOOKINGS, booking, CONFIG.HEADERS.BOOKINGS);
    
    logAudit_('CREATE', 'Booking', newBooking.id, {
      room_id: newBooking.room_id,
      guest: newBooking.guest,
      amount_received: newBooking.amount_received,
      currency: newBooking.currency
    });
    
    // IMPORTANT: Do NOT create a household transaction
    // IMPORTANT: Do NOT modify household accounts
    
    invalidateRentalCache_();
    
    return { success: true, data: newBooking };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a booking
 * IMPORTANT: Updates NO household transactions
 * IMPORTANT: Does NOT affect household finances
 * @param {string} bookingId - Booking ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateBooking_(bookingId, updates) {
  const validation = validateBooking_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('booking_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.BOOKINGS, bookingId, updates, CONFIG.HEADERS.BOOKINGS);
    
    if (updated) {
      logAudit_('UPDATE', 'Booking', bookingId, { changes: updates });
      
      // IMPORTANT: Do NOT create a household transaction
      // IMPORTANT: Do NOT modify household accounts
      
      invalidateRentalCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Booking not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a booking
 * IMPORTANT: Deletes NO household transactions
 * IMPORTANT: Does NOT affect household finances
 * @param {string} bookingId - Booking ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteBooking_(bookingId) {
  const lock = acquireLock_('booking_write', 5000);
  try {
    if (deleteRecord_(CONFIG.SHEETS.BOOKINGS, bookingId)) {
      logAudit_('DELETE', 'Booking', bookingId, {});
      
      // IMPORTANT: Do NOT delete any household transaction
      // IMPORTANT: Do NOT modify household accounts
      
      invalidateRentalCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Booking not found'] };
  } finally {
    releaseLock_(lock);
  }
}
