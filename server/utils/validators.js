const mongoose = require('mongoose');
const AppError = require('./appError');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const assertObjectId = (id, message = 'Invalid id') => {
    if (!isValidObjectId(id)) {
        throw new AppError(message, 400);
    }
};

const normalizeObjectIdList = (ids = []) => {
    if (!Array.isArray(ids)) {
        return [];
    }

    return [...new Set(ids.map((id) => String(id)))];
};

const assertObjectIdList = (ids = [], message = 'Invalid id') => {
    const normalizedIds = normalizeObjectIdList(ids);

    if (normalizedIds.some((id) => !isValidObjectId(id))) {
        throw new AppError(message, 400);
    }

    return normalizedIds;
};

const isRegistrationOpen = (event, date = new Date()) => {
    if (event.registrationStartDate && date < new Date(event.registrationStartDate)) {
        return false;
    }

    if (event.registrationEndDate && date > new Date(event.registrationEndDate)) {
        return false;
    }

    return true;
};

const assertRegistrationOpen = (event, message = 'Registration is not open for this event') => {
    if (!isRegistrationOpen(event)) {
        throw new AppError(message, 400);
    }
};

const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new AppError('Registration start date cannot be after registration end date', 400);
    }
};

const validateConfigDates = ({ registrationStartDate, registrationEndDate, eventDate }) => {
    validateDateRange(registrationStartDate, registrationEndDate);

    if (registrationEndDate && eventDate && new Date(registrationEndDate) > new Date(eventDate)) {
        throw new AppError('Registration end date cannot be after event date', 400);
    }
};

module.exports = {
    isValidObjectId,
    assertObjectId,
    normalizeObjectIdList,
    assertObjectIdList,
    isRegistrationOpen,
    assertRegistrationOpen,
    validateDateRange,
    validateConfigDates
};
