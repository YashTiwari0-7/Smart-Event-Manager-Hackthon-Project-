const Certificate = require('../models/certificateModel');
const AppError = require('../utils/appError');
const { assertObjectId } = require('../utils/validators');

const CERTIFICATE_TYPES = ['participation', 'achievement'];

const buildCertificateUrl = ({ userId, eventId, type }) => {
    return `/certificates/${eventId}/${userId}/${type}`;
};

const generateCertificate = async ({ userId, eventId, type }) => {
    if (!CERTIFICATE_TYPES.includes(type)) {
        throw new AppError('Invalid certificate type', 400);
    }

    const url = buildCertificateUrl({ userId, eventId, type });

    return Certificate.findOneAndUpdate(
        {
            user: userId,
            event: eventId,
            type
        },
        { url },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    )
        .populate('user', 'name email role')
        .populate('event', 'title participationType');
};

const generateCertificatesForUsers = async ({ userIds, eventId, type }) => {
    const uniqueUserIds = [...new Set(userIds.map((id) => String(id)))];

    return Promise.all(
        uniqueUserIds.map((userId) => generateCertificate({ userId, eventId, type }))
    );
};

const getUserCertificates = async (userId) => {
    return Certificate.find({ user: userId })
        .populate('event', 'title participationType')
        .sort({ createdAt: -1 });
};

const getUserCertificateById = async ({ certificateId, userId }) => {
    assertObjectId(certificateId, 'Invalid certificate id');

    const certificate = await Certificate.findOne({
        _id: certificateId,
        user: userId
    }).populate('event', 'title participationType');

    if (!certificate) {
        throw new AppError('Certificate not found', 404);
    }

    return certificate;
};

const downloadCertificate = async ({ eventId, userId, requestedUserId, type }) => {
    assertObjectId(eventId, 'Invalid certificate reference');
    assertObjectId(userId, 'Invalid certificate reference');

    if (String(requestedUserId) !== String(userId)) {
        throw new AppError('Access denied', 403);
    }

    const certificate = await Certificate.findOne({
        event: eventId,
        user: userId,
        type
    }).populate('event', 'title participationType');

    if (!certificate) {
        throw new AppError('Certificate not found', 404);
    }

    return certificate;
};

module.exports = {
    generateCertificate,
    generateCertificatesForUsers,
    getUserCertificates,
    getUserCertificateById,
    downloadCertificate
};
