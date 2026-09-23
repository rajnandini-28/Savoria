// Lightweight file upload handler middleware
const uploadSingle = (fieldName = 'image') => {
    return (req, res, next) => {
        // Mock or buffer pass-through for file uploads
        if (!req.body[fieldName] && !req.file) {
            req.body[fieldName] = req.body.image || '/assets/dishes/awadhi_nalli_nihari_1789900162831.jpg';
        }
        next();
    };
};

module.exports = {
    uploadSingle
};
