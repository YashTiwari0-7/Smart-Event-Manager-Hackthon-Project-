const Certificate = require('../models/certificateModel');
const AppError = require('../utils/appError');
const { assertObjectId } = require('../utils/validators');

const CERTIFICATE_TYPES = ['participation', 'achievement'];

const buildCertificateUrl = ({ userId, eventId, type }) => {
    return `/certificates/${eventId}/${userId}/${type}`;
};

const generateCertificate = async ({ userId, eventId, type, rank }) => {
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
        { url, rank },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    )
        .populate('user', 'name email role')
        .populate('event', 'title participationType');
};

const generateCertificatesForUsers = async ({ usersWithRanks, eventId, type }) => {
    // usersWithRanks: [{ userId, rank }]
    return Promise.all(
        usersWithRanks.map(({ userId, rank }) => generateCertificate({ userId, eventId, type, rank }))
    );
};

const getUserCertificates = async (userId) => {
    return Certificate.find({ user: userId })
        .populate('event', 'title participationType eventDate')
        .sort({ createdAt: -1 });
};

const getUserCertificateById = async ({ certificateId, userId }) => {
    assertObjectId(certificateId, 'Invalid certificate id');

    const certificate = await Certificate.findOne({
        _id: certificateId,
        user: userId
    }).populate('event', 'title participationType eventDate');

    if (!certificate) {
        throw new AppError('Certificate not found', 404);
    }

    return certificate;
};

const downloadCertificatePDF = async ({ eventId, userId, type }) => {
    const certificate = await Certificate.findOne({
        event: eventId,
        user: userId,
        type
    }).populate('user', 'name').populate('event', 'title eventDate');

    if (!certificate) {
        throw new AppError('Certificate not found', 404);
    }

    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 0
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Drawing a border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#1e1b4b');
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#7c3aed');

        // Certificate Title
        doc.moveDown(4);
        doc.font('Helvetica-Bold').fontSize(40).fillColor('#1e1b4b').text(
            type === 'achievement' ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION',
            { align: 'center' }
        );

        doc.moveDown(1);
        doc.font('Helvetica').fontSize(18).fillColor('#4b5563').text('This is to certify that', { align: 'center' });
        
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(32).fillColor('#7c3aed').text(certificate.user.name, { align: 'center' });
        
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(18).fillColor('#4b5563').text(
            type === 'achievement' 
                ? `has successfully achieved ${certificate.rank || 'a top position'} in the event`
                : 'has successfully participated in the event',
            { align: 'center' }
        );

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#1e1b4b').text(certificate.event.title, { align: 'center' });

        doc.moveDown(2);
        const date = certificate.event.eventDate ? new Date(certificate.event.eventDate).toLocaleDateString() : new Date().toLocaleDateString();
        doc.font('Helvetica').fontSize(14).fillColor('#6b7280').text(`Date: ${date}`, { align: 'center' });

        // Footer signatures or badges
        doc.moveDown(2);
        doc.fontSize(12).text('_________________________', 150, 480);
        doc.text('Event Coordinator', 150, 500);

        doc.text('_________________________', doc.page.width - 300, 480);
        doc.text('SMART Event Manager', doc.page.width - 300, 500);

        doc.end();
    });
};

module.exports = {
    generateCertificate,
    generateCertificatesForUsers,
    getUserCertificates,
    getUserCertificateById,
    downloadCertificatePDF
};
