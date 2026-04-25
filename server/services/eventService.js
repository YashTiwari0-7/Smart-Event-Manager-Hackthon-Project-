const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Registration = require('../models/registrationModel');
const Team = require('../models/teamModel');
const Certificate = require('../models/certificateModel');
const AppError = require('../utils/appError');
const { ROLES } = require('../utils/authConstants');
const {
    assertObjectId,
    assertObjectIdList,
    validateConfigDates
} = require('../utils/validators');

const ADMIN_EVENT_FIELDS = [
    'title',
    'description',
    'coordinators'
];

const COORDINATOR_CONFIG_FIELDS = [
    'participationType',
    'maxTeamSize',
    'totalSlots',
    'genderSpecification',
    'registrationStartDate',
    'registrationEndDate',
    'eventDate'
];

const ensureAllowedFields = (data, allowedFields, message) => {
    const invalidFields = Object.keys(data).filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        throw new AppError(message, 400);
    }
};

const hasOwn = (data, field) => Object.prototype.hasOwnProperty.call(data, field);

const buildGenderSpecification = (current = {}, updates = {}) => {
    return {
        enabled: hasOwn(updates, 'enabled') ? Boolean(updates.enabled) : Boolean(current.enabled),
        type: hasOwn(updates, 'type') ? updates.type : (current.type || 'none'),
        minCount: hasOwn(updates, 'minCount') ? Number(updates.minCount) : Number(current.minCount || 0),
        reservedSlots: hasOwn(updates, 'reservedSlots') ? Number(updates.reservedSlots) : Number(current.reservedSlots || 0)
    };
};

const validateApprovedCoordinators = async (coordinators = []) => {
    if (!Array.isArray(coordinators)) {
        throw new AppError('Coordinators must be an array', 400);
    }

    const coordinatorIds = assertObjectIdList(coordinators, 'Invalid coordinator id');

    if (coordinatorIds.length === 0) {
        return [];
    }

    const approvedCoordinators = await User.find({
        _id: { $in: coordinatorIds },
        role: ROLES.COORDINATOR,
        isApproved: true
    }).select('_id');

    if (approvedCoordinators.length !== coordinatorIds.length) {
        throw new AppError('All coordinators must exist and be approved', 400);
    }

    return coordinatorIds;
};

const applyEventFields = (event, data) => {
    ADMIN_EVENT_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            event[field] = data[field];
        }
    });
};

const populateEvent = (query) => {
    return query
        .populate('coordinators', 'name email role isApproved')
        .populate('configOwner', 'name email role')
        .populate('createdBy', 'name email role')
        .populate('participants', 'name email gender')
        .populate('teams')
        .populate('winners', 'name email gender')
        .populate('results.winner', 'name email gender')
        .populate('results.runnerUp', 'name email gender')
        .populate('results.top3', 'name email gender');
};

const createEvent = async (data, adminId) => {
    ensureAllowedFields(
        data,
        ADMIN_EVENT_FIELDS,
        'Admin can only set title, description and coordinators'
    );

    if (!data.title) {
        throw new AppError('Event title is required', 400);
    }

    const coordinatorIds = await validateApprovedCoordinators(data.coordinators || []);

    const event = await Event.create({
        title: data.title,
        description: data.description,
        coordinators: coordinatorIds,
        createdBy: adminId
    });

    await event.populate('coordinators', 'name email role isApproved');

    return event;
};

const getAllEvents = async () => {
    return Event.find()
        .populate('coordinators', 'name email role isApproved')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 });
};

const getEventById = async (eventId) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await populateEvent(Event.findById(eventId));

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    return event;
};

const updateEvent = async (eventId, data) => {
    ensureAllowedFields(
        data,
        ADMIN_EVENT_FIELDS,
        'Admin can only update title, description and coordinators'
    );

    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    applyEventFields(event, data);

    if (Object.prototype.hasOwnProperty.call(data, 'coordinators')) {
        event.coordinators = await validateApprovedCoordinators(data.coordinators);
    }

    const updatedEvent = await event.save();
    await updatedEvent.populate('coordinators', 'name email role isApproved');

    return updatedEvent;
};

const deleteEvent = async (eventId) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    await Promise.all([
        Registration.deleteMany({ event: event._id }),
        Team.deleteMany({ event: event._id }),
        Certificate.deleteMany({ event: event._id })
    ]);

    await event.deleteOne();
};

const getAllCoordinators = async () => {
    return User.find({ role: ROLES.COORDINATOR })
        .select('-password')
        .sort({ createdAt: -1 });
};

const getPendingCoordinators = async () => {
    return User.find({
        role: ROLES.COORDINATOR,
        isApproved: { $ne: true }
    })
        .select('-password')
        .sort({ createdAt: -1 });
};

const approveCoordinator = async (coordinatorId) => {
    assertObjectId(coordinatorId, 'Invalid coordinator id');

    const coordinator = await User.findOne({
        _id: coordinatorId,
        role: ROLES.COORDINATOR
    }).select('-password');

    if (!coordinator) {
        throw new AppError('Coordinator not found', 404);
    }

    coordinator.isApproved = true;
    await coordinator.save();

    return coordinator;
};

const assignCoordinatorsToEvent = async (eventId, coordinators = []) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    event.coordinators = await validateApprovedCoordinators(coordinators);
    const updatedEvent = await event.save();

    await updatedEvent.populate('coordinators', 'name email role isApproved');

    return updatedEvent;
};

const getAssignedEvent = async (eventId, coordinatorId) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findOne({
        _id: eventId,
        coordinators: coordinatorId
    });

    if (!event) {
        throw new AppError('Event not found or not assigned to coordinator', 403);
    }

    return event;
};

const getAssignedEvents = async (coordinatorId) => {
    return Event.find({ coordinators: coordinatorId })
        .populate('coordinators', 'name email role isApproved')
        .sort({ createdAt: -1 });
};

const getAssignedEventById = async (eventId, coordinatorId) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    await event.populate('coordinators', 'name email role isApproved');
    await event.populate('configOwner', 'name email role');
    await event.populate('participants', 'name email gender');
    await event.populate('teams');
    await event.populate('winners', 'name email gender');
    await event.populate('results.winner', 'name email gender');
    await event.populate('results.runnerUp', 'name email gender');
    await event.populate('results.top3', 'name email gender');

    return event;
};

const configureAssignedEvent = async (eventId, coordinatorId, data) => {
    ensureAllowedFields(
        data,
        COORDINATOR_CONFIG_FIELDS,
        'Coordinator can only update event configuration fields'
    );

    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.configOwner && String(event.configOwner) !== String(coordinatorId)) {
        throw new AppError('Only the configuration owner can update this event', 403);
    }

    const nextConfig = {
        participationType: hasOwn(data, 'participationType') ? data.participationType : event.participationType,
        maxTeamSize: hasOwn(data, 'maxTeamSize') ? Number(data.maxTeamSize) : Number(event.maxTeamSize || 0),
        totalSlots: hasOwn(data, 'totalSlots') ? Number(data.totalSlots) : Number(event.totalSlots || 0),
        genderSpecification: buildGenderSpecification(event.genderSpecification, data.genderSpecification || {}),
        registrationStartDate: hasOwn(data, 'registrationStartDate') ? data.registrationStartDate : event.registrationStartDate,
        registrationEndDate: hasOwn(data, 'registrationEndDate') ? data.registrationEndDate : event.registrationEndDate,
        eventDate: hasOwn(data, 'eventDate') ? data.eventDate : event.eventDate
    };

    validateConfigDates(nextConfig);

    if (!nextConfig.participationType) {
        throw new AppError('Participation type is required', 400);
    }

    if (!nextConfig.registrationStartDate || !nextConfig.registrationEndDate || !nextConfig.eventDate) {
        throw new AppError('Registration start date, registration end date and event date are required', 400);
    }

    if (!nextConfig.genderSpecification.enabled) {
        nextConfig.genderSpecification.type = 'none';
        nextConfig.genderSpecification.minCount = 0;
        nextConfig.genderSpecification.reservedSlots = 0;
    }

    if (nextConfig.participationType === 'team') {
        if (!Number.isInteger(nextConfig.maxTeamSize) || nextConfig.maxTeamSize <= 0) {
            throw new AppError('Max team size must be greater than 0 for team events', 400);
        }

        if (nextConfig.genderSpecification?.enabled) {
            if (!['male', 'female'].includes(nextConfig.genderSpecification.type)) {
                throw new AppError('Team gender specification type must be male or female', 400);
            }

            if (
                !Number.isInteger(nextConfig.genderSpecification.minCount)
                || nextConfig.genderSpecification.minCount <= 0
                || nextConfig.genderSpecification.minCount > nextConfig.maxTeamSize
            ) {
                throw new AppError('Team gender minCount must be between 1 and maxTeamSize', 400);
            }
        }

        nextConfig.totalSlots = 0;
        nextConfig.genderSpecification.reservedSlots = 0;
        if (!nextConfig.genderSpecification.enabled) {
            nextConfig.genderSpecification.minCount = 0;
        }
    }

    if (nextConfig.participationType === 'individual') {
        if (!Number.isInteger(nextConfig.totalSlots) || nextConfig.totalSlots <= 0) {
            throw new AppError('Total slots must be greater than 0 for individual events', 400);
        }

        if (nextConfig.genderSpecification?.enabled) {
            if (!['male', 'female'].includes(nextConfig.genderSpecification.type)) {
                throw new AppError('Individual gender specification type must be male or female', 400);
            }

            if (
                !Number.isInteger(nextConfig.genderSpecification.reservedSlots)
                || nextConfig.genderSpecification.reservedSlots < 0
                || nextConfig.genderSpecification.reservedSlots > nextConfig.totalSlots
            ) {
                throw new AppError('Reserved slots must be between 0 and totalSlots', 400);
            }
        }

        nextConfig.maxTeamSize = 0;
        nextConfig.genderSpecification.minCount = 0;
        if (!nextConfig.genderSpecification.enabled) {
            nextConfig.genderSpecification.reservedSlots = 0;
        }
    }

    event.participationType = nextConfig.participationType;
    event.maxTeamSize = nextConfig.maxTeamSize;
    event.totalSlots = nextConfig.totalSlots;
    event.genderSpecification = nextConfig.genderSpecification;
    event.registrationStartDate = nextConfig.registrationStartDate;
    event.registrationEndDate = nextConfig.registrationEndDate;
    event.eventDate = nextConfig.eventDate;
    event.configOwner = event.configOwner || coordinatorId;

    return event.save();
};

const getEventParticipants = async (eventId, coordinatorId, filters = {}) => {
    await getAssignedEvent(eventId, coordinatorId);

    const query = {
        event: eventId,
        status: 'registered'
    };

    let registrations = await Registration.find(query)
        .populate('user', 'name email gender role')
        .populate('team', 'name members')
        .sort({ createdAt: -1 });

    if (filters.gender) {
        registrations = registrations.filter((registration) => {
            return registration.user && registration.user.gender === filters.gender;
        });
    }

    if (filters.search) {
        const search = String(filters.search).toLowerCase();
        registrations = registrations.filter((registration) => {
            const name = registration.user?.name || '';
            const email = registration.user?.email || '';

            return name.toLowerCase().includes(search) || email.toLowerCase().includes(search);
        });
    }

    return registrations;
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getAllCoordinators,
    getPendingCoordinators,
    approveCoordinator,
    assignCoordinatorsToEvent,
    getAssignedEvent,
    getAssignedEvents,
    getAssignedEventById,
    configureAssignedEvent,
    getEventParticipants,
    validateApprovedCoordinators
};
