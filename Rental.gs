/**
 * Rental.gs
 * Rental and property tracking functions.
 */

function getRentalState_() {
  const snapshot = loadRentalSnapshot_();
  return {
    properties: (snapshot.properties || []).filter((p) => !p.archived),
    rooms: (snapshot.rooms || []).filter((r) => !r.archived),
    bookings: snapshot.bookings || []
  };
}

function calculateRentalSummary_(bookings, rooms) {
  const totalBookings = (bookings || []).length;
  const totalNights = (bookings || []).reduce((sum, booking) => {
    if (booking.check_in && booking.check_out) {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const diffDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return sum + (diffDays > 0 ? diffDays : 0);
    }
    return sum;
  }, 0);

  return {
    totalBookings: totalBookings,
    totalNights: totalNights,
    totalRooms: (rooms || []).length
  };
}

function createProperty_(property) {
  const validation = validateProperty_(property);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Properties', property, ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Property', result.id, { name: result.name });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Failed to create property'] };
}

function updateProperty_(propertyId, updates) {
  const result = updateRecord_('Properties', propertyId, updates, ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Property', propertyId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Property not found'] };
}

function archiveProperty_(propertyId) {
  const result = archiveRecord_('Properties', propertyId, ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Property', propertyId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Property not found'] };
}

function deleteProperty_(propertyId) {
  if (deleteRecord_('Properties', propertyId)) {
    logAudit_('DELETE', 'Property', propertyId, {});
    return { success: true };
  }
  return { success: false, errors: ['Property not found'] };
}

function createRoom_(room) {
  const validation = validateRoom_(room);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Rooms', room, ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Room', result.id, { name: result.name, property_id: result.property_id });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Failed to create room'] };
}

function updateRoom_(roomId, updates) {
  const result = updateRecord_('Rooms', roomId, updates, ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Room', roomId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Room not found'] };
}

function archiveRoom_(roomId) {
  const result = archiveRecord_('Rooms', roomId, ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Room', roomId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Room not found'] };
}

function deleteRoom_(roomId) {
  if (deleteRecord_('Rooms', roomId)) {
    logAudit_('DELETE', 'Room', roomId, {});
    return { success: true };
  }
  return { success: false, errors: ['Room not found'] };
}

function createBooking_(booking) {
  const validation = validateBooking_(booking);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Bookings', booking, ['id', 'room_id', 'guest', 'check_in', 'check_out', 'amount_received', 'currency', 'status', 'notes', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Booking', result.id, { guest: result.guest, amount_received: result.amount_received });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Failed to create booking'] };
}

function updateBooking_(bookingId, updates) {
  const result = updateRecord_('Bookings', bookingId, updates, ['id', 'room_id', 'guest', 'check_in', 'check_out', 'amount_received', 'currency', 'status', 'notes', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Booking', bookingId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Booking not found'] };
}

function deleteBooking_(bookingId) {
  if (deleteRecord_('Bookings', bookingId)) {
    logAudit_('DELETE', 'Booking', bookingId, {});
    return { success: true };
  }
  return { success: false, errors: ['Booking not found'] };
}
